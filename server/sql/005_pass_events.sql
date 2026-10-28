-- ==========================================================
-- Pass events: a permanent log of every claim and revert
--   * pass_events: one row per CLAIM / REVERT, written by a trigger
--   * staff_claim_stats(): per-staff totals for the staff admin page
-- Additive only. claim_event_pass / revert_event_pass are NOT changed, and the
-- site keeps working whether this runs before or after the matching deploy.
-- Safe to run more than once.
-- ==========================================================

-- 1. Table ------------------------------------------------------------
-- No foreign keys on purpose: the log must never be the reason a claim fails.

CREATE TABLE IF NOT EXISTS pass_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pass_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CLAIM', 'REVERT')),
    category TEXT NOT NULL,
    staff_iris_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Names are copied in when the event happens, so the log reads well on its own
-- and stays right if someone is renamed later. (Added separately so a database
-- that already ran an earlier version of this file gets them too.)
ALTER TABLE pass_events ADD COLUMN IF NOT EXISTS staff_name TEXT;
ALTER TABLE pass_events ADD COLUMN IF NOT EXISTS user_name TEXT;

CREATE INDEX IF NOT EXISTS idx_pass_events_staff ON pass_events(staff_iris_id);
CREATE INDEX IF NOT EXISTS idx_pass_events_pass ON pass_events(pass_id);

ALTER TABLE pass_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_events FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE pass_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE pass_events TO service_role;

-- 2. Trigger ----------------------------------------------------------
-- Fires on any change of claimable_items.status, so it also catches claims and
-- reverts made by hand in the SQL editor. claimed_by is the person who did it
-- (for a revert, the one who reverted).

CREATE OR REPLACE FUNCTION log_pass_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_staff_name TEXT;
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        SELECT COALESCE(name, iris_id) INTO v_staff_name FROM event_staff WHERE iris_id = NEW.claimed_by;
    END IF;

    IF OLD.status = 'ISSUED' AND NEW.status = 'CLAIMED' THEN
        INSERT INTO pass_events (pass_id, action, category, staff_iris_id, staff_name, user_name, created_at)
        VALUES (NEW.id, 'CLAIM', NEW.category, NEW.claimed_by, v_staff_name, NEW.user_name, COALESCE(NEW.claimed_at, NOW()));
    ELSIF OLD.status = 'CLAIMED' AND NEW.status = 'ISSUED' THEN
        INSERT INTO pass_events (pass_id, action, category, staff_iris_id, staff_name, user_name, created_at)
        VALUES (NEW.id, 'REVERT', NEW.category, NEW.claimed_by, v_staff_name, NEW.user_name, COALESCE(NEW.claimed_at, NOW()));
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_pass_event ON claimable_items;

CREATE TRIGGER trg_log_pass_event
AFTER UPDATE OF status ON claimable_items
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_pass_event();

-- 3. Backfill ---------------------------------------------------------
-- Passes already claimed before this ran get one CLAIM row each, so the counts
-- are right from the start. (Earlier reverts were never recorded and cannot be.)

INSERT INTO pass_events (pass_id, action, category, staff_iris_id, staff_name, user_name, created_at)
SELECT c.id, 'CLAIM', c.category, c.claimed_by, COALESCE(s.name, s.iris_id), c.user_name, COALESCE(c.claimed_at, c.created_at)
FROM claimable_items c
LEFT JOIN event_staff s ON s.iris_id = c.claimed_by
WHERE c.status = 'CLAIMED'
  AND NOT EXISTS (SELECT 1 FROM pass_events e WHERE e.pass_id = c.id);

-- Rows written by an earlier version of this file have no names yet
UPDATE pass_events e
SET staff_name = COALESCE(s.name, s.iris_id)
FROM event_staff s
WHERE e.staff_name IS NULL AND s.iris_id = e.staff_iris_id;

UPDATE pass_events e
SET user_name = c.user_name
FROM claimable_items c
WHERE e.user_name IS NULL AND c.id = e.pass_id AND c.user_name IS NOT NULL;

-- 4. Per-staff totals -------------------------------------------------
-- claims: every claim they made (even if someone reverted it later)
-- reverts: every claim they reverted

CREATE OR REPLACE FUNCTION staff_claim_stats()
RETURNS TABLE (
    staff_iris_id TEXT,
    food_claims INTEGER,
    merch_claims INTEGER,
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
        (COUNT(*) FILTER (WHERE e.action = 'REVERT'))::INTEGER,
        MAX(e.created_at)
    FROM pass_events e
    WHERE e.staff_iris_id IS NOT NULL
    GROUP BY e.staff_iris_id;
$$;

REVOKE ALL ON FUNCTION staff_claim_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION staff_claim_stats() TO service_role;
