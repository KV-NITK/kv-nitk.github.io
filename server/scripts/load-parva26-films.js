import "dotenv/config";
import fs from "node:fs";
import { checkFilms, toPuzzleRows } from "../src/services/parva26/films.js";

// Puts the "Which film?" list (content/parva26-films.json) into
// parva26_puzzles, after checking it; any problem stops it. Films no longer
// in the file are made inactive, not deleted, so a game already dealt one
// can still finish.
//   npm run parva26:films -- --check    only check (no database needed)
//   npm run parva26:films               check and load

const FILE = new URL("../content/parva26-films.json", import.meta.url);
const EMOJI_DIR = new URL("../../src/components/Parva26/assets/emoji/", import.meta.url);

async function loadFilms() {
  const films = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const problems = checkFilms(films, { emojiDir: EMOJI_DIR });

  if (problems.length) {
    console.error(`content/parva26-films.json has ${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }

  const rows = toPuzzleRows(films);
  console.log(`${rows.length} films checked.`);
  if (process.argv.includes("--check")) return;

  const { supabase } = await import("../src/config/supabase.js");

  const { error } = await supabase.from("parva26_puzzles").upsert(rows, { onConflict: "id" });
  if (error) throw error;

  const { data: stored, error: readError } = await supabase.from("parva26_puzzles").select("id").eq("active", true);
  if (readError) throw readError;

  const ids = new Set(rows.map((r) => r.id));
  const retired = (stored || []).map((r) => r.id).filter((id) => !ids.has(id));
  if (retired.length) {
    const { error: retireError } = await supabase.from("parva26_puzzles").update({ active: false }).in("id", retired);
    if (retireError) throw retireError;
  }

  console.log(`Loaded ${rows.length} films${retired.length ? `; retired ${retired.join(", ")}` : ""}. New games pick them up within a minute.`);
}

loadFilms().catch((err) => {
  console.error(err);
  process.exit(1);
});
