-- ============================================================
-- Round-Robin Path Assignment for all registered teams
-- 
-- Formula: ((ROW_NUMBER - 1) % 9) + 1
-- Maps:
--   Team #1, #10, #19, #28... -> Path 1
--   Team #2, #11, #20, #29... -> Path 2
--   Team #3, #12, #21, #30... -> Path 3
--   ... up to Path 9
-- ============================================================

WITH numbered_teams AS (
  SELECT 
    id, 
    team_name,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS row_num
  FROM teams
)
UPDATE teams
SET 
  path_id = ((numbered_teams.row_num - 1) % 9) + 1,
  current_step_no = 1
FROM numbered_teams
WHERE teams.id = numbered_teams.id;

-- ============================================================
-- VERIFICATION: Check assigned path_id distribution
-- ============================================================
SELECT 
  path_id, 
  COUNT(*) AS total_teams,
  STRING_AGG(team_name, ', ') AS teams
FROM teams
GROUP BY path_id
ORDER BY path_id;
