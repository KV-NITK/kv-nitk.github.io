import API_URL from "./api";

// The Parva 2026 landing page games: flowers for Samudrappa and "Which film?".
// No login. Throws Error(message) with the server's message, plus `status`
// and `code`, so the page can tell "game over" from "server down".
const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}/parva26${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    const error = new Error("Network error. Please check your connection.");
    error.status = 0;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.code = data.code || null;
    throw error;
  }

  return data;
};

const send = (method, path, body) =>
  request(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

export const getFlowers = async () => (await request("/flowers")).total;

// { accepted, total }
export const sendFlowers = (count, client) => send("POST", "/flowers", { count, client });

export const startFilmGame = async () => (await send("POST", "/film/plays")).play;

export const getFilmGame = async (playId) =>
  (await request(`/film/plays/${encodeURIComponent(playId)}`)).play;

// { outcome: "right" | "wrong" | "out", answer?, play }
export const guessFilm = (playId, guess) =>
  send("POST", `/film/plays/${encodeURIComponent(playId)}/guess`, { guess });

export const filmHint = async (playId) =>
  (await send("POST", `/film/plays/${encodeURIComponent(playId)}/hint`)).play;

// { name, chart }
export const saveFilmName = (playId, name) =>
  send("PUT", `/film/plays/${encodeURIComponent(playId)}/name`, { name });

// { rows: [{ rank, name, score, me }], me: { rank, name, score } | null }
export const getFilmChart = async (playId) =>
  (await request(`/film/chart${playId ? `?play=${encodeURIComponent(playId)}` : ""}`)).chart;
