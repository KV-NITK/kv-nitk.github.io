-- ==========================================================
-- Photo booth (/parva-26/photobooth): one QR pass per photo session. Safe to re-run.
--   * PHOTO is a pass category, like FOOD and MERCH
--   * claim_event_pass: a scanner can be in PHOTO mode
--   * staff_claim_stats: photo claims counted per staff member
--   * products: one row per number of prints, ₹71 a session (the 71st Kannada
--     Rajyotsava) with one print, ₹30 for each extra copy
-- Needs 004, 006 and 007 to have been run first. Run this BEFORE deploying the
-- server that sells photo sessions.
-- ==========================================================

-- 1. The category ------------------------------------------------------

ALTER TABLE claimable_items DROP CONSTRAINT IF EXISTS claimable_items_category_check;
ALTER TABLE claimable_items ADD CONSTRAINT claimable_items_category_check
    CHECK (category IN ('FOOD', 'MERCH', 'PHOTO'));

-- 2. claim_event_pass ------------------------------------------------
-- As in 004, with PHOTO allowed as a scanner mode and named in the mismatch message.

CREATE OR REPLACE FUNCTION claim_event_pass(p_token UUID, p_staff_iris_id TEXT, p_category TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_staff_active BOOLEAN;
    v_item RECORD;
    v_updated_item RECORD;
    v_claimer TEXT;
BEGIN
    IF p_category IS NULL OR p_category NOT IN ('FOOD', 'MERCH', 'PHOTO') THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Scanner mode must be FOOD, MERCH or PHOTO');
    END IF;

    SELECT active INTO v_staff_active
    FROM event_staff
    WHERE iris_id = p_staff_iris_id;

    IF v_staff_active IS NULL OR v_staff_active = FALSE THEN
        RETURN jsonb_build_object(
            'result', 'FORBIDDEN',
            'message', 'Staff member is not active or unauthorized'
        );
    END IF;

    SELECT * INTO v_item FROM claimable_items WHERE token = p_token;

    IF v_item.id IS NULL THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Pass not found or invalid token');
    END IF;

    -- Wrong mode: report it, never claim
    IF v_item.category <> p_category THEN
        RETURN jsonb_build_object(
            'result', 'MISMATCH',
            'message', format(
                'Mismatched Item: This QR code is for %s, but scanner is currently in %s Mode.',
                CASE v_item.category WHEN 'FOOD' THEN 'Food Pass' WHEN 'PHOTO' THEN 'Photo Booth' ELSE 'Merch' END,
                CASE p_category WHEN 'FOOD' THEN 'Food' WHEN 'PHOTO' THEN 'Photo' ELSE 'Merch' END
            ),
            'category', v_item.category,
            'scanner_category', p_category
        );
    END IF;

    IF v_item.status = 'CLAIMED' THEN
        SELECT COALESCE(name, iris_id) INTO v_claimer FROM event_staff WHERE iris_id = v_item.claimed_by;

        RETURN jsonb_build_object(
            'result', 'ALREADY_USED',
            'message', 'Pass has already been claimed',
            'claimed_at', v_item.claimed_at,
            'claimed_by', v_item.claimed_by,
            'claimed_by_name', COALESCE(v_claimer, v_item.claimed_by),
            'item_name', v_item.item_name,
            'category', v_item.category,
            'variant', v_item.variant,
            'fit', v_item.fit,
            'user_name', v_item.user_name,
            'user_iris_id', v_item.user_iris_id
        );
    END IF;

    IF v_item.status = 'VOID' THEN
        RETURN jsonb_build_object('result', 'VOID', 'message', 'Pass is void');
    END IF;

    IF v_item.status <> 'ISSUED' THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Pass cannot be claimed');
    END IF;

    UPDATE claimable_items
    SET status = 'CLAIMED',
        claimed_at = NOW(),
        claimed_by = p_staff_iris_id
    WHERE id = v_item.id AND status = 'ISSUED' AND category = p_category
    RETURNING * INTO v_updated_item;

    -- A concurrent scan claimed it first
    IF v_updated_item.id IS NULL THEN
        SELECT * INTO v_item FROM claimable_items WHERE id = v_item.id;

        IF v_item.status = 'CLAIMED' THEN
            SELECT COALESCE(name, iris_id) INTO v_claimer FROM event_staff WHERE iris_id = v_item.claimed_by;

            RETURN jsonb_build_object(
                'result', 'ALREADY_USED',
                'message', 'Pass has already been claimed',
                'claimed_at', v_item.claimed_at,
                'claimed_by', v_item.claimed_by,
                'claimed_by_name', COALESCE(v_claimer, v_item.claimed_by),
                'item_name', v_item.item_name,
                'category', v_item.category,
                'variant', v_item.variant,
                'fit', v_item.fit,
                'user_name', v_item.user_name,
                'user_iris_id', v_item.user_iris_id
            );
        END IF;

        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Pass could not be claimed');
    END IF;

    RETURN jsonb_build_object(
        'result', 'OK',
        'item', jsonb_build_object(
            'id', v_updated_item.id,
            'payment_id', v_updated_item.payment_id,
            'user_iris_id', v_updated_item.user_iris_id,
            'user_name', v_updated_item.user_name,
            'category', v_updated_item.category,
            'item_name', v_updated_item.item_name,
            'variant', v_updated_item.variant,
            'fit', v_updated_item.fit,
            'item_index', v_updated_item.item_index,
            'status', v_updated_item.status,
            'token', v_updated_item.token,
            'claimed_at', v_updated_item.claimed_at,
            'claimed_by', v_updated_item.claimed_by,
            'created_at', v_updated_item.created_at
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION claim_event_pass(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_event_pass(UUID, TEXT, TEXT) TO service_role;

-- 3. Per-staff totals ------------------------------------------------
-- As in 006, with photo_claims. A new column changes the return type, so the
-- old function is dropped first.

DROP FUNCTION IF EXISTS staff_claim_stats();

CREATE FUNCTION staff_claim_stats()
RETURNS TABLE (
    staff_iris_id TEXT,
    food_claims INTEGER,
    merch_claims INTEGER,
    photo_claims INTEGER,
    reverts INTEGER,
    last_action_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        e.staff_iris_id,
        (COUNT(*) FILTER (WHERE e.action = 'CLAIM' AND e.category = 'FOOD'))::INTEGER,
        (COUNT(*) FILTER (WHERE e.action = 'CLAIM' AND e.category = 'MERCH'))::INTEGER,
        (COUNT(*) FILTER (WHERE e.action = 'CLAIM' AND e.category = 'PHOTO'))::INTEGER,
        (COUNT(*) FILTER (WHERE e.action = 'REVERT'))::INTEGER,
        MAX(e.created_at)
    FROM pass_events e
    WHERE e.staff_iris_id IS NOT NULL
    GROUP BY e.staff_iris_id;
$$;

REVOKE ALL ON FUNCTION staff_claim_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION staff_claim_stats() TO service_role;

-- 4. Products ----------------------------------------------------------
-- One row per number of prints, so the price is always the catalog's and the
-- pass says how many copies to hand over. variant is what staff see on a scan.

INSERT INTO payment_products (id, name, category, group_key, variant, unit_price, max_quantity, sort_order, active)
SELECT
    'photo-session-' || n,
    'Photo Booth Session',
    'PHOTO',
    'photo-session',
    CASE WHEN n = 1 THEN '1 print' ELSE n || ' prints' END,
    71 + 30 * (n - 1),
    10,
    n,
    TRUE
FROM generate_series(1, 10) AS n
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    group_key = EXCLUDED.group_key,
    variant = EXCLUDED.variant,
    unit_price = EXCLUDED.unit_price,
    sort_order = EXCLUDED.sort_order;
