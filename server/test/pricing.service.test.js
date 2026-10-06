import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, product, coupon } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { quoteOrder, claimCouponSlot, listProducts, normalizeCouponCode } = await importSrc("services/pricing.service.js");

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

const seed = ({ products = [], coupons = [], payments = [] } = {}) => {
  db.rows("payment_products").splice(0, Infinity, ...products);
  db.rows("payment_coupons").splice(0, Infinity, ...coupons);
  db.rows("payments").splice(0, Infinity, ...payments);
};

const rejects = (promise, message, statusCode = 400) =>
  assert.rejects(promise, (e) => e.name === "PaymentError" && e.statusCode === statusCode && e.message.includes(message));

describe("quoteOrder: goodie", () => {
  const goodie = (extra = {}) => product("goodie", 25, { category: "GOODIE", ...extra });
  const tee = [{ productId: "tee", quantity: 2 }];

  beforeEach(() => seed({ products: [product("tee", 329), product("lunch", 60, { category: "FOOD" }), goodie()] }));

  it("adds one goodie at its own price to an order with a shirt", async () => {
    const q = await quoteOrder({ items: tee, userIrisId: "u1" });
    const line = q.items.find((i) => i.productId === "goodie");
    assert.deepEqual([line.quantity, line.unitPrice, line.lineTotal], [1, 25, 25]);
    assert.equal(q.subtotal, 329 * 2 + 25);
    assert.equal(q.total, 329 * 2 + 25);
  });

  it("adds no goodie without a shirt", async () => {
    const q = await quoteOrder({ items: [{ productId: "lunch", quantity: 1 }], userIrisId: "u1" });
    assert.equal(q.items.some((i) => i.productId === "goodie"), false);
    assert.equal(q.total, 60);
  });

  it("leaves the goodie out of every coupon, so it is always full price", async () => {
    seed({
      products: [product("tee", 329), goodie()],
      coupons: [
        coupon("EARLY", { discount_type: "FLAT_PER_ITEM", discount_value: 30 }),
        coupon("PCT", { discount_type: "PERCENT", discount_value: 10 }),
        coupon("BIG", { discount_value: 100000 }),
      ],
    });
    const early = await quoteOrder({ items: tee, couponCode: "EARLY", userIrisId: "u1" });
    assert.equal(early.discount, 60); // 2 shirts, not 3 items
    assert.equal(early.total, 329 * 2 + 25 - 60);
    const pct = await quoteOrder({ items: tee, couponCode: "PCT", userIrisId: "u1" });
    assert.equal(pct.discount, 65.8); // 10% of the shirts only
    const big = await quoteOrder({ items: tee, couponCode: "BIG", userIrisId: "u1" });
    assert.equal(big.discount, 658);
    assert.equal(big.total, 25);
  });

  it("does not let the client put the goodie in the cart", async () => {
    await rejects(quoteOrder({ items: [...tee, { productId: "goodie", quantity: 1 }], userIrisId: "u1" }), "added to your order automatically");
  });

  it("orders without a goodie when its row is missing or switched off", async () => {
    seed({ products: [product("tee", 329)] });
    assert.equal((await quoteOrder({ items: tee, userIrisId: "u1" })).total, 658);
    seed({ products: [product("tee", 329), goodie({ active: false })] });
    assert.equal((await quoteOrder({ items: tee, userIrisId: "u1" })).total, 658);
  });
});

