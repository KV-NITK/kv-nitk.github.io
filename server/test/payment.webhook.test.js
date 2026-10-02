import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, mockCashfreeService, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const cf = {
  // stand-in for Cashfree's signature check: it returns the parsed event or throws
  verifyCashfreeWebhook: ({ signature, rawBody }) => {
    if (signature !== "good") throw new Error("Generated signature and received signature did not match.");
    return { object: JSON.parse(rawBody) };
  },
};
mockCashfreeService(cf);

const { cashfreeWebhook } = await importSrc("controllers/payment.webhook.controller.js");

const event = (overrides = {}) => ({
  type: "PAYMENT_SUCCESS_WEBHOOK",
  data: {
    order: { order_id: "pay_p1", order_amount: 600, order_currency: "INR" },
    payment: {
      cf_payment_id: 777,
      payment_status: "SUCCESS",
      payment_amount: 600,
      payment_message: "ok",
      payment_completion_time: "2026-10-02T10:00:00+05:30",
    },
  },
  ...overrides,
});

const send = async (body, { signature = "good", timestamp = "1700000000" } = {}) => {
  const rawBody = typeof body === "string" ? body : JSON.stringify(body);
  const res = fakeRes();
  await cashfreeWebhook(
    { headers: { "x-webhook-signature": signature, "x-webhook-timestamp": timestamp }, rawBody },
    res
  );
  return res;
};

const withData = (patch) => {
  const e = event();
  e.data.payment = { ...e.data.payment, ...(patch.payment || {}) };
  e.data.order = { ...e.data.order, ...(patch.order || {}) };
  if (patch.type) e.type = patch.type;
  return e;
};

const payment = () => db.rows("payments")[0];

