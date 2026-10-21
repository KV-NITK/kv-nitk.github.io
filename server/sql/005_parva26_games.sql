-- ==========================================================
-- Parva 2026 landing page games: the flowers thrown at Samudrappa (Scene 9)
-- and "Which film?" (Scene 11). No login for either. Safe to re-run.
-- Then load the films: `npm run parva26:films` in server/.
-- ==========================================================

-- 1. Shared counters. One row, 'hoomale', for the flowers.
CREATE TABLE IF NOT EXISTS parva26_counters (
    id TEXT PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0
);

INSERT INTO parva26_counters (id, value) VALUES ('hoomale', 0)
ON CONFLICT (id) DO NOTHING;

-- Adds to a counter in one statement, so taps from many people at once are
-- never lost, and returns the new total.
CREATE OR REPLACE FUNCTION parva26_add_flowers(amount INTEGER)
RETURNS BIGINT
LANGUAGE sql
AS $$
    UPDATE parva26_counters SET value = value + GREATEST(amount, 0)
    WHERE id = 'hoomale'
    RETURNING value;
$$;

-- 2. The film puzzles. The answers live only here; the page never sees one
--    until the reel is over. The rows come from
--    server/content/parva26-films.json: edit that and run
--    `npm run parva26:films` (in server/) rather than changing rows here.
--    A film taken out of the file is set inactive, never deleted, so a game
--    already dealt it can finish.
CREATE TABLE IF NOT EXISTS parva26_puzzles (
    id TEXT PRIMARY KEY,
    sort INTEGER NOT NULL,
    emoji TEXT[] NOT NULL,          -- Twemoji code points, as in assets/emoji
    alt TEXT NOT NULL,              -- describes the pictures, not the answer
    answer_kn TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    accept TEXT[] NOT NULL DEFAULT '{}',
    year INTEGER NOT NULL,
    level TEXT NOT NULL DEFAULT 'medium' CHECK (level IN ('easy', 'medium', 'hard')),
    clue1 TEXT NOT NULL DEFAULT '', -- the first hint
    clue2 TEXT NOT NULL DEFAULT '', -- the second
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- For a database made by the first version of this file
ALTER TABLE parva26_puzzles ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'medium' CHECK (level IN ('easy', 'medium', 'hard'));
ALTER TABLE parva26_puzzles ADD COLUMN IF NOT EXISTS clue1 TEXT NOT NULL DEFAULT '';
ALTER TABLE parva26_puzzles ADD COLUMN IF NOT EXISTS clue2 TEXT NOT NULL DEFAULT '';

-- 3. One row per game: the five reels drawn for a visitor, for one day. The
--    server keeps the score; the page only sends guesses. `id` is the
--    visitor's key to their own game, so it is never shown to anyone else.
CREATE TABLE IF NOT EXISTS parva26_plays (
    id UUID PRIMARY KEY,
    day INTEGER NOT NULL,                       -- days since 1970 in IST
    reel_ids TEXT[] NOT NULL,                   -- the game's five, fixed at the start
    reel INTEGER NOT NULL DEFAULT 0,            -- 0-4 while playing, 5 when done
    wrong INTEGER NOT NULL DEFAULT 0,           -- on the current reel
    hints INTEGER NOT NULL DEFAULT 0,           -- on the current reel
    reel_started_at TIMESTAMPTZ NOT NULL,
    results JSONB NOT NULL DEFAULT '[]',
    score INTEGER NOT NULL DEFAULT 0,
    finished BOOLEAN NOT NULL DEFAULT FALSE,
    finished_at TIMESTAMPTZ,
    name TEXT,                                  -- for the duty chart, asked at the end
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Today's chart: finished, named games by score
CREATE INDEX IF NOT EXISTS idx_parva26_plays_chart
    ON parva26_plays (day, score DESC, finished_at)
    WHERE finished AND name IS NOT NULL;

-- 4. Wrong guesses, to find the spellings people really use. After a day,
--    the most common ones for each film:
--      SELECT puzzle_id, lower(guess) AS guess, count(*) AS times
--      FROM parva26_guesses GROUP BY 1, 2 ORDER BY times DESC LIMIT 100;
--    The real spellings go into that film's `accept` in the films file.
CREATE TABLE IF NOT EXISTS parva26_guesses (
    id BIGSERIAL PRIMARY KEY,
    puzzle_id TEXT NOT NULL,
    guess TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only the server (service role) reads or writes these
ALTER TABLE parva26_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE parva26_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parva26_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE parva26_guesses ENABLE ROW LEVEL SECURITY;
