-- ==========================================================
-- Parva 2026 landing page games: the flowers thrown at Samudrappa (Scene 9)
-- and "Which film?" (Scene 11). No login for either. Safe to re-run.
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
--    until the reel is over. `sort` orders the pool: each day takes the next
--    five. `accept` holds other spellings people type. To add puzzles, insert
--    rows; to take one out of rotation, set active = FALSE.
CREATE TABLE IF NOT EXISTS parva26_puzzles (
    id TEXT PRIMARY KEY,
    sort INTEGER NOT NULL,
    emoji TEXT[] NOT NULL,          -- Twemoji code points, as in assets/emoji
    alt TEXT NOT NULL,              -- describes the pictures, not the answer
    answer_kn TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    accept TEXT[] NOT NULL DEFAULT '{}',
    year INTEGER NOT NULL,          -- the first hint
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO parva26_puzzles (id, sort, emoji, alt, answer_kn, answer_en, accept, year) VALUES
    ('mungaru-male', 1, '{1f327,1f430,1f494}', 'rain cloud, rabbit, broken heart', 'ಮುಂಗಾರು ಮಳೆ', 'Mungaru Male', '{mungaaru male,mungarumale}', 2006),
    ('kgf', 2, '{26cf,1f4b0,1f451}', 'pick, money bag, crown', 'ಕೆ.ಜಿ.ಎಫ್', 'K.G.F', '{kgf chapter 1,kgf 1,kgf chapter one,ಕೆಜಿಎಫ್}', 2018),
    ('kantara', 3, '{1f417,1f525,1f333}', 'boar, fire, tree', 'ಕಾಂತಾರ', 'Kantara', '{kanthara}', 2022),
    ('lucia', 4, '{1f48a,1f634,1f3ac}', 'pill, sleeping face, clapper board', 'ಲೂಸಿಯಾ', 'Lucia', '{ಲೂಸಿಯ}', 2013),
    ('naagarahaavu', 5, '{1f40d,1f393,1f620}', 'snake, graduation cap, angry face', 'ನಾಗರಹಾವು', 'Naagarahaavu', '{nagarahavu,nagarahaavu,naagarahavu,nagara haavu}', 1972),
    ('gandhada-gudi', 6, '{1f6d5,1f333,1f418}', 'temple, tree, elephant', 'ಗಂಧದ ಗುಡಿ', 'Gandhada Gudi', '{gandada gudi,gandhadagudi}', 1973),
    ('bangarada-manushya', 7, '{1f947,1f468-200d-1f33e,1f33e}', 'gold medal, farmer, sheaf of rice', 'ಬಂಗಾರದ ಮನುಷ್ಯ', 'Bangarada Manushya', '{bangaarada manushya,bangarada manushyaa}', 1972),
    ('kirik-party', 8, '{1f3eb,1f389,1f61c}', 'school, party popper, winking face with tongue', 'ಕಿರಿಕ್ ಪಾರ್ಟಿ', 'Kirik Party', '{kirick party,kirikparty}', 2016),
    ('rangitaranga', 9, '{1f308,1f30a,1f47b}', 'rainbow, water wave, ghost', 'ರಂಗಿತರಂಗ', 'RangiTaranga', '{rangi taranga}', 2015),
    ('ondu-motteya-kathe', 10, '{31-20e3,1f95a,1f4d6}', 'number one, egg, open book', 'ಒಂದು ಮೊಟ್ಟೆಯ ಕಥೆ', 'Ondu Motteya Kathe', '{ondu motteya kate,ondu motteya katha}', 2017)
ON CONFLICT (id) DO NOTHING;

-- 3. One row per game: a visitor's five reels for one day. The server keeps
--    the score; the page only sends guesses. `id` is the visitor's key to
--    their own game, so it is never shown to anyone else.
CREATE TABLE IF NOT EXISTS parva26_plays (
    id UUID PRIMARY KEY,
    day INTEGER NOT NULL,                       -- days since 1970 in IST
    reel_ids TEXT[] NOT NULL,                   -- the day's five, fixed at the start
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

-- Only the server (service role) reads or writes these
ALTER TABLE parva26_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE parva26_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parva26_plays ENABLE ROW LEVEL SECURITY;
