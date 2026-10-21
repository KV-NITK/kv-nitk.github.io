import fs from "node:fs";
import { twemojiCode } from "../src/services/parva26/films.js";

// Downloads the Twemoji images the "Which film?" list uses and the page
// doesn't have yet, into src/components/Parva26/assets/emoji. Run it after
// adding films:
//   npm run parva26:emoji

const TWEMOJI = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg";
const FILE = new URL("../content/parva26-films.json", import.meta.url);
const EMOJI_DIR = new URL("../../src/components/Parva26/assets/emoji/", import.meta.url);

async function fetchEmoji() {
  const films = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const have = new Set(fs.readdirSync(EMOJI_DIR));
  const wanted = new Map();
  for (const film of films) for (const emoji of film.emojis || []) wanted.set(`${twemojiCode(emoji)}.svg`, emoji);

  const missing = [...wanted].filter(([file]) => !have.has(file));
  let failed = 0;

  for (const [file, emoji] of missing) {
    const response = await fetch(`${TWEMOJI}/${file}`);
    const svg = response.ok ? await response.text() : "";
    if (!svg.trimStart().startsWith("<svg")) {
      console.error(`No Twemoji image for ${emoji} (${file}); pick another emoji.`);
      failed++;
      continue;
    }
    fs.writeFileSync(new URL(file, EMOJI_DIR), svg);
    console.log(`Added ${file} (${emoji})`);
  }

  console.log(missing.length ? `${missing.length - failed} of ${missing.length} added.` : "Every emoji already has its image.");
  if (failed) process.exit(1);
}

fetchEmoji().catch((err) => {
  console.error(err);
  process.exit(1);
});
