import crypto from "crypto";
import { supabase } from "../config/supabase.js";

const SESSION_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const sessionProfileMap = new Map();

export const createSession = async (userId, sessionType, userData = null) => {
  const sessionId = crypto.randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  ).toISOString();

  const row = {
    id: sessionId,
    user_id: userId,
    session_type: sessionType,
    expires_at: expiresAt,
  };

  let { error } = await supabase
    .from("sessions")
    .insert(userData ? { ...row, user_data: userData } : row);

  // sessions.user_data not migrated yet (sql/add_session_user_data.sql):
  // keep logging in, with the profile held in memory only
  if (error?.code === "PGRST204" && userData) {
    console.warn("sessions.user_data column missing, storing profile in memory only");

    ({ error } = await supabase.from("sessions").insert(row));

    if (!error) {
      sessionProfileMap.set(sessionId, userData);
    }
  }

  if (error) {
    throw error;
  }

  return {
    sessionId,
    expiresAt,
  };
};

export const getSession = async (sessionId) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    data.user_data = data.user_data || sessionProfileMap.get(sessionId) || null;
  }

  return data;
};

export const deleteSession = async (sessionId) => {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    throw error;
  }
};