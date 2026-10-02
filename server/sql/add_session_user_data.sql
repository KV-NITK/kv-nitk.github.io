-- Store the IRIS profile with the session instead of in server memory
-- (memory is lost on restart, and the old fallback was an editable cookie).
-- Safe to re-run. Existing sessions keep working but have no profile until
-- the user logs in again.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_data JSONB;
