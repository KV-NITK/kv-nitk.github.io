-- ==========================================================
-- Per-category stats for the staff admin page
--   * staff_category_stats(): each staff member's claims, reverts and last scan, per category
--   * pass_category_totals(): every pass, per category: claimed, still to claim, void
-- Additive only: two new read-only functions. staff_claim_stats() and the
-- claim/revert functions are NOT changed. Needs 006_pass_events.sql.
-- Safe to run more than once, and safe while scanning is going on.
-- ==========================================================

-- 1. Per staff member, per category -------------------------------------
-- claims: every claim they made (even if reverted later); reverts: claims they reverted

CREATE OR REPLACE FUNCTION staff_category_stats()
RETURNS TABLE (
    staff_iris_id TEXT,
    category TEXT,
    claims INTEGER,
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
        e.category,
        (COUNT(*) FILTER (WHERE e.action = 'CLAIM'))::INTEGER,
        (COUNT(*) FILTER (WHERE e.action = 'REVERT'))::INTEGER,
        MAX(e.created_at)
    FROM pass_events e
    WHERE e.staff_iris_id IS NOT NULL
    GROUP BY e.staff_iris_id, e.category;
$$;

REVOKE ALL ON FUNCTION staff_category_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION staff_category_stats() TO service_role;

-- 2. All passes, per category ------------------------------------------
-- claimed: handed over now (a reverted pass is back to ISSUED, so not counted)
-- issued: paid for, not claimed yet

CREATE OR REPLACE FUNCTION pass_category_totals()
RETURNS TABLE (
    category TEXT,
    claimed INTEGER,
    issued INTEGER,
    voided INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.category,
        (COUNT(*) FILTER (WHERE c.status = 'CLAIMED'))::INTEGER,
        (COUNT(*) FILTER (WHERE c.status = 'ISSUED'))::INTEGER,
        (COUNT(*) FILTER (WHERE c.status = 'VOID'))::INTEGER
    FROM claimable_items c
    GROUP BY c.category;
$$;

REVOKE ALL ON FUNCTION pass_category_totals() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION pass_category_totals() TO service_role;