describe("cashfree webhook", () => {
  beforeEach(() => {
    db.rows("payments").splice(0, Infinity, {
      id: "p1", user_iris_id: "u1", status: "PENDING", amount: 600, currency: "INR",
      provider_order_id: "pay_p1", provider_payment_id: null, failure_reason: null, paid_at: null,
    });
    db.rows("payment_events").splice(0, Infinity);
  });

  describe("authenticity", () => {
    it("rejects a wrong signature and changes nothing", async () => {
      const res = await send(event(), { signature: "forged" });
      assert.equal(res.statusCode, 400);
      assert.equal(payment().status, "PENDING");
      assert.equal(db.rows("payment_events").length, 0);
    });

    it("rejects a missing signature", async () => {
      const res = fakeRes();
      await cashfreeWebhook({ headers: { "x-webhook-timestamp": "1" }, rawBody: "{}" }, res);
      assert.equal(res.statusCode, 400);
    });

    // header/body presence checks live in cashfree.service (see cashfree.service.test.js)

    it("rejects an empty body", async () => {
      const res = fakeRes();
      await cashfreeWebhook({ headers: { "x-webhook-signature": "good", "x-webhook-timestamp": "1" }, rawBody: undefined }, res);
      assert.equal(res.statusCode, 400);
    });
  });

  describe("payload handling", () => {
    it("acknowledges event types it does not handle", async () => {
      const res = await send({ type: "REFUND_STATUS_WEBHOOK", data: {} });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Webhook ignored");
      assert.equal(payment().status, "PENDING");
    });

    it("rejects an incomplete payment payload", async () => {
      const bad = event();
      delete bad.data.payment.cf_payment_id;
      assert.equal((await send(bad)).statusCode, 400);
      assert.equal((await send({ type: "PAYMENT_SUCCESS_WEBHOOK", data: {} })).statusCode, 400);
    });

    it("answers 404 for an order we do not know", async () => {
      const res = await send(withData({ order: { order_id: "pay_unknown" } }));
      assert.equal(res.statusCode, 404);
    });

    it("answers 500 when the lookup fails so Cashfree retries", async () => {
      db.failNext("payments", "select", { code: "XX", message: "down" });
      assert.equal((await send(event())).statusCode, 500);
    });
  });

  describe("amount and currency validation", () => {
    for (const [name, patch] of [
      ["payment amount", { payment: { payment_amount: 1 } }],
      ["order amount", { order: { order_amount: 1 } }],
      ["currency", { order: { order_currency: "USD" } }],
    ]) {
      it(`rejects a mismatched ${name}`, async () => {
        const res = await send(withData(patch));
        assert.equal(res.statusCode, 400);
        assert.equal(payment().status, "PENDING");
        assert.equal(db.rows("payment_events").length, 0);
      });
    }

    it("accepts the same amount written as a string with decimals", async () => {
      const res = await send(withData({ payment: { payment_amount: "600.00" }, order: { order_amount: "600.00" } }));
      assert.equal(res.statusCode, 200);
      assert.equal(payment().status, "SUCCESS");
    });
  });

  describe("status changes", () => {
    it("marks a successful payment SUCCESS with time and Cashfree id, and stores the event", async () => {
      const res = await send(event());

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Webhook processed successfully");
      assert.equal(payment().status, "SUCCESS");
      assert.equal(payment().provider_payment_id, "777");
      assert.equal(payment().paid_at, "2026-10-02T10:00:00+05:30");
      assert.equal(payment().failure_reason, null);

      const [stored] = db.rows("payment_events");
      assert.equal(stored.payment_id, "p1");
      assert.equal(stored.provider_event_key, "PAYMENT_SUCCESS_WEBHOOK:777");
    });

    it("marks a failed payment FAILED with the reason", async () => {
      await send(withData({ type: "PAYMENT_FAILED_WEBHOOK", payment: { payment_status: "FAILED", payment_message: "Card declined" } }));
      assert.equal(payment().status, "FAILED");
      assert.equal(payment().failure_reason, "Card declined");
    });

    it("marks a dropped payment CANCELLED", async () => {
      await send(withData({ type: "PAYMENT_USER_DROPPED_WEBHOOK", payment: { payment_status: "USER_DROPPED" } }));
      assert.equal(payment().status, "CANCELLED");
    });

    it("lets a later success replace an earlier failed attempt and clears the reason", async () => {
      await send(withData({ type: "PAYMENT_FAILED_WEBHOOK", payment: { cf_payment_id: 1, payment_status: "FAILED", payment_message: "declined" } }));
      await send(withData({ payment: { cf_payment_id: 2 } }));

      assert.equal(payment().status, "SUCCESS");
      assert.equal(payment().failure_reason, null);
      assert.equal(payment().provider_payment_id, "2");
    });

    for (const type of ["PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK"]) {
      it(`never downgrades a SUCCESS payment on ${type} and keeps its payment id`, async () => {
        await send(event());
        const res = await send(withData({ type, payment: { cf_payment_id: 999, payment_status: "FAILED" } }));

        assert.equal(res.statusCode, 200);
        assert.equal(payment().status, "SUCCESS");
        assert.equal(payment().provider_payment_id, "777");
      });
    }
  });

  describe("duplicates and failures", () => {
    it("treats a replayed webhook as already processed and does not touch the payment again", async () => {
      await send(event());
      payment().status = "PENDING"; // a replay must not re-apply the update
      const res = await send(event());

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Webhook already processed");
      assert.equal(payment().status, "PENDING");
      assert.equal(db.rows("payment_events").length, 1);
    });

    it("answers 500 and leaves the payment alone when the event cannot be stored", async () => {
      db.failNext("payment_events", "insert", { code: "XX", message: "down" });

      const res = await send(event());

      assert.equal(res.statusCode, 500);
      assert.equal(payment().status, "PENDING");
    });

    it("rolls the event back when the payment update fails, so Cashfree's retry is processed", async () => {
      db.failNext("payments", "update", { code: "XX", message: "down" });

      const first = await send(event());
      assert.equal(first.statusCode, 500);
      assert.equal(payment().status, "PENDING");
      assert.equal(db.rows("payment_events").length, 0);

      const retry = await send(event());
      assert.equal(retry.statusCode, 200);
      assert.equal(retry.body.message, "Webhook processed successfully");
      assert.equal(payment().status, "SUCCESS");
    });
  });
});
