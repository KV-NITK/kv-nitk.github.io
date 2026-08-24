import crypto from "crypto";
import { supabase } from "../config/supabase.js";

const SESSION_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const sessionProfileMap = new Map();

export const createSession = async (userId, sessionType, userData = null) => {
  const sessionId = crypto.randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  ).toISOString();

  const { error } = await supabase
    .from("sessions")
    .insert({
      id: sessionId,
      user_id: userId,
      session_type: sessionType,
      expires_at: expiresAt,
    });

  if (error) {
    throw error;
  }

  if (userData) {
    sessionProfileMap.set(sessionId, userData);
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
    data.user_data = sessionProfileMap.get(sessionId) || null;
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