describe("quoteOrder: cart", () => {
  beforeEach(() => seed({ products: [product("tee", 349.1), product("lunch", 60), product("old", 10, { active: false })] }));

  it("prices from the database and merges duplicate lines", async () => {
    const q = await quoteOrder({
      items: [{ productId: "tee", quantity: 3 }, { productId: "tee", quantity: 1 }],
      userIrisId: "u1",
    });

    assert.equal(q.items.length, 1);
    assert.equal(q.items[0].quantity, 4);
    assert.equal(q.subtotal, 1396.4);
    assert.equal(q.total, 1396.4);
    assert.equal(q.discount, 0);
    assert.equal(q.couponCode, null);
  });

  it("has no floating point drift (10.1 * 3 + 20.2 * 3 is 90.89999999999999 in plain floats)", async () => {
    seed({ products: [product("a", 10.1), product("b", 20.2)] });
    const q = await quoteOrder({ items: [{ productId: "a", quantity: 3 }, { productId: "b", quantity: 3 }], userIrisId: "u1" });
    assert.equal(q.total, 90.9);
  });

  it("keeps the variant on each line", async () => {
    seed({ products: [product("tee-m", 100, { variant: "M" })] });
    const q = await quoteOrder({ items: [{ productId: "tee-m", quantity: 1 }], userIrisId: "u1" });
    assert.equal(q.items[0].variant, "M");
  });

  it("ignores any price the client tries to send", async () => {
    const q = await quoteOrder({ items: [{ productId: "lunch", quantity: 1, unitPrice: 1, price: 1, amount: 1 }], userIrisId: "u1" });
    assert.equal(q.total, 60);
  });

  for (const [name, items, message] of [
    ["empty cart", [], "empty"],
    ["not an array", null, "empty"],
    ["unknown product", [{ productId: "ghost", quantity: 1 }], "not available"],
    ["inactive product", [{ productId: "old", quantity: 1 }], "not available"],
    ["over max quantity", [{ productId: "tee", quantity: 6 }], "at most 5"],
    ["max quantity split over two lines", [{ productId: "tee", quantity: 3 }, { productId: "tee", quantity: 3 }], "at most 5"],
    ["fractional quantity", [{ productId: "tee", quantity: 1.5 }], "whole number"],
    ["zero quantity", [{ productId: "tee", quantity: 0 }], "whole number"],
    ["negative quantity", [{ productId: "tee", quantity: -2 }], "whole number"],
    ["string quantity", [{ productId: "tee", quantity: "2" }], "whole number"],
    ["blank product id", [{ productId: "  ", quantity: 1 }], "Invalid cart item"],
    ["too many lines", Array.from({ length: 21 }, (_, i) => ({ productId: `p${i}`, quantity: 1 })), "Too many"],
  ]) {
    it(`rejects ${name}`, () => rejects(quoteOrder({ items, userIrisId: "u1" }), message));
  }

  it("rejects a total below the 1 rupee Cashfree minimum", async () => {
    seed({ products: [product("tiny", 0.5)] });
    await rejects(quoteOrder({ items: [{ productId: "tiny", quantity: 1 }], userIrisId: "u1" }), "at least");
  });
});

