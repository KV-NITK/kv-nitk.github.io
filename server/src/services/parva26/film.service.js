import crypto from "crypto";
import { supabase } from "../../config/supabase.js";
import { isRight, firstLetters } from "./answers.js";
import { cleanName } from "./names.js";

// "Which film?" (Parva 2026, Scene 11). Each day there are five reels, the
// same for everyone; each shows a film as three emoji. Three tries, two
// hints. The answers stay here: the page sends a guess and hears right or
// wrong, and learns the answer only when the reel is over. The server also
// keeps the clock and the score, so a score on the chart was really played.

export const PER_DAY = 5;
export const MAX_TRIES = 3;
export const MAX_HINTS = 2;
const CHART_SIZE = 10;

const IST = 5.5 * 3600_000;
const DAY = 86_400_000;
// The can's leaving animation between reels, so it isn't on the clock
const BETWEEN_REELS_MS = 2000;
const POOL_CACHE_MS = 60_000;

export const dayNumber = (t = Date.now()) => Math.floor((t + IST) / DAY);
const nextReelsAt = (day) => new Date((day + 1) * DAY - IST).toISOString();

// Points for one reel: a base, a bonus for speed, less for wrong tries and
// hints; nothing if it was missed.
export const scoreFor = ({ solved, wrong, hints, seconds }) => {
  if (!solved) return 0;
  return Math.max(10, 60 + Math.max(0, 40 - Math.floor(seconds / 3)) - 10 * wrong - 5 * hints);
};

