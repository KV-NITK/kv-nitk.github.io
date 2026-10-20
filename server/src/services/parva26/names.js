// The name a player writes on the duty chart. Anyone can write one, so it is
// checked here: letters in any script, digits, spaces and . ' - only, at most
// 20 characters, and nothing on the blocked list.

const MAX_LENGTH = 20;
const ALLOWED = /^[\p{L}\p{M}\p{N} .'‌‍-]+$/u;

// Whole words, lowercase. TODO(content): the club to add the Kannada and
// Kanglish words to keep off the chart.
const BLOCKED = new Set([
  "fuck", "fucker", "fucking", "shit", "bitch", "bastard", "asshole", "dick",
  "cunt", "slut", "whore", "nigger", "nigga", "porn", "sex", "rape",
  "madarchod", "bhenchod", "behenchod", "chutiya", "chutia", "gandu", "randi",
  "bosadi", "bolimaga", "sule", "suley",
]);

export class NameError extends Error {}

// Returns the cleaned name, or throws NameError with a message for the player.
export const cleanName = (value) => {
  const name = String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

  if (!name) throw new NameError("Write a name for the chart.");
  if ([...name].length > MAX_LENGTH) throw new NameError(`A name can be at most ${MAX_LENGTH} letters.`);
  if (!ALLOWED.test(name)) throw new NameError("Use letters, numbers and spaces only.");

  const words = name.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u);
  const joined = words.join("");
  if (words.some((w) => BLOCKED.has(w)) || BLOCKED.has(joined)) {
    throw new NameError("Please choose another name.");
  }

  return name;
};