describe("quoteOrder: coupons", () => {
  const items = [{ productId: "tee", quantity: 2 }]; // 2 x 300 = 600

  beforeEach(() => seed({ products: [product("tee", 300)] }));

  it("applies a flat coupon, case and whitespace insensitive", async () => {
    seed({ products: [product("tee", 300)], coupons: [coupon("SAVE50", { discount_value: 50 })] });
    const q = await quoteOrder({ items, couponCode: "  save50 ", userIrisId: "u1" });
    assert.equal(q.discount, 50);
    assert.equal(q.total, 550);
    assert.equal(q.couponCode, "SAVE50");
  });

  it("applies a percent coupon and caps it with max_discount", async () => {
    seed({
      products: [product("tee", 300)],
      coupons: [coupon("PCT", { discount_type: "PERCENT", discount_value: 10, max_discount: 50 }), coupon("PCT5", { discount_type: "PERCENT", discount_value: 5, max_discount: 50 })],
    });
    assert.equal((await quoteOrder({ items, couponCode: "PCT", userIrisId: "u1" })).discount, 50); // 60 capped to 50
    assert.equal((await quoteOrder({ items, couponCode: "PCT5", userIrisId: "u1" })).discount, 30);
  });

  it("takes a per-item coupon off every shirt, not once per order", async () => {
    seed({
      products: [product("regular", 329), product("over", 399), product("lunch", 100, { category: "FOOD" })],
      coupons: [coupon("EARLY", { discount_type: "FLAT_PER_ITEM", discount_value: 30 })],
    });
    const cart = [{ productId: "regular", quantity: 2 }, { productId: "over", quantity: 1 }, { productId: "lunch", quantity: 1 }];
    const q = await quoteOrder({ items: cart, couponCode: "early", userIrisId: "u1" });
    assert.equal(q.discount, 90); // 3 shirts x 30; the lunch is not discounted
    assert.equal(q.total, 329 * 2 + 399 + 100 - 90);
    assert.equal((await quoteOrder({ items: [{ productId: "regular", quantity: 1 }], couponCode: "EARLY", userIrisId: "u2" })).total, 299);
    assert.equal((await quoteOrder({ items: [{ productId: "over", quantity: 1 }], couponCode: "EARLY", userIrisId: "u3" })).total, 369);
  });

  it("rounds a percent discount down to whole paise", async () => {
    seed({ products: [product("odd", 3.33)], coupons: [coupon("PCT", { discount_type: "PERCENT", discount_value: 10 })] });
    const q = await quoteOrder({ items: [{ productId: "odd", quantity: 3 }], couponCode: "PCT", userIrisId: "u1" }); // 9.99 -> 0.999 -> 0.99
    assert.equal(q.discount, 0.99);
    assert.equal(q.total, 9);
  });

  it("never discounts more than the subtotal", async () => {
    seed({ products: [product("tee", 300)], coupons: [coupon("BIG", { discount_value: 100000 })] });
    await rejects(quoteOrder({ items, couponCode: "BIG", userIrisId: "u1" }), "at least");
  });

  it("rejects a 100% coupon (Cashfree cannot take a free order)", async () => {
    seed({ products: [product("tee", 300)], coupons: [coupon("FREE", { discount_type: "PERCENT", discount_value: 100 })] });
    await rejects(quoteOrder({ items, couponCode: "FREE", userIrisId: "u1" }), "at least");
  });

  it("gives the same error for unknown and inactive codes", async () => {
    seed({ products: [product("tee", 300)], coupons: [coupon("OFF", { active: false })] });
    await rejects(quoteOrder({ items, couponCode: "NOPE", userIrisId: "u1" }), "Invalid coupon code");
    await rejects(quoteOrder({ items, couponCode: "OFF", userIrisId: "u1" }), "Invalid coupon code");
  });

  it("enforces the validity window", async () => {
    seed({
      products: [product("tee", 300)],
      coupons: [
        coupon("EXPIRED", { valid_until: minutesAgo(5) }),
        coupon("LATER", { valid_from: new Date(Date.now() + 3600e3).toISOString() }),
        coupon("LIVE", { valid_from: minutesAgo(5), valid_until: new Date(Date.now() + 3600e3).toISOString() }),
      ],
    });
    await rejects(quoteOrder({ items, couponCode: "EXPIRED", userIrisId: "u1" }), "expired");
    await rejects(quoteOrder({ items, couponCode: "LATER", userIrisId: "u1" }), "not active yet");
    assert.equal((await quoteOrder({ items, couponCode: "LIVE", userIrisId: "u1" })).discount, 10);
  });

  it("enforces the minimum order amount", async () => {
    seed({ products: [product("tee", 300)], coupons: [coupon("MIN", { min_order_amount: 700 })] });
    await rejects(quoteOrder({ items, couponCode: "MIN", userIrisId: "u1" }), "minimum order of ₹700.00");
  });

  describe("usage limits", () => {
    const used = (user, status, ageMinutes = 1, code = "ONCE") => ({
      id: `${user}-${status}-${ageMinutes}`, user_iris_id: user, coupon_code: code, status, created_at: minutesAgo(ageMinutes),
    });

    it("blocks a user who already paid with the coupon", async () => {
      seed({ products: [product("tee", 300)], coupons: [coupon("ONCE")], payments: [used("u1", "SUCCESS", 5000)] });
      await rejects(quoteOrder({ items, couponCode: "ONCE", userIrisId: "u1" }), "already used");
      assert.equal((await quoteOrder({ items, couponCode: "ONCE", userIrisId: "u2" })).discount, 10);
    });

    it("lets a user use a coupon again up to per_user_limit", async () => {
      seed({ products: [product("tee", 300)], coupons: [coupon("ONCE", { per_user_limit: 2 })], payments: [used("u1", "SUCCESS", 100)] });
      assert.equal((await quoteOrder({ items, couponCode: "ONCE", userIrisId: "u1" })).discount, 10);
    });

    it("counts a recent unpaid checkout, but not an abandoned one", async () => {
      seed({ products: [product("tee", 300)], coupons: [coupon("ONCE")], payments: [used("u1", "PENDING", 5)] });
      await rejects(quoteOrder({ items, couponCode: "ONCE", userIrisId: "u1" }), "already used");

      seed({ products: [product("tee", 300)], coupons: [coupon("ONCE")], payments: [used("u1", "PENDING", 45)] });
      assert.equal((await quoteOrder({ items, couponCode: "ONCE", userIrisId: "u1" })).discount, 10);
    });

    it("does not count failed or cancelled orders", async () => {
      seed({ products: [product("tee", 300)], coupons: [coupon("ONCE")], payments: [used("u1", "FAILED"), used("u1", "CANCELLED")] });
      assert.equal((await quoteOrder({ items, couponCode: "ONCE", userIrisId: "u1" })).discount, 10);
    });

    it("enforces the overall max_uses across users", async () => {
      seed({
        products: [product("tee", 300)],
        coupons: [coupon("ONCE", { max_uses: 2 })],
        payments: [used("a", "SUCCESS", 100), used("b", "SUCCESS", 90)],
      });
      await rejects(quoteOrder({ items, couponCode: "ONCE", userIrisId: "c" }), "usage limit reached");
    });
  });
});

