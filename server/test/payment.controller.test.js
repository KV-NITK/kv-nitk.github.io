import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import { fakeRes } from "./helpers/fakeSupabase.js";
import { importSrc, mockModule } from "./helpers/mocks.js";

const { PaymentError } = await importSrc("services/payment.error.js");

const calls = { createPayment: [], quoteOrder: [], getPaymentStatus: [], listUserPayments: [] };
const impl = {};

mockModule("services/payment.service.js", {
  createPayment: async (args) => (calls.createPayment.push(args), impl.createPayment(args)),
  getPaymentStatus: async (...args) => (calls.getPaymentStatus.push(args), impl.getPaymentStatus(...args)),
  listUserPayments: async (...args) => (calls.listUserPayments.push(args), impl.listUserPayments(...args)),
});
mockModule("services/pricing.service.js", {
  quoteOrder: async (args) => (calls.quoteOrder.push(args), impl.quoteOrder(args)),
  listProducts: async () => impl.listProducts(),
});

const {
  createPaymentController,
  quoteOrderController,
  listProductsController,
  listMyPaymentsController,
  getPaymentController,
} = await importSrc("controllers/payment.controller.js");
const { createPaymentSchema, quoteOrderSchema } = await importSrc("validators/payment.validator.js");

const user = { irisId: "2310113", name: "Abhijith", email: "a@example.com" };
const validBody = {
  items: [{ productId: "tee-m", quantity: 2 }],
  couponCode: "SAVE10",
  customerPhone: "9876543210",
  idempotencyKey: "key-1",
};

const silence = () => mock.method(console, "error", () => {});

describe("payment validators", () => {
  it("accepts a valid checkout and trims text", () => {
    const parsed = createPaymentSchema.parse({ ...validBody, couponCode: "  SAVE10 ", idempotencyKey: " key " });
    assert.equal(parsed.couponCode, "SAVE10");
    assert.equal(parsed.idempotencyKey, "key");
  });

  it("strips fields the client must not control (amount, purpose, user)", () => {
    const parsed = createPaymentSchema.parse({ ...validBody, amount: 1, purpose: "FREE", userIrisId: "someone", unitPrice: 1 });
    for (const key of ["amount", "purpose", "userIrisId", "unitPrice"]) assert.ok(!(key in parsed), key);
  });

  for (const [name, patch] of [
    ["missing idempotency key", { idempotencyKey: undefined }],
    ["blank idempotency key", { idempotencyKey: "   " }],
    ["overlong idempotency key", { idempotencyKey: "x".repeat(129) }],
    ["empty cart", { items: [] }],
    ["no cart", { items: undefined }],
    ["more than 20 lines", { items: Array.from({ length: 21 }, (_, i) => ({ productId: `p${i}`, quantity: 1 })) }],
    ["fractional quantity", { items: [{ productId: "a", quantity: 1.5 }] }],
    ["zero quantity", { items: [{ productId: "a", quantity: 0 }] }],
    ["string quantity", { items: [{ productId: "a", quantity: "2" }] }],
    ["huge quantity", { items: [{ productId: "a", quantity: 101 }] }],
    ["blank product id", { items: [{ productId: " ", quantity: 1 }] }],
    ["overlong coupon", { couponCode: "x".repeat(33) }],
    ["short phone", { customerPhone: "98765" }],
    ["phone starting with 5", { customerPhone: "5876543210" }],
    ["phone with letters", { customerPhone: "98765abcde" }],
    ["phone with country code", { customerPhone: "+919876543210" }],
  ]) {
    it(`rejects ${name}`, () => assert.equal(createPaymentSchema.safeParse({ ...validBody, ...patch }).success, false));
  }

  it("allows no coupon, null coupon and a quote without phone or key", () => {
    assert.ok(createPaymentSchema.safeParse({ ...validBody, couponCode: undefined }).success);
    assert.ok(createPaymentSchema.safeParse({ ...validBody, couponCode: null }).success);
    assert.ok(quoteOrderSchema.safeParse({ items: validBody.items }).success);
  });
});

