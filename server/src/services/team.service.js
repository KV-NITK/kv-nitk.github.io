import { supabase } from "../config/supabase.js";


export const checkTeamNameExists = async (teamName) => {
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("team_name", teamName)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to check team name");
  }

  return !!data;
};

export const checkMemberEmailsExist = async (members) => {
  const emails = members.map((member) =>
    member.email.trim().toLowerCase()
  );

  const { data, error } = await supabase
    .from("team_members")
    .select("email")
    .in("email", emails);

  if (error) {
    throw new Error("Failed to check member emails");
  }

  return data;
};

export const checkLeaderExists = async (leaderIrisId) => {
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_iris_id", leaderIrisId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to check leader registration status");
  }

  return !!data;
};

export const validateMemberEmails = (members, leaderEmail = null) => {
  const emails = members.map((member) =>
    member.email.trim().toLowerCase()
  );

  if (leaderEmail && emails.includes(leaderEmail.trim().toLowerCase())) {
    return {
      valid: false,
      message: "Leader email cannot be included in the members list",
    };
  }

  const uniqueEmails = new Set(emails);

  if (uniqueEmails.size !== emails.length) {
    return {
      valid: false,
      message: "Duplicate member email addresses are not allowed",
    };
  }

  return {
    valid: true,
  };
};

export const createTeam = async ({
  teamName,
  passwordHash,
  leaderIrisId,
  members,
}) => {
  const { data, error } = await supabase.rpc("register_team", {
    p_team_name: teamName,
    p_password_hash: passwordHash,
    p_leader_iris_id: leaderIrisId,
    p_members: members,
  });

  if (error) {
    console.error("Create team error:", error);
    throw error;
  }

  return data;
};