describe("claimCouponSlot (race guard after the order row exists)", () => {
  const row = (id, user, ageMinutes, status = "CREATED", code = "RACE") => ({
    id, user_iris_id: user, coupon_code: code, status, created_at: minutesAgo(ageMinutes),
  });

  it("keeps the earliest max_uses orders and rejects the later ones", async () => {
    seed({ coupons: [coupon("RACE", { max_uses: 1, per_user_limit: 5 })], payments: [row("first", "a", 2), row("second", "b", 1)] });

    await claimCouponSlot({ code: "RACE", paymentId: "first", userIrisId: "a" });
    await rejects(claimCouponSlot({ code: "RACE", paymentId: "second", userIrisId: "b" }), "usage limit reached");
  });

  it("breaks created_at ties by id so both requests agree on the winner", async () => {
    const same = minutesAgo(1);
    seed({
      coupons: [coupon("RACE", { max_uses: 1, per_user_limit: 5 })],
      payments: [{ ...row("b-id", "b", 1), created_at: same }, { ...row("a-id", "a", 1), created_at: same }],
    });

    await claimCouponSlot({ code: "RACE", paymentId: "a-id", userIrisId: "a" });
    await rejects(claimCouponSlot({ code: "RACE", paymentId: "b-id", userIrisId: "b" }), "usage limit reached");
  });

  it("enforces per_user_limit for two simultaneous checkouts by one user", async () => {
    seed({ coupons: [coupon("RACE", { per_user_limit: 1 })], payments: [row("one", "u", 2), row("two", "u", 1)] });

    await claimCouponSlot({ code: "RACE", paymentId: "one", userIrisId: "u" });
    await rejects(claimCouponSlot({ code: "RACE", paymentId: "two", userIrisId: "u" }), "already used");
  });

  it("is happy when within limits", async () => {
    seed({ coupons: [coupon("RACE", { max_uses: 3, per_user_limit: 1 })], payments: [row("one", "a", 3), row("two", "b", 2)] });
    await claimCouponSlot({ code: "RACE", paymentId: "two", userIrisId: "b" });
  });

  it("fails loudly (not silently allows) when the order row cannot be found", async () => {
    seed({ coupons: [coupon("RACE")], payments: [] });
    await assert.rejects(claimCouponSlot({ code: "RACE", paymentId: "ghost", userIrisId: "u" }), /could not be confirmed/);
  });
});

describe("listProducts", () => {
  it("returns only active products in the shape the UI needs", async () => {
    seed({ products: [product("tee-m", 299, { group_key: "tee", variant: "M" }), product("hidden", 5, { active: false })] });
    assert.deepEqual(await listProducts(), [
      { id: "tee-m", name: "Product tee-m", category: "MERCH", groupKey: "tee", fit: null, variant: "M", unitPrice: 299, discount: 0, maxQuantity: 5 },
    ]);
  });
});

describe("normalizeCouponCode", () => {
  it("trims and upper-cases, and treats blanks and non-strings as no coupon", () => {
    assert.equal(normalizeCouponCode("  abc "), "ABC");
    assert.equal(normalizeCouponCode("   "), null);
    assert.equal(normalizeCouponCode(null), null);
    assert.equal(normalizeCouponCode(42), null);
  });
});
