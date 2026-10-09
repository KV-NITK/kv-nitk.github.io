import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, product, coupon } from "./helpers/fakeSupabase.js";
import { mockSupabase, mockCashfreeService, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const cf = {
  orderCalls: [],
  createCashfreeOrder: async (args) => {
    cf.orderCalls.push(args);
    return { order_id: args.orderId, payment_session_id: `session_${args.orderId}` };
  },
  getCashfreePayments: async () => [],
};
mockCashfreeService(cf);

const { createPayment, getPaymentStatus, listUserPayments } = await importSrc("services/payment.service.js");

const ago = (seconds) => new Date(Date.now() - seconds * 1000).toISOString();

const base = {
  userIrisId: "u1",
  customerName: "Test User",
  customerEmail: "t@example.com",
  customerPhone: "9876543210",
  items: [{ productId: "tee", quantity: 2 }],
  returnUrl: "http://site/payment/status?order_id={order_id}",
  idempotencyKey: "key-1",
};

const reset = (extra = {}) => {
  db.rows("payments").splice(0, Infinity);
  db.rows("payment_events").splice(0, Infinity);
  db.rows("payment_products").splice(0, Infinity, product("tee", 300), product("cap", 150));
  db.rows("payment_coupons").splice(0, Infinity, ...(extra.coupons || []));
  cf.orderCalls = [];
  cf.createCashfreeOrder = async (args) => {
    cf.orderCalls.push(args);
    return { order_id: args.orderId, payment_session_id: `session_${args.orderId}` };
  };
  cf.getCashfreePayments = async () => [];
  process.env.CASHFREE_WEBHOOK_URL = "https://site/api/payments/webhook/cashfree";
};

const rejects = (promise, message, statusCode) =>
  assert.rejects(promise, (e) => e.name === "PaymentError" && e.message.includes(message) && (statusCode ? e.statusCode === statusCode : true));

describe("createPayment", () => {
  beforeEach(() => reset());

  describe("input checks", () => {
    for (const [field, message, statusCode] of [
      ["idempotencyKey", "Idempotency key is required", 400],
      ["userIrisId", "User identity is required", 401],
      ["customerName", "Customer name is required", 400],
      ["customerEmail", "Customer email is required", 400],
      ["customerPhone", "Customer phone is required", 400],
    ]) {
      it(`requires ${field}`, async () => {
        await rejects(createPayment({ ...base, [field]: "" }), message, statusCode);
        assert.equal(db.rows("payments").length, 0);
        assert.equal(cf.orderCalls.length, 0);
      });
    }
  });

  it("creates a PENDING order priced by the server and stores the breakdown", async () => {
    const result = await createPayment(base);

    assert.equal(result.status, "PENDING");
    assert.equal(result.amount, 600);
    assert.equal(result.currency, "INR");
    assert.match(result.orderId, /^pay_/);
    assert.equal(result.paymentSessionId, `session_${result.orderId}`);

    const [row] = db.rows("payments");
    assert.equal(row.amount, 600);
    assert.equal(row.subtotal_amount, 600);
    assert.equal(row.discount_amount, 0);
    assert.equal(row.coupon_code, null);
    assert.equal(row.user_iris_id, "u1");
    assert.equal(row.idempotency_key, "key-1");
    assert.equal(row.items[0].productId, "tee");
    assert.equal(row.items[0].unitPrice, 300);
    assert.equal(row.provider_payment_session_id, result.paymentSessionId);
  });

  it("sends Cashfree the server total, the notify url and the idempotency key", async () => {
    await createPayment(base);

    const [call] = cf.orderCalls;
    assert.equal(call.amount, 600);
    assert.equal(call.customerId, "u1");
    assert.equal(call.customerPhone, "9876543210");
    assert.equal(call.returnUrl, base.returnUrl);
    assert.equal(call.notifyUrl, "https://site/api/payments/webhook/cashfree");
    assert.equal(call.idempotencyKey, "key-1");
  });

  it("ignores an amount supplied by the caller", async () => {
    const result = await createPayment({ ...base, amount: 1, purpose: "STORE_ORDER" });
    assert.equal(result.amount, 600);
    assert.equal(cf.orderCalls[0].amount, 600);
  });

  it("applies a coupon and records it", async () => {
    reset({ coupons: [coupon("SAVE50", { discount_value: 50 })] });
    const result = await createPayment({ ...base, couponCode: "save50" });

    assert.equal(result.amount, 550);
    const [row] = db.rows("payments");
    assert.equal(row.discount_amount, 50);
    assert.equal(row.coupon_code, "SAVE50");
    assert.equal(row.subtotal_amount, 600);
  });

  it("rejects a bad cart before anything is stored or sent", async () => {
    await rejects(createPayment({ ...base, items: [{ productId: "ghost", quantity: 1 }] }), "not available", 400);
    assert.equal(db.rows("payments").length, 0);
    assert.equal(cf.orderCalls.length, 0);
  });

  describe("idempotency", () => {
    it("returns the same order for the same key, user and cart without calling Cashfree again", async () => {
      const first = await createPayment(base);
      const second = await createPayment(base);

      assert.deepEqual(second, first);
      assert.equal(db.rows("payments").length, 1);
      assert.equal(cf.orderCalls.length, 1);
    });

    it("treats reordered and split lines as the same cart", async () => {
      const first = await createPayment({ ...base, items: [{ productId: "tee", quantity: 1 }, { productId: "cap", quantity: 1 }, { productId: "tee", quantity: 1 }] });
      const second = await createPayment({ ...base, items: [{ productId: "cap", quantity: 1 }, { productId: "tee", quantity: 2 }] });
      assert.equal(second.paymentId, first.paymentId);
    });

    it("never hands an order to a different user", async () => {
      await createPayment(base);
      await rejects(createPayment({ ...base, userIrisId: "someone-else" }), "Invalid payment request");
    });

    it("rejects the same key with a different quantity", async () => {
      await createPayment(base);
      await rejects(createPayment({ ...base, items: [{ productId: "tee", quantity: 1 }] }), "different order", 409);
    });

    it("rejects the same key with a different product", async () => {
      await createPayment(base);
      await rejects(createPayment({ ...base, items: [{ productId: "cap", quantity: 2 }] }), "different order", 409);
    });

    it("rejects the same key with an extra line", async () => {
      await createPayment(base);
      await rejects(createPayment({ ...base, items: [...base.items, { productId: "cap", quantity: 1 }] }), "different order", 409);
    });

    it("rejects the same key with a different coupon", async () => {
      reset({ coupons: [coupon("A"), coupon("B")] });
      await createPayment({ ...base, couponCode: "A" });
      await rejects(createPayment({ ...base, couponCode: "B" }), "different order", 409);
    });

    it("accepts a replay of an order stored before items were recorded", async () => {
      db.rows("payments").push({ id: "old", user_iris_id: "u1", idempotency_key: "key-1", status: "PENDING", provider_order_id: "pay_old", provider_payment_session_id: "s", amount: 5, currency: "INR", items: null, created_at: ago(9999) });
      const result = await createPayment(base);
      assert.equal(result.paymentId, "old");
    });

    for (const status of ["FAILED", "CANCELLED"]) {
      it(`does not reuse a ${status} order`, async () => {
        await createPayment(base);
        db.rows("payments")[0].status = status;
        await rejects(createPayment(base), "no longer valid", 409);
      });
    }

    it("replays an order that includes the goodie the server added", async () => {
      db.rows("payment_products").push(product("goodie", 25, { category: "GOODIE" }));
      const first = await createPayment(base);
      const second = await createPayment(base);

      assert.equal(first.amount, 625); // 2 shirts at 300 and the goodie
      assert.equal(db.rows("payments")[0].items.some((i) => i.productId === "goodie"), true);
      assert.deepEqual(second, first);
      assert.equal(db.rows("payments").length, 1);
    });

    it("never stores goodie in payments record for food-only orders", async () => {
      db.rows("payment_products").push(
        product("bhoori-bhojana", 199, { category: "FOOD" }),
        product("goodie", 25, { category: "GOODIE" })
      );
      await createPayment({ ...base, items: [{ productId: "bhoori-bhojana", quantity: 2 }] });
      const storedOrder = db.rows("payments")[0];
      assert.equal(storedOrder.items.some((i) => i.productId === "goodie"), false);
      assert.equal(storedOrder.items.length, 1);
      assert.equal(storedOrder.items[0].productId, "bhoori-bhojana");
    });

    it("stores goodie cleanly in payments record for mixed merch and food orders", async () => {
      db.rows("payment_products").push(
        product("bhoori-bhojana", 199, { category: "FOOD" }),
        product("goodie", 25, { category: "GOODIE" })
      );
      await createPayment({
        ...base,
        items: [
          { productId: "tee", quantity: 1 },
          { productId: "bhoori-bhojana", quantity: 1 },
        ],
      });
      const storedOrder = db.rows("payments")[0];
      const goodieRow = storedOrder.items.find((i) => i.productId === "goodie");
      assert.ok(goodieRow, "Goodie must be stored in mixed order");
      assert.equal(goodieRow.quantity, 1);
      assert.equal(storedOrder.items.some((i) => i.productId === "bhoori-bhojana"), true);
      assert.equal(storedOrder.items.some((i) => i.productId === "tee"), true);
    });

    it("returns an already paid order as SUCCESS so the client can go to the receipt", async () => {
      await createPayment(base);
      db.rows("payments")[0].status = "SUCCESS";
      assert.equal((await createPayment(base)).status, "SUCCESS");
    });

    it("tells a double click that the first request is still in progress", async () => {
      db.rows("payments").push({ id: "x", user_iris_id: "u1", idempotency_key: "key-1", status: "CREATED", provider_order_id: "pay_x", provider_payment_session_id: null, amount: 600, currency: "INR", items: base.items.map((i) => ({ ...i })), created_at: ago(2) });
      await rejects(createPayment(base), "already being created", 409);
    });

    it("rejects an order stuck in CREATED with no Cashfree session", async () => {
      db.rows("payments").push({ id: "x", user_iris_id: "u1", idempotency_key: "key-1", status: "CREATED", provider_order_id: "pay_x", provider_payment_session_id: null, amount: 600, currency: "INR", items: base.items.map((i) => ({ ...i })), created_at: ago(600) });
      await rejects(createPayment(base), "no longer valid", 409);
    });

    it("two simultaneous requests with one key create a single order", async () => {
      const results = await Promise.allSettled([createPayment(base), createPayment(base)]);

      assert.equal(db.rows("payments").length, 1);
      assert.equal(cf.orderCalls.length, 1);
      assert.ok(results.some((r) => r.status === "fulfilled" && r.value.status === "PENDING"));
      // the other one either got the same order or was told to wait, never a second charge
      for (const r of results) {
        if (r.status === "rejected") assert.equal(r.reason.statusCode, 409);
      }
    });
  });

  describe("failures", () => {
    it("marks the order FAILED when Cashfree fails, and a replay is refused", async () => {
      cf.createCashfreeOrder = async () => {
        throw new Error("Failed to create Cashfree order");
      };

      await assert.rejects(createPayment(base), /Failed to create Cashfree order/);

      const [row] = db.rows("payments");
      assert.equal(row.status, "FAILED");
      assert.equal(row.failure_reason, "Failed to create Cashfree order");

      await rejects(createPayment(base), "no longer valid", 409);
    });

    it("allows a fresh key after a failure", async () => {
      cf.createCashfreeOrder = async () => {
        throw new Error("boom");
      };
      await assert.rejects(createPayment(base));

      reset();
      db.rows("payments").push({ id: "dead", user_iris_id: "u1", idempotency_key: "key-1", status: "FAILED", amount: 600 });
      const result = await createPayment({ ...base, idempotencyKey: "key-2" });
      assert.equal(result.status, "PENDING");
    });

    it("marks the order FAILED when saving the Cashfree details fails", async () => {
      db.failNext("payments", "update", { code: "XX", message: "db down" });

      await assert.rejects(createPayment(base), /could not be stored/);
      assert.equal(db.rows("payments")[0].status, "FAILED");
    });

    it("surfaces a database error on insert without calling Cashfree", async () => {
      db.failNext("payments", "insert", { code: "XX", message: "db down" });

      await assert.rejects(createPayment(base), /Failed to create payment/);
      assert.equal(cf.orderCalls.length, 0);
    });
  });

  describe("coupon limits under concurrency", () => {
    it("a max_uses=1 coupon is granted to exactly one of two simultaneous buyers", async () => {
      reset({ coupons: [coupon("ONE", { max_uses: 1, per_user_limit: 5 })] });

      const results = await Promise.allSettled([
        createPayment({ ...base, userIrisId: "a", idempotencyKey: "ka", couponCode: "ONE" }),
        createPayment({ ...base, userIrisId: "b", idempotencyKey: "kb", couponCode: "ONE" }),
      ]);

      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);

      const loser = results.find((r) => r.status === "rejected");
      assert.match(loser.reason.message, /usage limit reached/);

      const live = db.rows("payments").filter((p) => p.coupon_code === "ONE" && p.status !== "FAILED");
      assert.equal(live.length, 1);
      assert.equal(cf.orderCalls.length, 1);
    });

    it("one user with two simultaneous checkouts gets a once-per-user coupon only once", async () => {
      reset({ coupons: [coupon("ONCE", { per_user_limit: 1 })] });

      const results = await Promise.allSettled([
        createPayment({ ...base, idempotencyKey: "k1", couponCode: "ONCE" }),
        createPayment({ ...base, idempotencyKey: "k2", couponCode: "ONCE" }),
      ]);

      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      assert.equal(db.rows("payments").filter((p) => p.coupon_code === "ONCE" && p.status !== "FAILED").length, 1);
    });
  });
});