describe("payment controller", () => {
  beforeEach(() => {
    for (const k of Object.keys(calls)) calls[k] = [];
    for (const k of Object.keys(impl)) delete impl[k];
    process.env.FRONTEND_URL = "http://site:5173";
    delete process.env.CASHFREE_RETURN_URL;
  });

  describe("create payment", () => {
    it("passes the logged-in user's identity, never one from the body, and no amount", async () => {
      impl.createPayment = async () => ({ paymentId: "p1", status: "PENDING" });
      const res = fakeRes();

      await createPaymentController({ user, body: { ...validBody, amount: 1, userIrisId: "attacker", customerName: "x", customerEmail: "x@x" } }, res);

      assert.equal(res.statusCode, 201);
      assert.deepEqual(res.body, { success: true, payment: { paymentId: "p1", status: "PENDING" } });

      const [args] = calls.createPayment;
      assert.equal(args.userIrisId, "2310113");
      assert.equal(args.customerName, "Abhijith");
      assert.equal(args.customerEmail, "a@example.com");
      assert.equal(args.customerPhone, "9876543210");
      assert.equal(args.idempotencyKey, "key-1");
      assert.equal(args.couponCode, "SAVE10");
      assert.equal(args.returnUrl, "http://site:5173/payment/status?order_id={order_id}");
      assert.ok(!("amount" in args));
    });

    it("answers 400 with field errors for an invalid body and does not call the service", async () => {
      const res = fakeRes();
      await createPaymentController({ user, body: { ...validBody, items: [] } }, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.fieldErrors.items);
      assert.equal(calls.createPayment.length, 0);
    });

    it("shows a PaymentError's message and status to the client", async () => {
      impl.createPayment = async () => {
        throw new PaymentError("Coupon has expired", 400);
      };
      const res = fakeRes();
      await createPaymentController({ user, body: validBody }, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, "Coupon has expired");

      impl.createPayment = async () => {
        throw new PaymentError("start a new checkout", 409);
      };
      const conflict = fakeRes();
      await createPaymentController({ user, body: validBody }, conflict);
      assert.equal(conflict.statusCode, 409);
    });

    it("hides internal errors behind a generic 500", async () => {
      silence();
      impl.createPayment = async () => {
        throw new Error('duplicate key value violates unique constraint "payments_pkey" (secret detail)');
      };
      const res = fakeRes();
      await createPaymentController({ user, body: validBody }, res);

      assert.equal(res.statusCode, 500);
      assert.ok(!JSON.stringify(res.body).includes("secret detail"));
      assert.match(res.body.message, /try again/i);
      mock.restoreAll();
    });
  });

  describe("quote", () => {
    it("returns the server quote for the logged-in user", async () => {
      impl.quoteOrder = async () => ({ total: 600 });
      const res = fakeRes();
      await quoteOrderController({ user, body: { items: validBody.items, couponCode: "SAVE10" } }, res);

      assert.deepEqual(res.body, { success: true, quote: { total: 600 } });
      assert.equal(calls.quoteOrder[0].userIrisId, "2310113");
      assert.equal(calls.quoteOrder[0].couponCode, "SAVE10");
    });

    it("rejects an invalid cart with 400 and surfaces coupon errors", async () => {
      const invalid = fakeRes();
      await quoteOrderController({ user, body: { items: [{ productId: "a", quantity: 0 }] } }, invalid);
      assert.equal(invalid.statusCode, 400);

      impl.quoteOrder = async () => {
        throw new PaymentError("Invalid coupon code");
      };
      const res = fakeRes();
      await quoteOrderController({ user, body: { items: validBody.items, couponCode: "NOPE" } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, "Invalid coupon code");
    });
  });

  describe("catalog and orders", () => {
    it("lists products", async () => {
      impl.listProducts = async () => [{ id: "tee-m" }];
      const res = fakeRes();
      await listProductsController({}, res);
      assert.deepEqual(res.body, { success: true, products: [{ id: "tee-m" }] });
    });

    it("lists only the logged-in user's orders", async () => {
      impl.listUserPayments = async () => [{ paymentId: "p1" }];
      const res = fakeRes();
      await listMyPaymentsController({ user }, res);

      assert.deepEqual(calls.listUserPayments[0], ["2310113"]);
      assert.deepEqual(res.body.payments, [{ paymentId: "p1" }]);
    });

    it("looks up an order for its owner", async () => {
      impl.getPaymentStatus = async () => ({ status: "SUCCESS" });
      const id = "123e4567-e89b-12d3-a456-426614174000";
      const res = fakeRes();
      await getPaymentController({ user, params: { id } }, res);

      assert.deepEqual(calls.getPaymentStatus[0], [id, "2310113"]);
      assert.equal(res.body.payment.status, "SUCCESS");
    });

    it("answers 404 for an id that is not a uuid, without touching the database", async () => {
      const res = fakeRes();
      await getPaymentController({ user, params: { id: "not-a-uuid" } }, res);

      assert.equal(res.statusCode, 404);
      assert.equal(calls.getPaymentStatus.length, 0);
    });

    it("passes a service 404 through", async () => {
      impl.getPaymentStatus = async () => {
        throw new PaymentError("Payment not found", 404);
      };
      const res = fakeRes();
      await getPaymentController({ user, params: { id: "123e4567-e89b-12d3-a456-426614174000" } }, res);
      assert.equal(res.statusCode, 404);
    });

    it("hides internal errors when listing fails", async () => {
      silence();
      impl.listUserPayments = async () => {
        throw new Error("connection refused 10.0.0.5");
      };
      const res = fakeRes();
      await listMyPaymentsController({ user }, res);
      assert.equal(res.statusCode, 500);
      assert.ok(!JSON.stringify(res.body).includes("10.0.0.5"));
      mock.restoreAll();
    });
  });
});
