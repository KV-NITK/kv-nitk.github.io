import { supabase } from "../../config/supabase.js";

// The shared count of flowers thrown at Samudrappa (Parva 2026, Scene 9).
// Taps arrive in batches from every open page, so they are added up here and
// written to the database at most once every FLUSH_EVERY_MS, in one atomic
// add; reads come from memory and refresh from the database every
// REFRESH_EVERY_MS. If the server stops, at most the last couple of seconds
// of taps are lost.

const FLUSH_EVERY_MS = 2000;
const REFRESH_EVERY_MS = 5000;

let saved = null; // the database's total, as last seen
let savedAt = 0;
let pending = 0; // taps not yet written
let flushing = null;

const refresh = async () => {
  const { data, error } = await supabase
    .from("parva26_counters")
    .select("value")
    .eq("id", "hoomale")
    .maybeSingle();

  if (error) throw error;

  saved = Number(data?.value) || 0;
  savedAt = Date.now();
};

export const getFlowers = async () => {
  if (saved === null || Date.now() - savedAt > REFRESH_EVERY_MS) {
    // A flush in flight would make the total dip for a moment; wait for it
    if (flushing) await flushing;
    await refresh();
  }

  return saved + pending;
};

export const addFlowers = async (count) => {
  pending += count;
  return getFlowers();
};

export const flushFlowers = async () => {
  if (flushing || !pending) return flushing;

  const amount = pending;
  pending = 0;

  flushing = (async () => {
    try {
      const { data, error } = await supabase.rpc("parva26_add_flowers", { amount });
      if (error) throw error;
      saved = Number(data) || 0;
      savedAt = Date.now();
    } catch (err) {
      pending += amount; // try again on the next flush
      console.warn("Could not save the flower count:", err.message);
    } finally {
      flushing = null;
    }
  })();

  return flushing;
};

setInterval(flushFlowers, FLUSH_EVERY_MS).unref();

// For tests
export const resetFlowers = () => {
  saved = null;
  savedAt = 0;
  pending = 0;
  flushing = null;
};
