-- ==========================================================
-- Food coupons on their own page, one QR pass per coupon. Safe to re-run.
-- ==========================================================

-- 1. One pass per unit: item_index runs across the whole order, so a second
--    issuing of the same order (webhook and status check at once) is refused.
--    Older orders numbered passes per line; renumber them first.
WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY payment_id ORDER BY created_at, id) AS n
    FROM claimable_items
)
UPDATE claimable_items c SET item_index = numbered.n
FROM numbered WHERE c.id = numbered.id AND c.item_index <> numbered.n;

CREATE UNIQUE INDEX IF NOT EXISTS uq_claimable_items_payment_index
    ON claimable_items(payment_id, item_index);

-- 2. The early-bird coupon type the server already uses
ALTER TABLE payment_coupons DROP CONSTRAINT IF EXISTS payment_coupons_discount_type_check;
ALTER TABLE payment_coupons ADD CONSTRAINT payment_coupons_discount_type_check
    CHECK (discount_type IN ('PERCENT', 'FLAT', 'FLAT_PER_ITEM'));

-- 3. The food coupon is on sale (booked only at /parva-26/coupon)
UPDATE payment_products SET active = TRUE WHERE id = 'bhoori-bhojana';
