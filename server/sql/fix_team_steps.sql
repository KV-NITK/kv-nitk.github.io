-- Fix any teams with NULL or invalid current_step_no by setting them to Step 1
UPDATE teams
SET current_step_no = 1
WHERE current_step_no IS NULL OR current_step_no < 1;

-- Ensure default current_step_no for newly registered teams is 1
ALTER TABLE teams 
ALTER COLUMN current_step_no SET DEFAULT 1;

-- Verification Query: Check distribution of step numbers across active teams
SELECT 
  current_step_no, 
  COUNT(*) as total_teams 
FROM teams 
GROUP BY current_step_no 
ORDER BY current_step_no ASC;
