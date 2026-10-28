-- ==========================================================
-- Parva 2026: literacy event registrations
--   Quiz (3-4), Proverbs & Riddles (2), Film-song challenge (4)
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.
-- Students submit from the browser with the public anon key, so
-- RLS is what protects the data: anon may INSERT only. Nobody
-- can read, change or delete rows except you (dashboard / service role).
-- ==========================================================

-- ---------- 1. Quiz: teams of 3-4 (member 4 optional) ----------
CREATE TABLE IF NOT EXISTS literacy_quiz_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    group_name      TEXT NOT NULL CHECK (char_length(btrim(group_name))   BETWEEN 1 AND 100),
    leader_name     TEXT NOT NULL CHECK (char_length(btrim(leader_name))  BETWEEN 1 AND 100),
    leader_roll_no  TEXT NOT NULL CHECK (char_length(btrim(leader_roll_no)) BETWEEN 3 AND 20),
    leader_email    TEXT NOT NULL CHECK (leader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(leader_email) <= 254),
    leader_phone    TEXT NOT NULL CHECK (leader_phone ~ '^[0-9]{10}$'),
    member2_name    TEXT NOT NULL CHECK (char_length(btrim(member2_name)) BETWEEN 1 AND 100),
    member3_name    TEXT NOT NULL CHECK (char_length(btrim(member3_name)) BETWEEN 1 AND 100),
    member4_name    TEXT          CHECK (member4_name IS NULL OR char_length(btrim(member4_name)) BETWEEN 1 AND 100)
);

-- ---------- 2. Proverbs & Riddles: teams of 2 ----------
CREATE TABLE IF NOT EXISTS literacy_proverbs_riddles_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    group_name      TEXT NOT NULL CHECK (char_length(btrim(group_name))   BETWEEN 1 AND 100),
    leader_name     TEXT NOT NULL CHECK (char_length(btrim(leader_name))  BETWEEN 1 AND 100),
    leader_roll_no  TEXT NOT NULL CHECK (char_length(btrim(leader_roll_no)) BETWEEN 3 AND 20),
    leader_email    TEXT NOT NULL CHECK (leader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(leader_email) <= 254),
    leader_phone    TEXT NOT NULL CHECK (leader_phone ~ '^[0-9]{10}$'),
    member2_name    TEXT NOT NULL CHECK (char_length(btrim(member2_name)) BETWEEN 1 AND 100)
);

-- ---------- 3. Film-song challenge: teams of 4 ----------
CREATE TABLE IF NOT EXISTS literacy_film_song_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    group_name      TEXT NOT NULL CHECK (char_length(btrim(group_name))   BETWEEN 1 AND 100),
    leader_name     TEXT NOT NULL CHECK (char_length(btrim(leader_name))  BETWEEN 1 AND 100),
    leader_roll_no  TEXT NOT NULL CHECK (char_length(btrim(leader_roll_no)) BETWEEN 3 AND 20),
    leader_email    TEXT NOT NULL CHECK (leader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(leader_email) <= 254),
    leader_phone    TEXT NOT NULL CHECK (leader_phone ~ '^[0-9]{10}$'),
    member2_name    TEXT NOT NULL CHECK (char_length(btrim(member2_name)) BETWEEN 1 AND 100),
    member3_name    TEXT NOT NULL CHECK (char_length(btrim(member3_name)) BETWEEN 1 AND 100),
    member4_name    TEXT NOT NULL CHECK (char_length(btrim(member4_name)) BETWEEN 1 AND 100)
);

-- ---------- 4. No duplicates within an event ----------
-- Same team name, or the same leader (roll no / email), cannot register twice.
-- Case-insensitive. The frontend reads these index names to show a friendly error.
CREATE UNIQUE INDEX IF NOT EXISTS quiz_group_name_uq   ON literacy_quiz_registrations (lower(btrim(group_name)));
CREATE UNIQUE INDEX IF NOT EXISTS quiz_leader_roll_uq  ON literacy_quiz_registrations (upper(btrim(leader_roll_no)));
CREATE UNIQUE INDEX IF NOT EXISTS quiz_leader_email_uq ON literacy_quiz_registrations (lower(btrim(leader_email)));

CREATE UNIQUE INDEX IF NOT EXISTS proverbs_group_name_uq   ON literacy_proverbs_riddles_registrations (lower(btrim(group_name)));
CREATE UNIQUE INDEX IF NOT EXISTS proverbs_leader_roll_uq  ON literacy_proverbs_riddles_registrations (upper(btrim(leader_roll_no)));
CREATE UNIQUE INDEX IF NOT EXISTS proverbs_leader_email_uq ON literacy_proverbs_riddles_registrations (lower(btrim(leader_email)));

CREATE UNIQUE INDEX IF NOT EXISTS filmsong_group_name_uq   ON literacy_film_song_registrations (lower(btrim(group_name)));
CREATE UNIQUE INDEX IF NOT EXISTS filmsong_leader_roll_uq  ON literacy_film_song_registrations (upper(btrim(leader_roll_no)));
CREATE UNIQUE INDEX IF NOT EXISTS filmsong_leader_email_uq ON literacy_film_song_registrations (lower(btrim(leader_email)));

-- ---------- 5. Row Level Security: insert-only for the public ----------
ALTER TABLE literacy_quiz_registrations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE literacy_proverbs_riddles_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE literacy_film_song_registrations         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can register" ON literacy_quiz_registrations;
CREATE POLICY "public can register" ON literacy_quiz_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public can register" ON literacy_proverbs_riddles_registrations;
CREATE POLICY "public can register" ON literacy_proverbs_riddles_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public can register" ON literacy_film_song_registrations;
CREATE POLICY "public can register" ON literacy_film_song_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Belt and braces: even without RLS, the public roles may only INSERT.
REVOKE ALL ON literacy_quiz_registrations              FROM anon, authenticated;
REVOKE ALL ON literacy_proverbs_riddles_registrations  FROM anon, authenticated;
REVOKE ALL ON literacy_film_song_registrations         FROM anon, authenticated;
GRANT INSERT ON literacy_quiz_registrations              TO anon, authenticated;
GRANT INSERT ON literacy_proverbs_riddles_registrations  TO anon, authenticated;
GRANT INSERT ON literacy_film_song_registrations         TO anon, authenticated;
