import { supabase } from "../config/supabase.js";

// In-memory cache fallback in case table hasn't been migrated yet
const localFeedbackCache = [];

/**
 * Check if the user (as a team leader or team member) has already submitted feedback
 */
export const getUserFeedback = async (user) => {
  if (!user) return null;

  const irisId = user.irisId ? String(user.irisId).trim() : null;
  const rollNo = user.rollNo ? user.rollNo.trim().toUpperCase() : null;
  const email = user.email ? user.email.trim().toLowerCase() : null;

  try {
    const conditions = [];
    if (irisId) conditions.push(`user_iris_id.eq.${irisId}`);
    if (rollNo) conditions.push(`user_roll_no.eq.${rollNo}`);
    if (email) conditions.push(`user_email.eq.${email}`);

    if (conditions.length > 0) {
      const { data, error } = await supabase
        .from("event_feedback")
        .select("*")
        .or(conditions.join(","))
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("getUserFeedback Supabase query error:", err);
  }

  // Fallback to in-memory lookup
  return (
    localFeedbackCache.find(
      (f) =>
        (irisId && f.user_iris_id === irisId) ||
        (rollNo && f.user_roll_no === rollNo) ||
        (email && f.user_email === email)
    ) || null
  );
};

/**
 * Save or update feedback for a single member / leader of a team
 */
export const saveEventFeedback = async ({
  teamId,
  teamName,
  userIrisId,
  userName,
  userEmail,
  userRollNo,
  userRole,
  eventRating,
  clueDifficulty,
  favoriteMoment,
  suggestions,
}) => {
  const cleanRoll = userRollNo ? userRollNo.trim().toUpperCase() : "";
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : "";
  const cleanIrisId = userIrisId ? String(userIrisId).trim() : cleanRoll;

  const payload = {
    team_id: teamId || null,
    team_name: teamName,
    user_iris_id: cleanIrisId,
    user_name: userName || "Participant",
    user_email: cleanEmail,
    user_roll_no: cleanRoll,
    user_role: userRole || "member",
    event_rating: Number(eventRating),
    clue_difficulty: Number(clueDifficulty),
    favorite_moment: favoriteMoment,
    suggestions: suggestions,
    updated_at: new Date().toISOString(),
  };

  try {
    // Check if previous response exists
    const existing = await getUserFeedback({
      irisId: cleanIrisId,
      rollNo: cleanRoll,
      email: cleanEmail,
    });

    if (existing && existing.id) {
      // Update existing response
      const { data, error } = await supabase
        .from("event_feedback")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } else {
      // Insert new response
      const { data, error } = await supabase
        .from("event_feedback")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("Feedback save Supabase error:", err);
  }

  // Fallback to local memory cache
  const idx = localFeedbackCache.findIndex(
    (f) =>
      f.user_iris_id === cleanIrisId ||
      f.user_roll_no === cleanRoll ||
      f.user_email === cleanEmail
  );

  if (idx !== -1) {
    localFeedbackCache[idx] = { ...localFeedbackCache[idx], ...payload };
    return localFeedbackCache[idx];
  } else {
    const fallbackEntry = {
      id: "mem-" + Date.now(),
      ...payload,
      created_at: new Date().toISOString(),
    };
    localFeedbackCache.push(fallbackEntry);
    return fallbackEntry;
  }
};

/**
 * Get all feedback responses submitted by members of a specific team
 */
export const getTeamFeedback = async (teamId) => {
  if (!teamId) return [];

  try {
    const { data, error } = await supabase
      .from("event_feedback")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.error("getTeamFeedback error:", err);
  }

  return localFeedbackCache.filter((f) => f.team_id === teamId);
};

/**
 * Get all feedback responses across all teams
 */
export const getAllFeedback = async () => {
  try {
    const { data, error } = await supabase
      .from("event_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.error("Fetch all feedback error:", err);
  }

  return localFeedbackCache;
};
