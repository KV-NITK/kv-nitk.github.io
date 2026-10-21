// Checking a typed film name against the answer ("Which film?", Parva 2026
// Scene 11). Names are compared by how they sound, not how they're spelled,
// so the usual ways of writing a Kannada title in English meet: th/t, dh/d,
// sh/s, aa/a, ee/i, oo/u and doubled letters (Saptha, Sapta; Saagara,
// Sagara; Yello, Ello). In Kannada script, long and short vowels, aspirated
// and plain letters, ಳ/ಲ, ಣ/ನ and ಶ/ಷ/ಸ meet the same way. Case, spaces and
// punctuation don't count, and a small typo is forgiven on top: one letter
// in a short name, two in a long one. Numbers must match exactly, so a
// sequel is never taken for the first film. What no rule covers (KGF for
// K.G.F: Chapter 1) goes in the film's `accept` list.

// Kannada letters people write for one another, to one of them
const KANNADA = {
  "ಾ": "", "ೀ": "ಿ", "ೂ": "ು", "ೇ": "ೆ", "ೋ": "ೊ",
  "ಆ": "ಅ", "ಈ": "ಇ", "ಊ": "ಉ", "ಏ": "ಎ", "ಓ": "ಒ",
  "ಖ": "ಕ", "ಘ": "ಗ", "ಛ": "ಚ", "ಝ": "ಜ", "ಠ": "ಟ", "ಢ": "ಡ", "ಥ": "ತ", "ಧ": "ದ", "ಫ": "ಪ", "ಭ": "ಬ",
  "ಶ": "ಸ", "ಷ": "ಸ", "ಣ": "ನ", "ಳ": "ಲ",
};

// The same for Kannada written in English letters, in this order
const LATIN = [
  [/([kgcjtdpb])h/g, "$1"],
  [/sh/g, "s"],
  [/w/g, "v"],
  [/aa/g, "a"],
  [/ee|ii/g, "i"],
  [/oo|uu/g, "u"],
  [/^ye/, "e"],
  [/(.)\1+/g, "$1"],
];

// Lowercase, without zero-width joiners, and Kannada digits as 0-9
const clean = (text) =>
  String(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‌‍]/g, "")
    .replace(/[೦-೯]/g, (d) => String(d.codePointAt(0) - 0x0ce6));

// How a name sounds: each word reduced by the rules above, then joined
export const soundKey = (text) =>
  clean(text)
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => LATIN.reduce((w, [from, to]) => w.replace(from, to), [...word].map((c) => KANNADA[c] ?? c).join("")))
    .join("");

const numbers = (text) => (clean(text).match(/\p{Nd}/gu) || []).join("");

// Edit distance between two strings, by code point.
const distance = (a, b) => {
  const x = [...a];
  const y = [...b];
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);

  for (let i = 1; i <= x.length; i++) {
    const row = [i];
    for (let j = 1; j <= y.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = row;
  }

  return prev[y.length];
};

// Every way a film's name is taken: English, Kannada and the other spellings
export const namesOf = (puzzle) => [puzzle.answer_en, puzzle.answer_kn, ...(puzzle.accept || [])];

// puzzle: a parva26_puzzles row
export const isRight = (guess, puzzle) => {
  const g = soundKey(guess);
  if (!g) return false;
  const n = numbers(guess);

  return namesOf(puzzle).some((option) => {
    if (numbers(option) !== n) return false;
    const t = soundKey(option);
    const length = [...t].length;
    const allowed = length > 9 ? 2 : length > 4 ? 1 : 0;
    return t === g || distance(g, t) <= allowed;
  });
};