// Errors safe to show to the player
export class FilmError extends Error {
  constructor(message, statusCode = 400, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

let pool = null;
let poolAt = 0;

// Every puzzle, active or not, so a game started before one is retired can
// still finish. Cached for a minute.
const loadPool = async () => {
  if (pool && Date.now() - poolAt < POOL_CACHE_MS) return pool;

  const { data, error } = await supabase
    .from("parva26_puzzles")
    .select("id, sort, emoji, alt, answer_kn, answer_en, accept, year, active")
    .order("sort", { ascending: true });

  if (error) throw error;

  pool = data || [];
  poolAt = Date.now();
  return pool;
};

// Today's five: a window into the active pool that moves on each day.
const reelsFor = (active, day) => {
  if (!active.length) throw new FilmError("No reels today. Please come back later.", 503, "NO_PUZZLES");
  const start = (day * PER_DAY) % active.length;
  return Array.from({ length: Math.min(PER_DAY, active.length) }, (_, i) => active[(start + i) % active.length]);
};

const answerOf = (p) => ({ kn: p.answer_kn, en: p.answer_en });

// What the page is allowed to see of a game. A puzzle's id is usually the
// film's name (mungaru-male), so the page gets reels by place (r1-r5) instead.
const toPublic = (play, puzzles) => {
  const reels = play.reel_ids.map((id) => puzzles.find((p) => p.id === id));
  const current = play.finished ? null : reels[play.reel];
  const reelId = (i) => `r${i + 1}`;

  return {
    id: play.id,
    day: play.day,
    reel: play.reel,
    reelCount: reels.length,
    wrong: play.wrong,
    hints: play.hints,
    reels: reels.map((p, i) => ({ id: reelId(i), emoji: p.emoji, alt: p.alt, year: p.year })),
    letter: current && play.hints >= 2 ? firstLetters(current) : null,
    results: play.results.map((r, i) => ({ ...r, id: reelId(i) })),
    total: play.score,
    finished: play.finished,
    name: play.name,
    nextReelsAt: nextReelsAt(play.day),
  };
};

const fetchPlay = async (playId) => {
  const { data, error } = await supabase
    .from("parva26_plays")
    .select("*")
    .eq("id", playId)
    .maybeSingle();

  if (error) throw error;

  // Yesterday's game is over; the page starts a new one
  if (!data || data.day !== dayNumber()) {
    throw new FilmError("This game has ended.", 404, "PLAY_ENDED");
  }

  return data;
};

// Writes only if nobody else changed the game since it was read (two taps on
// Submit at once, say); otherwise the player is asked to try again.
const savePlay = async (play, changes) => {
  const { data, error } = await supabase
    .from("parva26_plays")
    .update(changes)
    .eq("id", play.id)
    .eq("reel", play.reel)
    .eq("wrong", play.wrong)
    .eq("hints", play.hints)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new FilmError("Please try that again.", 409, "PLAY_CHANGED");

  return data;
};

export const startPlay = async () => {
  const puzzles = await loadPool();
  const day = dayNumber();
  const reels = reelsFor(puzzles.filter((p) => p.active), day);

  const { data, error } = await supabase
    .from("parva26_plays")
    .insert({
      id: crypto.randomUUID(),
      day,
      reel_ids: reels.map((p) => p.id),
      reel: 0,
      wrong: 0,
      hints: 0,
      reel_started_at: new Date().toISOString(),
      results: [],
      score: 0,
      finished: false,
    })
    .select()
    .single();

  if (error) throw error;

  return toPublic(data, puzzles);
};

export const getPlay = async (playId) => {
  const [play, puzzles] = await Promise.all([fetchPlay(playId), loadPool()]);
  return toPublic(play, puzzles);
};

// outcome: "right", "wrong" (tries left) or "out" (the reel is lost)
export const guess = async (playId, text) => {
  const [play, puzzles] = await Promise.all([fetchPlay(playId), loadPool()]);
  if (play.finished) throw new FilmError("Today's reels are done.", 409, "PLAY_FINISHED");

  const puzzle = puzzles.find((p) => p.id === play.reel_ids[play.reel]);
  const right = isRight(text, puzzle);

  if (!right && play.wrong + 1 < MAX_TRIES) {
    const saved = await savePlay(play, { wrong: play.wrong + 1 });
    return { outcome: "wrong", play: toPublic(saved, puzzles) };
  }

  const now = Date.now();
  const wrong = right ? play.wrong : play.wrong + 1;
  const seconds = Math.max(0, Math.floor((now - Date.parse(play.reel_started_at)) / 1000));
  const result = {
    id: puzzle.id,
    solved: right,
    wrong,
    hints: play.hints,
    seconds,
    score: scoreFor({ solved: right, wrong, hints: play.hints, seconds }),
    answer: answerOf(puzzle),
  };
  const reel = play.reel + 1;
  const finished = reel >= play.reel_ids.length;

  const saved = await savePlay(play, {
    reel,
    wrong: 0,
    hints: 0,
    reel_started_at: new Date(now + BETWEEN_REELS_MS).toISOString(),
    results: [...play.results, result],
    score: play.score + result.score,
    finished,
    finished_at: finished ? new Date(now).toISOString() : null,
  });

  return { outcome: right ? "right" : "out", answer: answerOf(puzzle), play: toPublic(saved, puzzles) };
};

export const hint = async (playId) => {
  const [play, puzzles] = await Promise.all([fetchPlay(playId), loadPool()]);
  if (play.finished) throw new FilmError("Today's reels are done.", 409, "PLAY_FINISHED");
  if (play.hints >= MAX_HINTS) throw new FilmError("No more hints for this reel.", 400, "NO_MORE_HINTS");

  const saved = await savePlay(play, { hints: play.hints + 1 });
  return toPublic(saved, puzzles);
};

// The name goes on the chart once the five reels are done; it can be changed
// until midnight.
export const setName = async (playId, value) => {
  const play = await fetchPlay(playId);
  if (!play.finished) throw new FilmError("Finish today's reels first.", 409, "PLAY_NOT_FINISHED");

  let name;
  try {
    name = cleanName(value);
  } catch (err) {
    throw new FilmError(err.message, 400, "BAD_NAME");
  }

  const { error } = await supabase.from("parva26_plays").update({ name }).eq("id", play.id);
  if (error) throw error;

  return name;
};

// Today's top 10, and where the asking player stands (also before they have
// given a name, so they can see what it would get them).
export const getChart = async (playId = null) => {
  const day = dayNumber();

  const { data, error } = await supabase
    .from("parva26_plays")
    .select("id, name, score")
    .eq("day", day)
    .eq("finished", true)
    .not("name", "is", null)
    .order("score", { ascending: false })
    .order("finished_at", { ascending: true })
    .limit(CHART_SIZE);

  if (error) throw error;

  const rows = (data || []).map((row, i) => ({ rank: i + 1, name: row.name, score: row.score, me: row.id === playId }));

  let me = null;
  if (playId) {
    const { data: play, error: playError } = await supabase
      .from("parva26_plays")
      .select("id, day, name, score, finished")
      .eq("id", playId)
      .maybeSingle();

    if (playError) throw playError;

    if (play && play.day === day && play.finished) {
      const { count, error: countError } = await supabase
        .from("parva26_plays")
        .select("id", { count: "exact", head: true })
        .eq("day", day)
        .eq("finished", true)
        .not("name", "is", null)
        .gt("score", play.score);

      if (countError) throw countError;

      me = { rank: (count || 0) + 1, name: play.name, score: play.score };
    }
  }

  return { rows, me };
};

// For tests
export const resetFilmCache = () => {
  pool = null;
  poolAt = 0;
};
