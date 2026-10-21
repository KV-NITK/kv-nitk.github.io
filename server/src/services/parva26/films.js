import fs from "node:fs";
import { isRight, namesOf, soundKey } from "./answers.js";

// The "Which film?" list (server/content/parva26-films.json) and the checks it
// must pass before scripts/load-parva26-films.js puts it in the database.
// Each film:
//   movie     the English title, shown when the reel ends
//   kannada   the Kannada title
//   emojis    three emoji, pasted as they are
//   alt       what the three pictures show, for screen readers (not the answer)
//   clue1     the first hint
//   clue2     the second hint
//   year      the year it came out
//   level     easy, medium or hard; each game deals two easy, two medium, one hard
//   accept    other ways people write it that the matcher doesn't already forgive
//   active    false keeps it out of new games (optional)

export const LEVELS = ["easy", "medium", "hard"];
export const MIN_FILMS = 50;

// Clue words that are also in some titles, so a clue may use them
const EVERYDAY = new Set(["love", "story", "party", "simple", "straight", "forward", "bottom", "chapter", "humble", "politician", "french"].map(soundKey));

// The Twemoji file name for one emoji: its code points in hex, without the
// FE0F variation selector unless it's a joined (ZWJ) sequence.
export const twemojiCode = (emoji) => {
  const points = [...emoji].map((c) => c.codePointAt(0));
  const kept = points.includes(0x200d) ? points : points.filter((p) => p !== 0xfe0f);
  return kept.map((p) => p.toString(16)).join("-");
};

// A film's id: its English title in lowercase, with dashes
export const filmId = (movie) =>
  movie
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const toPuzzleRows = (films) =>
  films.map((film, i) => ({
    id: filmId(film.movie),
    sort: i + 1,
    emoji: film.emojis.map(twemojiCode),
    alt: film.alt,
    answer_en: film.movie,
    answer_kn: film.kannada,
    accept: film.accept || [],
    year: film.year,
    level: film.level,
    clue1: film.clue1,
    clue2: film.clue2,
    active: film.active !== false,
  }));

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
const isOneEmoji = (text) => typeof text === "string" && [...segmenter.segment(text)].length === 1 && /\p{Extended_Pictographic}|⃣/u.test(text);

const wordsOf = (text) => String(text).split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean).map(soundKey);

// A clue that has the title in it, or one of its longer words, gives the
// answer away.
const namesTheFilm = (clue, movie) => {
  const title = soundKey(movie);
  if (title.length >= 4 && soundKey(clue).includes(title)) return true;
  const clueWords = new Set(wordsOf(clue));
  return movie
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((w) => w.length >= 5 && !EVERYDAY.has(soundKey(w)))
    .some((w) => clueWords.has(soundKey(w)));
};

// Everything wrong with the list, as sentences for whoever edits it; empty
// when it's ready. emojiDir: where the page's Twemoji images are.
export const checkFilms = (films, { emojiDir } = {}) => {
  if (!Array.isArray(films)) return ["The file must be a list of films."];

  const problems = [];
  const images = emojiDir ? new Set(fs.readdirSync(emojiDir).map((f) => f.replace(/\.svg$/, ""))) : null;
  const ids = new Map();
  const thisYear = new Date().getFullYear();

  films.forEach((film, i) => {
    const name = `#${i + 1} ${film?.movie || "(no title)"}`;
    const text = (field) => typeof film?.[field] === "string" && film[field].trim();

    for (const field of ["movie", "kannada", "alt", "clue1", "clue2"]) {
      if (!text(field)) problems.push(`${name}: "${field}" is missing.`);
    }
    if (!Array.isArray(film?.emojis) || film.emojis.length !== 3 || !film.emojis.every(isOneEmoji)) {
      problems.push(`${name}: "emojis" must be three emoji.`);
    } else if (images) {
      for (const emoji of film.emojis) {
        if (!images.has(twemojiCode(emoji))) problems.push(`${name}: no image for ${emoji} (${twemojiCode(emoji)}.svg); run npm run parva26:emoji.`);
      }
    }
    if (!Number.isInteger(film?.year) || film.year < 1930 || film.year > thisYear) problems.push(`${name}: "year" must be the year it came out.`);
    if (!LEVELS.includes(film?.level)) problems.push(`${name}: "level" must be easy, medium or hard.`);
    if (film?.accept !== undefined && (!Array.isArray(film.accept) || !film.accept.every((a) => typeof a === "string" && soundKey(a)))) {
      problems.push(`${name}: "accept" must be a list of other spellings.`);
    }
    if (!text("movie")) return;

    const id = filmId(film.movie);
    if (ids.has(id)) problems.push(`${name}: the same film as ${ids.get(id)}.`);
    else ids.set(id, name);

    for (const field of ["clue1", "clue2"]) {
      if (text(field) && namesTheFilm(film[field], film.movie)) problems.push(`${name}: "${field}" gives the answer away.`);
    }
  });

  // Any name of one film must not count as another (a sequel, a near twin)
  const rows = toPuzzleRows(films.filter((f) => typeof f?.movie === "string" && f.movie.trim() && typeof f.kannada === "string"));
  for (const a of rows) {
    for (const b of rows) {
      if (a === b || a.id === b.id) continue;
      const clash = namesOf(b).find((n) => isRight(n, a));
      if (clash) problems.push(`"${clash}" (${b.answer_en}) would also count as ${a.answer_en}; make them differ.`);
    }
  }

  const active = rows.filter((r) => r.active).length;
  if (active < MIN_FILMS) problems.push(`Only ${active} films are active; at least ${MIN_FILMS} are needed.`);

  return problems;
};
