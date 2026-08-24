import crypto from "crypto";
import { supabase } from "../config/supabase.js";

const SESSION_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export const createSession = async (userId, sessionType) => {
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

  return {
    sessionId,
    expiresAt,
  };
};

export const getSession = async (sessionId) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("user_id, session_type, expires_at")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw error;
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