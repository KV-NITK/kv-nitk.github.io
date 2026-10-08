import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb } from "./helpers/fakeSupabase.js";
import { fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { requireAdminPasscode } = await importSrc("middleware/adminAuth.middleware.js");
const { listOrdersController } = await importSrc("controllers/admin.controller.js");
const { listAllOrders } = await importSrc("services/admin.service.js");

const req = (passcode, ip = "1.1.1.1") => ({ ip, headers: passcode === undefined ? {} : { "x-admin-passcode": passcode } });

// Runs the middleware; returns the response, and whether the request was let through
const run = (r) => {
  const res = fakeRes();
  let passed = false;
  requireAdminPasscode(r, res, () => { passed = true; });
  return { res, passed };
};

describe("admin password", () => {
  let saved;
  beforeEach(() => { saved = process.env.ADMIN_PASSCODE; process.env.ADMIN_PASSCODE = "open-sesame"; });
  afterEach(() => { if (saved === undefined) delete process.env.ADMIN_PASSCODE; else process.env.ADMIN_PASSCODE = saved; });

  it("lets the right password through", () => {
    assert.equal(run(req("open-sesame", "2.2.2.2")).passed, true);
  });

  it("refuses a wrong or missing password with 401", () => {
    for (const given of ["nope", "", undefined]) {
      const { res, passed } = run(req(given, "3.3.3.3"));
      assert.equal(passed, false);
      assert.equal(res.statusCode, 401);
    }
  });

  it("is off, with a 500, when ADMIN_PASSCODE is not set", () => {
    delete process.env.ADMIN_PASSCODE;
    const { res, passed } = run(req("anything", "4.4.4.4"));
    assert.equal(passed, false);
    assert.equal(res.statusCode, 500);
  });

  it("locks an address out after 10 wrong tries, even for the right password, and others are not affected", () => {
    for (let i = 0; i < 10; i++) assert.equal(run(req("wrong", "5.5.5.5")).res.statusCode, 401);
    assert.equal(run(req("open-sesame", "5.5.5.5")).res.statusCode, 429);
    assert.equal(run(req("open-sesame", "6.6.6.6")).passed, true);
  });

  it("a right password clears earlier wrong tries", () => {
    for (let i = 0; i < 9; i++) run(req("wrong", "7.7.7.7"));
    assert.equal(run(req("open-sesame", "7.7.7.7")).passed, true);
    for (let i = 0; i < 9; i++) assert.equal(run(req("wrong", "7.7.7.7")).res.statusCode, 401);
  });
});

describe("admin orders list", () => {
  beforeEach(() => {
    db.rows("payments").splice(0, Infinity,
      { id: "a", provider_order_id: "pay_a", user_iris_id: "u1", status: "SUCCESS", amount: "598.00", subtotal_amount: "658.00", discount_amount: "60.00", coupon_code: "POORVAPAKSHI", items: [{ productId: "tshirt-a-m", name: "T", quantity: 2 }], customer_name: "Asha", customer_email: "a@x.in", customer_phone: "9876543210", created_at: "2026-10-06T10:00:00Z", paid_at: "2026-10-06T10:01:00Z" },
      { id: "b", provider_order_id: "pay_b", user_iris_id: "u2", status: "FAILED", amount: "329.00", items: null, customer_name: null, created_at: "2026-10-06T12:00:00Z" },
    );
  });

  it("returns every order newest first, with the customer details and plain numbers", async () => {
    const orders = await listAllOrders();
    assert.deepEqual(orders.map((o) => o.paymentId), ["b", "a"]);
    const a = orders.find((o) => o.paymentId === "a");
    assert.deepEqual([a.name, a.phone, a.amount, a.subtotal, a.discount, a.couponCode], ["Asha", "9876543210", 598, 658, 60, "POORVAPAKSHI"]);
    const b = orders.find((o) => o.paymentId === "b");
    assert.deepEqual([b.items, b.subtotal, b.discount, b.couponCode, b.name], [[], 329, 0, null, null]);
  });

  it("the controller wraps them as { success, orders }", async () => {
    const res = fakeRes();
    await listOrdersController({}, res);
    assert.equal(res.body.success, true);
    assert.equal(res.body.orders.length, 2);
  });
});
