-- ==========================================================
-- List price: the "was" price shown struck through next to unit_price.
-- Display only. unit_price is still what is charged; nothing about
-- payments or coupons reads list_price. Safe to re-run.
-- Run this BEFORE deploying the server that selects it.
-- ==========================================================

ALTER TABLE payment_products ADD COLUMN IF NOT EXISTS list_price NUMERIC(10, 2) CHECK (list_price > 0);

-- Bhoori Bhojana: ₹289, sold at ₹249
UPDATE payment_products SET list_price = 289.00, unit_price = 249.00 WHERE id = 'bhoori-bhojana';
