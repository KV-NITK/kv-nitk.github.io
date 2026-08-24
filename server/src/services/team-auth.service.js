import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";

export const authenticateTeam = async (teamName, password) => {
  const { data: team, error } = await supabase
    .from("teams")
    .select("id, team_name, password_hash, status")
    .eq("team_name", teamName)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Failed to find team");
  }

  // Don't reveal whether the team exists
  if (!team) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    team.password_hash
  );

  if (!passwordMatches) {
    return null;
  }

  return {
    id: team.id,
    teamName: team.team_name,
  };
};