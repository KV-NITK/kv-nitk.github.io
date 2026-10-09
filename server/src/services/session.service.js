import crypto from "crypto";
import { supabase } from "../config/supabase.js";

const SESSION_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const sessionProfileMap = new Map();
const inMemorySessions = new Map();

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

  // sessions table not present in Supabase schema:
  // keep logging in with session stored in server memory
  if (error?.code === "PGRST205") {
    console.warn("sessions table missing in Supabase schema, storing session in memory only");
    inMemorySessions.set(sessionId, {
      ...row,
      user_data: userData,
    });
    return {
      sessionId,
      expiresAt,
    };
  }

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
  const inMem = inMemorySessions.get(sessionId);
  if (inMem) {
    if (new Date(inMem.expires_at) > new Date()) {
      return inMem;
    } else {
      inMemorySessions.delete(sessionId);
      return null;
    }
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST205") return null;
    throw error;
  }

  if (data) {
    data.user_data = data.user_data || sessionProfileMap.get(sessionId) || null;
  }

  return data;
};

export const deleteSession = async (sessionId) => {
  inMemorySessions.delete(sessionId);
  sessionProfileMap.delete(sessionId);

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error && error.code !== "PGRST205") {
    throw error;
  }
};