describe("getPaymentStatus", () => {
  const order = (extra = {}) => ({
    id: "p1", user_iris_id: "u1", status: "PENDING", amount: 600, currency: "INR",
    provider_order_id: "pay_p1", provider_payment_session_id: "sess", provider_payment_id: null,
    items: [{ productId: "tee", quantity: 2 }], subtotal_amount: 600, discount_amount: 0, coupon_code: null,
    paid_at: null, failure_reason: null, created_at: ago(10), ...extra,
  });

  const attempt = (status, extra = {}) => ({ payment_status: status, payment_amount: 600, cf_payment_id: 111, payment_completion_time: "2026-10-02T10:00:00+05:30", ...extra });

  beforeEach(() => {
    reset();
    db.rows("payments").push(order());
  });

  it("answers 'not found' for a missing order and for someone else's order alike", async () => {
    await rejects(getPaymentStatus("nope", "u1"), "Payment not found", 404);
    await rejects(getPaymentStatus("p1", "intruder"), "Payment not found", 404);
  });

  it("returns a SUCCESS order without asking Cashfree", async () => {
    db.rows("payments")[0].status = "SUCCESS";
    cf.getCashfreePayments = async () => {
      throw new Error("must not be called");
    };

    assert.equal((await getPaymentStatus("p1", "u1")).status, "SUCCESS");
  });

  it("does not ask Cashfree about an order that never got a session", async () => {
    db.rows("payments")[0].provider_payment_session_id = null;
    cf.getCashfreePayments = async () => {
      throw new Error("must not be called");
    };

    assert.equal((await getPaymentStatus("p1", "u1")).status, "PENDING");
  });

  it("confirms a paid order and records the Cashfree payment id and time", async () => {
    cf.getCashfreePayments = async () => [attempt("SUCCESS")];

    const view = await getPaymentStatus("p1", "u1");

    assert.equal(view.status, "SUCCESS");
    const [row] = db.rows("payments");
    assert.equal(row.status, "SUCCESS");
    assert.equal(row.provider_payment_id, "111");
    assert.equal(row.paid_at, "2026-10-02T10:00:00+05:30");
    assert.equal(row.failure_reason, null);
  });

  it("prefers a successful attempt over a later pending one", async () => {
    cf.getCashfreePayments = async () => [attempt("SUCCESS"), attempt("PENDING", { cf_payment_id: 222 })];
    assert.equal((await getPaymentStatus("p1", "u1")).status, "SUCCESS");
  });

  it("issues passes for the payment on successful polling fallback", async () => {
    db.rows("payments")[0].items = [{ productId: "tee", name: "Parva T-Shirt", category: "MERCH", variant: "L", quantity: 1 }];
    cf.getCashfreePayments = async () => [attempt("SUCCESS")];
    await getPaymentStatus("p1", "u1");
    const passes = db.rows("claimable_items");
    assert.equal(passes.length, 1);
    assert.equal(passes[0].payment_id, "p1");
    assert.equal(passes[0].category, "MERCH");
    assert.equal(passes[0].variant, "L");
  });

  it("refuses to confirm a payment whose amount differs from the order", async () => {
    cf.getCashfreePayments = async () => [attempt("SUCCESS", { payment_amount: 1 })];

    await assert.rejects(getPaymentStatus("p1", "u1"), /amount mismatch/);
    assert.equal(db.rows("payments")[0].status, "PENDING");
  });

  it("maps FAILED with the reason, and USER_DROPPED to CANCELLED", async () => {
    cf.getCashfreePayments = async () => [attempt("FAILED", { payment_message: "Insufficient funds" })];
    assert.equal((await getPaymentStatus("p1", "u1")).status, "FAILED");
    assert.equal(db.rows("payments")[0].failure_reason, "Insufficient funds");

    db.rows("payments")[0].status = "PENDING";
    cf.getCashfreePayments = async () => [attempt("USER_DROPPED")];
    assert.equal((await getPaymentStatus("p1", "u1")).status, "CANCELLED");
  });

  it("keeps PENDING while Cashfree says pending or has no attempts", async () => {
    cf.getCashfreePayments = async () => [attempt("PENDING")];
    assert.equal((await getPaymentStatus("p1", "u1")).status, "PENDING");

    cf.getCashfreePayments = async () => [];
    assert.equal((await getPaymentStatus("p1", "u1")).status, "PENDING");
  });

  it("ignores statuses it does not know", async () => {
    cf.getCashfreePayments = async () => [attempt("SOMETHING_NEW")];
    assert.equal((await getPaymentStatus("p1", "u1")).status, "PENDING");
  });

  it("falls back to the stored status when Cashfree cannot be reached", async () => {
    cf.getCashfreePayments = async () => {
      throw new Error("network");
    };

    assert.equal((await getPaymentStatus("p1", "u1")).status, "PENDING");
  });

  it("never overwrites a SUCCESS the webhook wrote while the check was running", async () => {
    cf.getCashfreePayments = async () => {
      db.rows("payments")[0].status = "SUCCESS"; // webhook lands in between
      return [attempt("FAILED", { payment_message: "late failure" })];
    };

    const view = await getPaymentStatus("p1", "u1");

    assert.equal(view.status, "SUCCESS");
    assert.equal(db.rows("payments")[0].status, "SUCCESS");
  });

  it("raises an error (not a stale status) when saving the new status fails", async () => {
    cf.getCashfreePayments = async () => [attempt("SUCCESS")];
    db.failNext("payments", "update", { code: "PGRST204", message: "column missing" });

    await assert.rejects(getPaymentStatus("p1", "u1"), /Failed to update payment status/);
  });

  it("includes the order breakdown for the receipt page", async () => {
    db.rows("payments")[0].status = "SUCCESS";
    const view = await getPaymentStatus("p1", "u1");

    assert.deepEqual(Object.keys(view).sort(), ["amount", "couponCode", "createdAt", "currency", "discount", "failureReason", "items", "orderId", "paidAt", "paymentId", "status", "subtotal"]);
    assert.equal(view.items.length, 1);
  });
});

describe("listUserPayments", () => {
  beforeEach(reset);

  it("returns only the user's own orders, newest first, without session ids", async () => {
    db.rows("payments").push(
      { id: "old", user_iris_id: "u1", status: "SUCCESS", amount: 1, currency: "INR", provider_order_id: "pay_old", provider_payment_session_id: "secret", created_at: ago(500) },
      { id: "new", user_iris_id: "u1", status: "PENDING", amount: 2, currency: "INR", provider_order_id: "pay_new", provider_payment_session_id: "secret", created_at: ago(5) },
      { id: "theirs", user_iris_id: "u2", status: "SUCCESS", amount: 3, currency: "INR", provider_order_id: "pay_theirs", created_at: ago(1) }
    );

    const list = await listUserPayments("u1");

    assert.deepEqual(list.map((p) => p.paymentId), ["new", "old"]);
    assert.ok(list.every((p) => !("paymentSessionId" in p)));
    assert.deepEqual(list[0].items, []);
  });

  it("surfaces a database failure", async () => {
    db.failNext("payments", "select", { code: "XX", message: "down" });
    await assert.rejects(listUserPayments("u1"), /Failed to fetch orders/);
  });
});
