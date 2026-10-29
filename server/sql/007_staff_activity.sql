-- ==========================================================
-- Staff activity: what each staff member handed out, notes, and revert from the staff admin page
--   * pass_notes: free-text notes on a pass (mishandling, revert reasons)
--   * staff_activity(): one staff member's claims and reverts with the item details
--   * admin_revert_event_pass(): revert a claim from the staff admin page
-- Additive only. claim_event_pass / revert_event_pass and the pass_events trigger
-- are NOT changed. Needs 006_pass_events.sql to have been run first.
-- Safe to run more than once.
-- ==========================================================

-- 1. Notes ------------------------------------------------------------
-- Append only: the server never edits or deletes a note, so it stays a record.
-- No foreign key on purpose, like pass_events.

CREATE TABLE IF NOT EXISTS pass_notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pass_id UUID NOT NULL,
    kind TEXT NOT NULL DEFAULT 'NOTE' CHECK (kind IN ('NOTE', 'MISHANDLED', 'REVERT_REASON')),
    note TEXT NOT NULL CHECK (char_length(note) BETWEEN 1 AND 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pass_notes_pass ON pass_notes(pass_id);

ALTER TABLE pass_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_notes FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE pass_notes FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE pass_notes TO service_role;

-- 2. One staff member's activity ---------------------------------------
-- Newest first. reverted_at: when a claim was later reverted (by anyone).
-- is_latest: this is the newest event on that pass, so reverting it is still meaningful.
-- total: how many rows match, for paging.
-- p_query: the start of the holder's IRIS id (any case), or a name containing
-- every word typed (any case, any order), like search_event_passes.

-- An earlier draft of this file had no p_query; drop it so only one version exists
DROP FUNCTION IF EXISTS staff_activity(TEXT, TEXT, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION staff_activity(
    p_staff TEXT,
    p_category TEXT DEFAULT NULL,
    p_action TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 30,
    p_offset INTEGER DEFAULT 0,
    p_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    event_id BIGINT,
    event_action TEXT,
    event_category TEXT,
    event_at TIMESTAMPTZ,
    pass_id UUID,
    item_name TEXT,
    variant TEXT,
    fit TEXT,
    holder_name TEXT,
    holder_iris_id TEXT,
    pass_status TEXT,
    reverted_at TIMESTAMPTZ,
    is_latest BOOLEAN,
    notes JSONB,
    total INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        e.id,
        e.action,
        e.category,
        e.created_at,
        e.pass_id,
        c.item_name,
        c.variant,
        c.fit,
        COALESCE(c.user_name, e.user_name),
        c.user_iris_id,
        c.status,
        CASE WHEN e.action = 'CLAIM' THEN (
            SELECT MIN(r.created_at) FROM pass_events r
            WHERE r.pass_id = e.pass_id AND r.action = 'REVERT' AND r.id > e.id
        ) END,
        e.id = (SELECT MAX(l.id) FROM pass_events l WHERE l.pass_id = e.pass_id),
        (
            SELECT COALESCE(
                jsonb_agg(
                    jsonb_build_object('id', n.id, 'kind', n.kind, 'note', n.note, 'createdAt', n.created_at)
                    ORDER BY n.id
                ),
                '[]'::jsonb
            )
            FROM pass_notes n WHERE n.pass_id = e.pass_id
        ),
        (COUNT(*) OVER ())::INTEGER
    FROM pass_events e
    LEFT JOIN claimable_items c ON c.id = e.pass_id
    WHERE e.staff_iris_id = p_staff
      AND (p_category IS NULL OR e.category = p_category)
      AND (p_action IS NULL OR e.action = p_action)
      AND (
          p_query IS NULL OR TRIM(p_query) = ''
          OR UPPER(c.user_iris_id) LIKE UPPER(replace(replace(replace(TRIM(p_query), '\', '\\'), '%', '\%'), '_', '\_')) || '%'
          OR (
              COALESCE(c.user_name, e.user_name) IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1
                  FROM unnest(string_to_array(TRIM(p_query), ' ')) AS w
                  WHERE w <> ''
                    AND COALESCE(c.user_name, e.user_name) NOT ILIKE '%' || replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') || '%'
              )
          )
      )
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    OFFSET GREATEST(p_offset, 0);
$$;

REVOKE ALL ON FUNCTION staff_activity(TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION staff_activity(TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT) TO service_role;

-- 3. Revert from the staff admin page ----------------------------------
-- Same checks as revert_event_pass, but the head has no staff IRIS id here, so
-- claimed_by is cleared. The pass_events trigger then logs the revert with no
-- staff member, which keeps it out of every volunteer's own totals. The reason
-- (optional) is saved as a REVERT_REASON note.

CREATE OR REPLACE FUNCTION admin_revert_event_pass(p_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item RECORD;
    v_updated RECORD;
BEGIN
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
        claimed_by = NULL
    WHERE id = v_item.id AND status = 'CLAIMED'
    RETURNING * INTO v_updated;

    IF v_updated.id IS NULL THEN
        RETURN jsonb_build_object('result', 'INVALID', 'message', 'Pass changed while reverting, check it and try again');
    END IF;

    IF p_reason IS NOT NULL AND btrim(p_reason) <> '' THEN
        INSERT INTO pass_notes (pass_id, kind, note)
        VALUES (v_updated.id, 'REVERT_REASON', LEFT(btrim(p_reason), 500));
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

REVOKE ALL ON FUNCTION admin_revert_event_pass(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_revert_event_pass(UUID, TEXT) TO service_role;
