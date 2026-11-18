-- Add CHECK constraint: team_size must be between 2 and 4 (inclusive)
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_size_check" CHECK (team_size >= 2 AND team_size <= 4);
