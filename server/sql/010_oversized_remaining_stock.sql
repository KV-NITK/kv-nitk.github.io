-- ==========================================================
-- Cap Oversized T-Shirts to Remaining Stock
--   * 2-XXL (tshirt-b-xxl)
--   * 4-XL  (tshirt-b-xl)
--   * 3-S   (tshirt-b-s)
--   * 20-M  (tshirt-b-m)
--   * 5-L   (tshirt-b-l)
--   * 0-XS  (tshirt-b-xs, sold out / disabled immediately)
--
-- Enforces:
--   1. Rejects new order creation if requested quantity > remaining stock.
--   2. Reduces remaining stock upon successful payment (status = 'SUCCESS').
--   3. When remaining stock reaches 0, automatically sets active = false
--      in payment_products, which immediately removes that size from the shop.
--   4. Updates max_quantity so users cannot select more than remaining stock.
-- ==========================================================

-- 1. Table for remaining stock limit per product
CREATE TABLE IF NOT EXISTS merch_remaining_stock (
    product_id TEXT PRIMARY KEY REFERENCES payment_products(id),
    remaining_stock INTEGER NOT NULL CHECK (remaining_stock >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS & permissions
ALTER TABLE merch_remaining_stock ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE merch_remaining_stock TO service_role;

-- 2. Seed / Update the exact remaining stock counts
INSERT INTO merch_remaining_stock (product_id, remaining_stock, updated_at)
VALUES
    ('tshirt-b-xxl', 2,  NOW()),
    ('tshirt-b-xl',  4,  NOW()),
    ('tshirt-b-s',   3,  NOW()),
    ('tshirt-b-m',   20, NOW()),
    ('tshirt-b-l',   5,  NOW()),
    ('tshirt-b-xs',  0,  NOW())
ON CONFLICT (product_id) DO UPDATE
SET remaining_stock = EXCLUDED.remaining_stock,
    updated_at = NOW();

-- 3. Update payment_products:
-- Disable XS immediately (0 remaining stock)
UPDATE payment_products
SET active = false, max_quantity = 1
WHERE id = 'tshirt-b-xs';

-- Cap max_quantity per order to remaining stock (or 5 max)
UPDATE payment_products SET active = true, max_quantity = 2 WHERE id = 'tshirt-b-xxl';
UPDATE payment_products SET active = true, max_quantity = 4 WHERE id = 'tshirt-b-xl';
UPDATE payment_products SET active = true, max_quantity = 3 WHERE id = 'tshirt-b-s';
UPDATE payment_products SET active = true, max_quantity = 5 WHERE id = 'tshirt-b-m';
UPDATE payment_products SET active = true, max_quantity = 5 WHERE id = 'tshirt-b-l';

-- 4. Function: validate remaining stock BEFORE order creation
CREATE OR REPLACE FUNCTION check_merch_remaining_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_item JSONB;
    v_prod_id TEXT;
    v_qty INT;
    v_rem INT;
BEGIN
    IF NEW.items IS NOT NULL AND jsonb_typeof(NEW.items) = 'array' THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
        LOOP
            v_prod_id := v_item->>'productId';
            v_qty := COALESCE((v_item->>'quantity')::INT, 1);

            SELECT remaining_stock INTO v_rem
            FROM merch_remaining_stock
            WHERE product_id = v_prod_id;

            IF v_rem IS NOT NULL THEN
                IF v_rem <= 0 THEN
                    RAISE EXCEPTION 'Item "%" is sold out!', v_prod_id;
                ELSIF v_qty > v_rem THEN
                    RAISE EXCEPTION 'Only % remaining for item "%" (requested %)', v_rem, v_prod_id, v_qty;
                END IF;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Function: deduct remaining stock when payment SUCCESS
CREATE OR REPLACE FUNCTION deduct_merch_remaining_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_item JSONB;
    v_prod_id TEXT;
    v_qty INT;
    v_new_rem INT;
BEGIN
    -- Only deduct when status transitions to SUCCESS
    IF NEW.status = 'SUCCESS' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'SUCCESS') THEN
        IF NEW.items IS NOT NULL AND jsonb_typeof(NEW.items) = 'array' THEN
            FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
            LOOP
                v_prod_id := v_item->>'productId';
                v_qty := COALESCE((v_item->>'quantity')::INT, 1);

                IF EXISTS (SELECT 1 FROM merch_remaining_stock WHERE product_id = v_prod_id) THEN
                    UPDATE merch_remaining_stock
                    SET remaining_stock = GREATEST(0, remaining_stock - v_qty),
                        updated_at = NOW()
                    WHERE product_id = v_prod_id
                    RETURNING remaining_stock INTO v_new_rem;

                    -- If out of stock, mark inactive in catalog immediately
                    IF v_new_rem <= 0 THEN
                        UPDATE payment_products
                        SET active = false
                        WHERE id = v_prod_id;
                    ELSE
                        -- Adjust max_quantity if remaining stock is less than 5
                        UPDATE payment_products
                        SET max_quantity = LEAST(5, v_new_rem)
                        WHERE id = v_prod_id;
                    END IF;
                END IF;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach triggers safely (no DROP commands to prevent Supabase destructive warnings)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_check_merch_remaining_stock'
    ) THEN
        CREATE TRIGGER trg_check_merch_remaining_stock
        BEFORE INSERT ON payments
        FOR EACH ROW
        EXECUTE FUNCTION check_merch_remaining_stock();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_deduct_merch_remaining_stock'
    ) THEN
        CREATE TRIGGER trg_deduct_merch_remaining_stock
        AFTER UPDATE OF status ON payments
        FOR EACH ROW
        WHEN (NEW.status = 'SUCCESS')
        EXECUTE FUNCTION deduct_merch_remaining_stock();
    END IF;
END $$;
