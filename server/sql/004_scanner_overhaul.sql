-- ==========================================================
-- Staff scanner overhaul (/parva-26/scan). Safe to re-run.
--   * user_name on claimable_items, name on event_staff
--   * claim_event_pass: category mode check, names, T-shirt fit
--   * search_event_passes: find a student's passes by reg / roll number
--   * revert_event_pass: put a claimed pass back to ISSUED
-- ==========================================================

-- 1. Names -----------------------------------------------------------

ALTER TABLE claimable_items ADD COLUMN IF NOT EXISTS user_name TEXT;
-- T-shirt fit ('Regular' / 'Oversized'), copied from payment_products when the pass is issued
ALTER TABLE claimable_items ADD COLUMN IF NOT EXISTS fit TEXT;
-- Some databases never got product_id (001 only created it with the table);
-- nullable here because older rows cannot all be filled in
ALTER TABLE claimable_items ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE event_staff ADD COLUMN IF NOT EXISTS name TEXT;

-- Backfill: the name the buyer gave when paying
UPDATE claimable_items c
SET user_name = p.customer_name
FROM payments p
WHERE c.payment_id = p.id
  AND c.user_name IS NULL
  AND p.customer_name IS NOT NULL;

-- Backfill product_id from the order the pass came from: the one product in
-- payments.items with the pass's name and variant (skipped when that is ambiguous)
UPDATE claimable_items c
SET product_id = m.product_id
FROM (
    SELECT c2.id, MIN(i->>'productId') AS product_id
    FROM claimable_items c2
    JOIN payments p ON p.id = c2.payment_id
    CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(p.items) = 'array' THEN p.items ELSE '[]'::jsonb END
    ) AS i
    WHERE c2.product_id IS NULL
      AND i->>'name' = c2.item_name
      AND (i->>'variant') IS NOT DISTINCT FROM c2.variant
    GROUP BY c2.id
    HAVING COUNT(DISTINCT i->>'productId') = 1
) m
WHERE c.id = m.id;

-- Backfill fit from the product
UPDATE claimable_items c
SET fit = pp.fit
FROM payment_products pp
WHERE c.fit IS NULL AND c.product_id = pp.id AND pp.fit IS NOT NULL;

-- Staff names are set by hand, e.g.
--   UPDATE event_staff SET name = 'Asha Rao' WHERE iris_id = '...';

-- Roll / reg number search is by user_iris_id (the IRIS reg no)
CREATE INDEX IF NOT EXISTS idx_claimable_items_user_upper ON claimable_items (UPPER(user_iris_id));

-- 2. claim_event_pass ------------------------------------------------
-- The old two-argument version is dropped so a call can never reach it:
-- it would claim a pass without checking the scanner's mode.

DROP FUNCTION IF EXISTS claim_event_pass(UUID, TEXT);

CREATE OR REPLACE FUNCTION claim_event_pass(p_token UUID, p_staff_iris_id TEXT, p_category TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_active BOOLEAN;
    v_item RECORD;
    v_updated_item RECORD;
    v_claimer TEXT;
    v_label TEXT;
BEGIN
    IF p_category IS NULL OR p_category NOT IN ('FOOD', 'MERCH') THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Scanner mode must be FOOD or MERCH');
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
                CASE v_item.category WHEN 'FOOD' THEN 'Food Pass' ELSE 'Merch' END,
                CASE p_category WHEN 'FOOD' THEN 'Food' ELSE 'Merch' END
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

-- 3. search_event_passes ---------------------------------------------
-- Every FOOD or MERCH pass whose owner matches: the exact reg number (any case),
-- or a name containing every word typed (any case, any order).

CREATE OR REPLACE FUNCTION search_event_passes(p_query TEXT, p_category TEXT)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(jsonb_agg(row_to_json(r)::jsonb ORDER BY r.user_name, r.created_at DESC, r.item_index), '[]'::jsonb)
    FROM (
        SELECT c.id, c.token, c.user_iris_id, c.user_name, c.category, c.item_name,
               c.variant, c.fit, c.item_index, c.status, c.claimed_at, c.claimed_by,
               COALESCE(s.name, c.claimed_by) AS claimed_by_name, c.created_at
        FROM claimable_items c
        LEFT JOIN event_staff s ON s.iris_id = c.claimed_by
        WHERE c.category = p_category
          AND c.status <> 'VOID'
          AND (
              UPPER(c.user_iris_id) = UPPER(TRIM(p_query))
              OR (
                  c.user_name IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1
                      FROM unnest(string_to_array(TRIM(p_query), ' ')) AS w
                      WHERE w <> ''
                        AND c.user_name NOT ILIKE '%' || replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') || '%'
                  )
              )
          )
        ORDER BY c.user_name, c.created_at DESC, c.item_index
        LIMIT 50
    ) r;
$$;

REVOKE ALL ON FUNCTION search_event_passes(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION search_event_passes(TEXT, TEXT) TO service_role;

-- 4. revert_event_pass -----------------------------------------------
-- CLAIMED back to ISSUED (e.g. the size is out of stock). claimed_at and
-- claimed_by record when the reversal happened and who did it.

CREATE OR REPLACE FUNCTION revert_event_pass(p_id UUID, p_staff_iris_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_active BOOLEAN;
    v_item RECORD;
    v_updated RECORD;
BEGIN
    SELECT active INTO v_staff_active FROM event_staff WHERE iris_id = p_staff_iris_id;

    IF v_staff_active IS NULL OR v_staff_active = FALSE THEN
        RETURN jsonb_build_object('result', 'FORBIDDEN', 'message', 'Staff member is not active or unauthorized');
    END IF;

    SELECT * INTO v_item FROM claimable_items WHERE id = p_id;

    IF v_item.id IS NULL THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Pass not found');
    END IF;

    IF v_item.status = 'ISSUED' THEN
        RETURN jsonb_build_object('result', 'NOT_CLAIMED', 'message', 'Pass is not claimed, nothing to revert');
    END IF;

    IF v_item.status <> 'CLAIMED' THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Only a claimed pass can be reverted');
    END IF;

    UPDATE claimable_items
    SET status = 'ISSUED',
        claimed_at = NOW(),
        claimed_by = p_staff_iris_id
    WHERE id = v_item.id AND status = 'CLAIMED'
    RETURNING * INTO v_updated;

    IF v_updated.id IS NULL THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Pass changed while reverting, check it and try again');
    END IF;

    RETURN jsonb_build_object(
        'result', 'REVERTED',
        'item', jsonb_build_object(
            'id', v_updated.id,
            'user_iris_id', v_updated.user_iris_id,
            'user_name', v_updated.user_name,
            'category', v_updated.category,
            'item_name', v_updated.item_name,
            'variant', v_updated.variant,
            'status', v_updated.status
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION revert_event_pass(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION revert_event_pass(UUID, TEXT) TO service_role;
