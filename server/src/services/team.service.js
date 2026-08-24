import { supabase } from "../config/supabase.js";


// ==========================================
// Check team name
// ==========================================

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


// ==========================================
// Check if leader already has a team
// ==========================================

export const checkLeaderExists = async (leaderIrisId) => {
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_iris_id", leaderIrisId)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Failed to check leader registration status"
    );
  }

  return !!data;
};


// ==========================================
// Check leader roll number
// ==========================================

export const checkLeaderRollNoExists = async (rollNo) => {
  const normalizedRollNo = rollNo
    .trim()
    .toUpperCase();

  // Check if roll number already exists as a leader
  const { data: leader, error: leaderError } =
    await supabase
      .from("teams")
      .select("id")
      .eq("leader_roll_no", normalizedRollNo)
      .maybeSingle();

  if (leaderError) {
    throw new Error(
      "Failed to check leader roll number"
    );
  }

  if (leader) {
    return true;
  }

  // Check if roll number already exists as a member
  const { data: member, error: memberError } =
    await supabase
      .from("team_members")
      .select("id")
      .eq("roll_no", normalizedRollNo)
      .maybeSingle();

  if (memberError) {
    throw new Error(
      "Failed to check member roll number"
    );
  }

  return !!member;
};


// ==========================================
// Validate member details
// ==========================================

export const validateMemberDetails = (
  members,
  leaderRollNo = null
) => {
  const emails = members.map((member) =>
    member.email.trim().toLowerCase()
  );

  const rollNumbers = members.map((member) =>
    member.rollNo.trim().toUpperCase()
  );

  // ----------------------------------------
  // Leader roll number cannot be a member
  // ----------------------------------------

  if (
    leaderRollNo &&
    rollNumbers.includes(
      leaderRollNo.trim().toUpperCase()
    )
  ) {
    return {
      valid: false,
      message:
        "Leader roll number cannot be included in the members list",
    };
  }

  // ----------------------------------------
  // Duplicate emails in same request
  // ----------------------------------------

  const uniqueEmails = new Set(emails);

  if (uniqueEmails.size !== emails.length) {
    return {
      valid: false,
      message:
        "Duplicate member email addresses are not allowed",
    };
  }

  // ----------------------------------------
  // Duplicate roll numbers in same request
  // ----------------------------------------

  const uniqueRollNumbers = new Set(rollNumbers);

  if (
    uniqueRollNumbers.size !== rollNumbers.length
  ) {
    return {
      valid: false,
      message:
        "Duplicate member roll numbers are not allowed",
    };
  }

  return {
    valid: true,
  };
};


// ==========================================
// Check existing members
// Email OR roll number already registered
// ==========================================

export const checkExistingMembers = async (members) => {
  const emails = members.map((member) =>
    member.email.trim().toLowerCase()
  );

  const rollNumbers = members.map((member) =>
    member.rollNo.trim().toUpperCase()
  );

  // ----------------------------------------
  // Existing emails
  // ----------------------------------------

  const { data: emailData, error: emailError } =
    await supabase
      .from("team_members")
      .select("email")
      .in("normalized_email", emails);

  if (emailError) {
    throw new Error(
      "Failed to check member emails"
    );
  }

  // ----------------------------------------
  // Existing roll numbers
  // ----------------------------------------

  const { data: rollData, error: rollError } =
    await supabase
      .from("team_members")
      .select("roll_no")
      .in("roll_no", rollNumbers);

  if (rollError) {
    throw new Error(
      "Failed to check member roll numbers"
    );
  }

  return {
    emails: emailData.map(
      (member) => member.email
    ),

    rollNumbers: rollData.map(
      (member) => member.roll_no
    ),
  };
};


// ==========================================
// Create team
// ==========================================

export const createTeam = async ({
  teamName,
  passwordHash,
  leaderIrisId,
  leaderRollNo,
  members,
}) => {
  const { data, error } = await supabase.rpc(
    "register_team",
    {
      p_team_name: teamName,

      p_password_hash: passwordHash,

      p_leader_iris_id: leaderIrisId,

      p_leader_roll_no: leaderRollNo,

      p_members: members,
    }
  );

  if (error) {
    console.error(
      "Create team error:",
      error
    );

    throw error;
  }

  return data;
};