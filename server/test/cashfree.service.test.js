import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { importSrc } from "./helpers/mocks.js";

const KEYS = ["CASHFREE_CLIENT_ID", "CASHFREE_CLIENT_SECRET", "CASHFREE_ENV"];

describe("cashfree config", () => {
  let saved;

  beforeEach(() => {
    saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("can be imported without any Cashfree variables (a missing key must not stop the server)", async () => {
    for (const k of KEYS) delete process.env[k];

    const config = await importSrc("config/cashfree.js");
    assert.equal(typeof config.getCashfree, "function");

    // and so can the service that uses it
    await importSrc("services/cashfree.service.js");
  });

  it("fails only when a payment actually needs the client", async () => {
    const { getCashfree } = await importSrc("config/cashfree.js");
    for (const k of KEYS) delete process.env[k];

    assert.throws(() => getCashfree(), /Missing CASHFREE_CLIENT_ID/);

    process.env.CASHFREE_CLIENT_ID = "id";
    assert.throws(() => getCashfree(), /Missing CASHFREE_CLIENT_SECRET/);
  });

  it("builds one client once the variables exist, and reuses it", async () => {
    const { getCashfree } = await importSrc("config/cashfree.js");
    process.env.CASHFREE_CLIENT_ID = "id";
    process.env.CASHFREE_CLIENT_SECRET = "test-secret"; // the client is cached, so every test uses the same secret

    const first = getCashfree();
    assert.equal(typeof first.PGCreateOrder, "function");
    assert.equal(getCashfree(), first);
  });
});

describe("verifyCashfreeWebhook", () => {
  const secret = "test-secret";
  let verifyCashfreeWebhook;
  let saved;

  beforeEach(async () => {
    saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
    process.env.CASHFREE_CLIENT_ID = "id";
    process.env.CASHFREE_CLIENT_SECRET = secret;
    ({ verifyCashfreeWebhook } = await importSrc("services/cashfree.service.js"));
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  const sign = (timestamp, rawBody) => crypto.createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  const body = JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK", data: { order: { order_id: "pay_1" } } });

  it("accepts a correctly signed body", () => {
    const result = verifyCashfreeWebhook({ signature: sign("1700000000", body), rawBody: body, timestamp: "1700000000" });
    assert.equal(result.object.type, "PAYMENT_SUCCESS_WEBHOOK");
  });

  it("rejects a wrong signature, a changed body and a changed timestamp", () => {
    const signature = sign("1700000000", body);

    assert.throws(() => verifyCashfreeWebhook({ signature: "AAAA", rawBody: body, timestamp: "1700000000" }));
    assert.throws(() => verifyCashfreeWebhook({ signature, rawBody: body.replace("pay_1", "pay_2"), timestamp: "1700000000" }));
    assert.throws(() => verifyCashfreeWebhook({ signature, rawBody: body, timestamp: "1700000001" }));
  });

  it("rejects a signature made with a different secret", () => {
    const forged = crypto.createHmac("sha256", "attacker").update("1700000000" + body).digest("base64");
    assert.throws(() => verifyCashfreeWebhook({ signature: forged, rawBody: body, timestamp: "1700000000" }));
  });

  for (const [name, args, message] of [
    ["signature", { rawBody: body, timestamp: "1" }, /Missing webhook signature/],
    ["timestamp", { signature: "x", rawBody: body }, /Missing webhook timestamp/],
    ["body", { signature: "x", timestamp: "1" }, /Missing webhook raw body/],
  ]) {
    it(`rejects a missing ${name}`, () => assert.throws(() => verifyCashfreeWebhook(args), message));
  }
});
