-- ==========================================================
-- Merch inventory: stock per T-shirt (fit + size) and on-spot sales
--   * merch_stock: the stock the head enters, one row per merch product
--   * merch_spot_sales: shirts sold and handed over on the spot (no online order)
--   * merch_inventory(): stock, given (scanned + spot), to collect, for every merch product
--   * set_merch_stock() / add_merch_spot_sale() / undo_merch_spot_sale()
-- Additive only. Orders, passes, the scanner and payments are NOT changed: a
-- spot sale never creates a pass or a payment.
-- Safe to run more than once.
-- ==========================================================

-- 1. Tables -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS merch_stock (
    product_id TEXT PRIMARY KEY,                -- payment_products.id, e.g. 'tshirt-b-m'
    stock INTEGER NOT NULL CHECK (stock BETWEEN 0 AND 100000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Undo keeps the row (undone_at is set) so the record is never lost
CREATE TABLE IF NOT EXISTS merch_spot_sales (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 100),
    student_name TEXT CHECK (student_name IS NULL OR char_length(student_name) BETWEEN 1 AND 80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    undone_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_merch_spot_sales_product ON merch_spot_sales(product_id);

ALTER TABLE merch_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_stock FORCE ROW LEVEL SECURITY;
ALTER TABLE merch_spot_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_spot_sales FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE merch_stock FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE merch_stock TO service_role;
REVOKE ALL ON TABLE merch_spot_sales FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE merch_spot_sales TO service_role;

-- 2. Inventory --------------------------------------------------------
-- rows: every merch product, in catalog order, with
--   stock      what the head entered (null = not entered yet)
--   claimed    passes handed out by scanning (reverted ones are back to ISSUED, so not counted)
--   spot       shirts sold on the spot (undone sales not counted)
--   toCollect  paid online, not picked up yet
-- unmatched: passes whose product cannot be worked out, so the totals still add up
-- spotSales: the 100 newest spot sales that are not undone

CREATE OR REPLACE FUNCTION merch_inventory()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH products AS (
        SELECT id, fit, variant, group_key, sort_order
        FROM payment_products
        WHERE category = 'MERCH'
    ),
    passes AS (
        -- Older passes may have no product_id; find it from the fit and size
        SELECT
            COALESCE(
                c.product_id,
                (SELECT p.id FROM products p WHERE p.fit = c.fit AND p.variant = c.variant ORDER BY p.id LIMIT 1)
            ) AS product_id,
            c.status
        FROM claimable_items c
        WHERE c.category = 'MERCH' AND c.status IN ('ISSUED', 'CLAIMED')
    ),
    pass_counts AS (
        SELECT
            product_id,
            COUNT(*) FILTER (WHERE status = 'CLAIMED')::INTEGER AS claimed,
            COUNT(*) FILTER (WHERE status = 'ISSUED')::INTEGER AS to_collect
        FROM passes
        GROUP BY product_id
    ),
    spot AS (
        SELECT product_id, SUM(quantity)::INTEGER AS spot
        FROM merch_spot_sales
        WHERE undone_at IS NULL
        GROUP BY product_id
    )
    SELECT jsonb_build_object(
        'rows', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'productId', p.id,
                    'fit', p.fit,
                    'size', p.variant,
                    'stock', s.stock,
                    'stockUpdatedAt', s.updated_at,
                    'claimed', COALESCE(pc.claimed, 0),
                    'spot', COALESCE(sp.spot, 0),
                    'toCollect', COALESCE(pc.to_collect, 0)
                )
                ORDER BY p.group_key, p.sort_order, p.id
            )
            FROM products p
            LEFT JOIN merch_stock s ON s.product_id = p.id
            LEFT JOIN pass_counts pc ON pc.product_id = p.id
            LEFT JOIN spot sp ON sp.product_id = p.id
        ), '[]'::jsonb),
        'unmatched', jsonb_build_object(
            'claimed', COALESCE((SELECT SUM(claimed) FROM pass_counts WHERE product_id IS NULL OR product_id NOT IN (SELECT id FROM products)), 0),
            'toCollect', COALESCE((SELECT SUM(to_collect) FROM pass_counts WHERE product_id IS NULL OR product_id NOT IN (SELECT id FROM products)), 0)
        ),
        'spotSales', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', x.id,
                    'productId', x.product_id,
                    'fit', p.fit,
                    'size', p.variant,
                    'quantity', x.quantity,
                    'studentName', x.student_name,
                    'createdAt', x.created_at
                )
                ORDER BY x.created_at DESC, x.id DESC
            )
            FROM (
                SELECT * FROM merch_spot_sales
                WHERE undone_at IS NULL
                ORDER BY created_at DESC, id DESC
                LIMIT 100
            ) x
            LEFT JOIN products p ON p.id = x.product_id
        ), '[]'::jsonb)
    );
$$;

REVOKE ALL ON FUNCTION merch_inventory() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION merch_inventory() TO service_role;

-- 3. Set stock --------------------------------------------------------
-- p_items: [{ "productId": "tshirt-b-m", "stock": 40 }, ...]. All or nothing:
-- an unknown product raises UNKNOWN_PRODUCT and nothing is saved.
-- Returns the inventory after the change.

CREATE OR REPLACE FUNCTION set_merch_stock(p_items JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item JSONB;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM payment_products
            WHERE id = v_item->>'productId' AND category = 'MERCH'
        ) THEN
            RAISE EXCEPTION 'UNKNOWN_PRODUCT';
        END IF;

        INSERT INTO merch_stock (product_id, stock, updated_at)
        VALUES (v_item->>'productId', (v_item->>'stock')::INTEGER, NOW())
        ON CONFLICT (product_id) DO UPDATE
        SET stock = EXCLUDED.stock, updated_at = NOW()
        WHERE merch_stock.stock IS DISTINCT FROM EXCLUDED.stock;
    END LOOP;

    RETURN merch_inventory();
END;
$$;

REVOKE ALL ON FUNCTION set_merch_stock(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION set_merch_stock(JSONB) TO service_role;

-- 4. Spot sales -------------------------------------------------------

CREATE OR REPLACE FUNCTION add_merch_spot_sale(p_product_id TEXT, p_quantity INTEGER, p_student_name TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM payment_products WHERE id = p_product_id AND category = 'MERCH') THEN
        RAISE EXCEPTION 'UNKNOWN_PRODUCT';
    END IF;

    INSERT INTO merch_spot_sales (product_id, quantity, student_name)
    VALUES (p_product_id, p_quantity, NULLIF(btrim(p_student_name), ''));

    RETURN merch_inventory();
END;
$$;

REVOKE ALL ON FUNCTION add_merch_spot_sale(TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION add_merch_spot_sale(TEXT, INTEGER, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION undo_merch_spot_sale(p_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE merch_spot_sales SET undone_at = NOW()
    WHERE id = p_id AND undone_at IS NULL;

    IF NOT FOUND THEN
        IF EXISTS (SELECT 1 FROM merch_spot_sales WHERE id = p_id) THEN
            RAISE EXCEPTION 'ALREADY_UNDONE';
        END IF;
        RAISE EXCEPTION 'SPOT_SALE_NOT_FOUND';
    END IF;

    RETURN merch_inventory();
END;
$$;

REVOKE ALL ON FUNCTION undo_merch_spot_sale(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION undo_merch_spot_sale(BIGINT) TO service_role;
