-- ==========================================================
-- Coupon codes on the photo booth page (/parva-26/photobooth). Safe to re-run.
-- Each coupon is for one page: MERCH codes only work on merch orders and
-- PHOTO codes only on photo booth orders. Every existing coupon stays MERCH.
-- ==========================================================

ALTER TABLE payment_coupons ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'MERCH';
ALTER TABLE payment_coupons DROP CONSTRAINT IF EXISTS payment_coupons_category_check;
ALTER TABLE payment_coupons ADD CONSTRAINT payment_coupons_category_check
    CHECK (category IN ('MERCH', 'PHOTO'));

-- Example (edit before running): ₹10 off every photo session, 100 uses, once per person
-- INSERT INTO payment_coupons (code, category, discount_type, discount_value, max_uses, per_user_limit)
--   VALUES ('CLICK10', 'PHOTO', 'FLAT_PER_ITEM', 10, 100, 1);

-- UCHITACHITRA, "ಉಚಿತ ಚಿತ್ರ": a free picture (and, this being a film hall, a
-- free show). 100% off a photo booth order; the server leaves ₹1 to pay,
-- because Cashfree cannot take a free order. 100 uses, once per person.
INSERT INTO payment_coupons (code, category, discount_type, discount_value, max_uses, per_user_limit)
VALUES ('UCHITACHITRA', 'PHOTO', 'PERCENT', 100, 100, 1)
ON CONFLICT (code) DO NOTHING;
