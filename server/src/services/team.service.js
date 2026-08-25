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
  const emails = members
    .map((member) => (member.email ? member.email.trim().toLowerCase() : ""))
    .filter((e) => e.length > 0);

  const rollNumbers = members.map((member) =>
    member.rollNo ? member.rollNo.trim().toUpperCase() : ""
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
  // Duplicate emails in same request (if provided)
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
// TODO: Consolidate normalized_email into email column directly since email is already trimmed & lowercased.
// ==========================================

export const checkExistingMembers = async (members) => {
  const emails = members
    .map((member) => (member.email ? member.email.trim().toLowerCase() : ""))
    .filter((e) => e.length > 0);

  const rollNumbers = members.map((member) =>
    member.rollNo ? member.rollNo.trim().toUpperCase() : ""
  );

  // ----------------------------------------
  // Existing emails (only check non-empty)
  // ----------------------------------------

  let emailData = [];
  if (emails.length > 0) {
    const { data, error: emailError } = await supabase
      .from("team_members")
      .select("email")
      .in("normalized_email", emails);

    if (emailError) {
      throw new Error("Failed to check member emails");
    }
    emailData = data || [];
  }

  // ----------------------------------------
  // Existing roll numbers
  // ----------------------------------------

  const { data: rollData, error: rollError } = await supabase
    .from("team_members")
    .select("roll_no")
    .in("roll_no", rollNumbers);

  if (rollError) {
    throw new Error("Failed to check member roll numbers");
  }

  return {
    emails: emailData.map((member) => member.email),
    rollNumbers: (rollData || []).map((member) => member.roll_no),
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
  leaderName,
  leaderEmail,
  members,
}) => {
  const formattedMembers = members.map((m) => {
    const roll = (m.rollNo || "").trim().toUpperCase();
    const cleanEmail = m.email ? m.email.trim().toLowerCase() : "";
    return {
      name: (m.name || "").trim(),
      rollNo: roll,
      email: cleanEmail.length > 0 ? cleanEmail : `${roll.toLowerCase()}@noemail.local`,
    };
  });

  const { data: teamId, error } = await supabase.rpc("register_team", {
    p_team_name: teamName,
    p_password_hash: passwordHash,
    p_leader_iris_id: leaderIrisId,
    p_leader_roll_no: leaderRollNo,
    p_members: formattedMembers,
  });

  if (error) {
    console.error("Create team error:", error);
    throw error;
  }

  // Save leader details to team_members table so all squad members can view the leader name
  if (teamId && (leaderName || leaderRollNo)) {
    const cleanLeaderEmail = leaderEmail
      ? leaderEmail.trim().toLowerCase()
      : `${(leaderRollNo || "leader").toLowerCase()}@noemail.local`;
    try {
      await supabase.from("team_members").insert({
        team_id: teamId,
        name: leaderName || "Squad Leader",
        email: cleanLeaderEmail,
        normalized_email: cleanLeaderEmail,
        role: "leader",
        roll_no: (leaderRollNo || "").trim().toUpperCase(),
      });
    } catch (lErr) {
      console.error("Failed to insert leader row in team_members:", lErr);
    }
  }

  return teamId;
};


// ==========================================
// Get User's Team (as Leader or Member)
// ==========================================

export const getUserTeam = async (user) => {
  if (!user) return null;

  const rollNo = user.rollNo ? user.rollNo.trim().toUpperCase() : null;
  const email = user.email ? user.email.trim().toLowerCase() : null;
  const irisId = user.irisId ? String(user.irisId) : null;

  let team = null;

  // 1. Check if user is a Leader
  if (irisId || rollNo) {
    let query = supabase
      .from("teams")
      .select("id, team_name, leader_iris_id, leader_roll_no, status, created_at");

    if (irisId) {
      query = query.eq("leader_iris_id", irisId);
    } else {
      query = query.eq("leader_roll_no", rollNo);
    }

    const { data: leaderTeam, error } = await query.maybeSingle();

    if (error) {
      console.error("Error finding leader team:", error);
    } else if (leaderTeam) {
      team = { ...leaderTeam, role: "leader" };
    }
  }

  // 2. If not a leader, check if user is a Member
  if (!team && (rollNo || email)) {
    let memberMatch = null;

    if (rollNo) {
      const { data } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("roll_no", rollNo)
        .maybeSingle();
      memberMatch = data;
    }

    if (!memberMatch && email) {
      const { data } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("normalized_email", email)
        .maybeSingle();
      memberMatch = data;
    }

    if (memberMatch) {
      const { data: memberTeam, error } = await supabase
        .from("teams")
        .select("id, team_name, leader_iris_id, leader_roll_no, status, created_at")
        .eq("id", memberMatch.team_id)
        .maybeSingle();

      if (error) {
        console.error("Error finding member team:", error);
      } else if (memberTeam) {
        team = { ...memberTeam, role: "member" };
      }
    }
  }

  if (!team) return null;

  // 3. Fetch all squad members for this team
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("id, name, roll_no, email, role")
    .eq("team_id", team.id);

  if (membersError) {
    console.error("Error fetching team members:", membersError);
  }

  const leaderMember = (members || []).find(
    (m) => m.role === "leader" || (m.roll_no && m.roll_no === team.leader_roll_no)
  );

  const squadMembers = (members || []).filter(
    (m) => m.role !== "leader" && m.roll_no !== team.leader_roll_no
  );

  const sanitizedMembers = squadMembers.map((m) => ({
    ...m,
    email: m.email && m.email.endsWith("@noemail.local") ? "" : m.email,
  }));

  const leaderName = leaderMember
    ? leaderMember.name
    : team.role === "leader" && user
    ? user.name
    : "";

  const leaderEmail = leaderMember
    ? leaderMember.email
    : team.role === "leader" && user
    ? user.email
    : "";

  return {
    id: team.id,
    teamName: team.team_name,
    status: team.status,
    role: team.role,
    leader: {
      name: leaderName,
      email: leaderEmail && leaderEmail.endsWith("@noemail.local") ? "" : leaderEmail,
      irisId: team.leader_iris_id,
      rollNo: team.leader_roll_no,
    },
    members: sanitizedMembers,
  };
};


// ==========================================
// Delete team (Leader only)
// ==========================================

export const deleteTeamByLeader = async (user) => {
  if (!user) {
    return { success: false, message: "User authentication required" };
  }

  const rollNo = user.rollNo ? user.rollNo.trim().toUpperCase() : null;
  const irisId = user.irisId ? String(user.irisId) : null;

  if (!irisId && !rollNo) {
    return { success: false, message: "User roll number or IRIS ID required" };
  }

  // 1. Find team where user is leader
  let query = supabase.from("teams").select("id, team_name");
  if (irisId) {
    query = query.eq("leader_iris_id", irisId);
  } else {
    query = query.eq("leader_roll_no", rollNo);
  }

  const { data: team, error } = await query.maybeSingle();

  if (error) {
    console.error("Error finding leader team for deletion:", error);
    throw new Error("Database query error while checking team leadership");
  }

  if (!team) {
    return {
      success: false,
      message: "Only the squad leader can delete the team, or team was not found",
    };
  }

  // 2. Delete team members
  const { error: membersDeleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", team.id);

  if (membersDeleteError) {
    console.error("Error deleting team members:", membersDeleteError);
    throw new Error("Failed to delete squad members");
  }

  // 3. Delete team entry
  const { error: teamDeleteError } = await supabase
    .from("teams")
    .delete()
    .eq("id", team.id);

  if (teamDeleteError) {
    console.error("Error deleting team:", teamDeleteError);
    throw new Error("Failed to delete squad");
  }

  return {
    success: true,
    message: `Squad "${team.team_name}" deleted successfully`,
  };
};