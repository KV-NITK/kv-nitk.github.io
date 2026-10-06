-- ==========================================================
-- Payments: tables, store catalog and coupons
-- ==========================================================
-- Prices live ONLY on the server. The client sends product ids,
-- quantities and an optional coupon code; the server computes the amount.
-- Safe to re-run.
-- ==========================================================

-- ---------- payments / payment_events (used by payment.service.js) ----------

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    user_iris_id TEXT NOT NULL,
    purpose TEXT NOT NULL,
    reference_id TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    provider TEXT NOT NULL,
    provider_order_id TEXT UNIQUE,
    provider_payment_session_id TEXT,
    provider_payment_id TEXT,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'CREATED',
    failure_reason TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    provider_event_key TEXT NOT NULL UNIQUE,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The payments table already existed before this script, without this column.
-- Webhook and status-check updates write it, so they fail without it.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_payment_id TEXT;

-- Order breakdown stored with each payment (snapshot of prices at purchase time)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(10, 2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_code TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_iris_id);
CREATE INDEX IF NOT EXISTS idx_payments_coupon ON payments(coupon_code) WHERE coupon_code IS NOT NULL;

-- ---------- products ----------

CREATE TABLE IF NOT EXISTS payment_products (
    id TEXT PRIMARY KEY,                       -- e.g. 'tshirt', 'food-coupon-lunch'
    name TEXT NOT NULL,
    category TEXT,                             -- 'MERCH', 'FOOD', ...
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    max_quantity INTEGER NOT NULL DEFAULT 10 CHECK (max_quantity > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Variants (e.g. t-shirt sizes): one row per sellable variant, grouped by group_key.
-- Rows sharing a group_key are shown as one product with a choice of variant.
ALTER TABLE payment_products ADD COLUMN IF NOT EXISTS group_key TEXT;
ALTER TABLE payment_products ADD COLUMN IF NOT EXISTS variant TEXT;

-- `fit` is the label shown with a design (regular fit, oversized); `sort_order`
-- is the order rows are listed in (sizes XS to XXL); `discount` is rupees off
-- per unit, stored for early-bird offers and not applied to orders yet.
ALTER TABLE payment_products ADD COLUMN IF NOT EXISTS fit TEXT;
ALTER TABLE payment_products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payment_products ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0);

-- ---------- coupons ----------

CREATE TABLE IF NOT EXISTS payment_coupons (
    code TEXT PRIMARY KEY CHECK (code = UPPER(code)),   -- always stored upper-case
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FLAT')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount NUMERIC(10, 2) CHECK (max_discount > 0),   -- cap for PERCENT coupons (NULL = no cap)
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_uses INTEGER CHECK (max_uses > 0),                  -- total across all users (NULL = unlimited)
    per_user_limit INTEGER NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT percent_coupon_max_100 CHECK (discount_type <> 'PERCENT' OR discount_value <= 100)
);

-- Example rows (edit before running, or insert from the Supabase dashboard):
-- INSERT INTO payment_products (id, name, category, unit_price, max_quantity)
--   VALUES ('tshirt', 'Event T-Shirt', 'MERCH', 349.00, 5);
-- INSERT INTO payment_coupons (code, discount_type, discount_value, max_discount, per_user_limit)
--   VALUES ('WELCOME10', 'PERCENT', 10, 50.00, 1);
