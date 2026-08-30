-- ==========================================================
-- Event Feedback Table for Hudugata Hudakata 2026
-- ==========================================================
-- Multiple members from the same team can submit individual feedback.
-- Each member/leader is restricted to one response (enforced by user_iris_id/user_roll_no unique constraint).
-- ==========================================================

CREATE TABLE IF NOT EXISTS event_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team_name TEXT NOT NULL,
    user_iris_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_roll_no TEXT NOT NULL,
    user_role TEXT DEFAULT 'member', -- 'leader' or 'member'
    event_rating INTEGER NOT NULL CHECK (event_rating >= 1 AND event_rating <= 5),
    clue_difficulty INTEGER NOT NULL CHECK (clue_difficulty >= 1 AND clue_difficulty <= 5),
    favorite_moment TEXT NOT NULL,
    suggestions TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_iris_feedback UNIQUE (user_iris_id)
);

-- Indices for rapid lookup by team and participant
CREATE INDEX IF NOT EXISTS idx_event_feedback_team_id ON event_feedback(team_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_roll_no ON event_feedback(user_roll_no);
CREATE INDEX IF NOT EXISTS idx_event_feedback_created_at ON event_feedback(created_at);
