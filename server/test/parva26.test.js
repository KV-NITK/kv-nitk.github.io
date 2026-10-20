import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createFakeDb } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const puzzle = (id, sort, answerEn, answerKn, extra = {}) => ({
  id,
  sort,
  emoji: ["1f327", "1f430", "1f494"],
  alt: `clue for ${id}`,
  answer_kn: answerKn,
  answer_en: answerEn,
  accept: [],
  year: 2000 + sort,
  active: true,
  ...extra,
});

const PUZZLES = [
  puzzle("mungaru-male", 1, "Mungaru Male", "ಮುಂಗಾರು ಮಳೆ", { accept: ["mungarumale"] }),
  puzzle("kantara", 2, "Kantara", "ಕಾಂತಾರ"),
  puzzle("lucia", 3, "Lucia", "ಲೂಸಿಯಾ"),
  puzzle("kgf", 4, "K.G.F", "ಕೆ.ಜಿ.ಎಫ್"),
  puzzle("rangitaranga", 5, "RangiTaranga", "ರಂಗಿತರಂಗ"),
  puzzle("retired", 6, "Retired Film", "ನಿವೃತ್ತ", { active: false }),
];

const db = createFakeDb({
  parva26_counters: [{ id: "hoomale", value: 100 }],
  parva26_puzzles: PUZZLES,
});

db.registerRpc("parva26_add_flowers", ({ amount }, tables) => {
  const row = tables.parva26_counters.find((r) => r.id === "hoomale");
  row.value += amount;
  return { data: row.value, error: null };
});

mockSupabase(db.client);

const { default: router } = await importSrc("routes/parva26.routes.js");
const { flushFlowers, resetFlowers } = await importSrc("services/parva26/flowers.service.js");
const { scoreFor, dayNumber } = await importSrc("services/parva26/film.service.js");
const { cleanName, NameError } = await importSrc("services/parva26/names.js");
const { isRight, firstLetters } = await importSrc("services/parva26/answers.js");

describe("parva26 games", () => {
  let server;
  let base;

  before(async () => {
    const app = express();
    app.set("trust proxy", true); // so a test can be a different visitor
    app.use(express.json());
    app.use("/api/parva26", router);
    await new Promise((resolve) => {
      server = app.listen(0, resolve);
    });
    base = `http://127.0.0.1:${server.address().port}/api/parva26`;
  });

  after(() => server.close());

  const call = async (method, path, body, from = "9.9.9.9") => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { "Content-Type": "application/json", "X-Forwarded-For": from },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  describe("flowers", () => {
    beforeEach(() => {
      resetFlowers();
      db.rows("parva26_counters")[0].value = 100;
    });

    it("reads the shared count", async () => {
      const { status, body } = await call("GET", "/flowers");
      assert.equal(status, 200);
      assert.equal(body.total, 100);
    });

    it("counts a batch at once and saves it on the next flush", async () => {
      const { body } = await call("POST", "/flowers", { count: 12, client: "visitor-aaaa" });
      assert.equal(body.accepted, 12);
      assert.equal(body.total, 112);
      assert.equal(db.rows("parva26_counters")[0].value, 100);

      await flushFlowers();
      assert.equal(db.rows("parva26_counters")[0].value, 112);
      assert.equal((await call("GET", "/flowers")).body.total, 112);
    });

    it("keeps one visitor to 150 flowers a minute", async () => {
      let accepted = 0;
      for (let i = 0; i < 4; i++) {
        accepted += (await call("POST", "/flowers", { count: 50, client: "visitor-bbbb" }, "8.8.8.8")).body.accepted;
      }
      assert.equal(accepted, 150);
      // Someone else on the same address still counts
      assert.equal((await call("POST", "/flowers", { count: 5, client: "visitor-cccc" }, "8.8.8.8")).body.accepted, 5);
    });

    it("refuses a bad batch", async () => {
      assert.equal((await call("POST", "/flowers", { count: 500, client: "visitor-dddd" })).status, 400);
      assert.equal((await call("POST", "/flowers", { count: 0, client: "visitor-dddd" })).status, 400);
      assert.equal((await call("POST", "/flowers", { count: 3, client: "x" })).status, 400);
    });

    it("keeps the taps when the database is down, and saves them later", async () => {
      await call("POST", "/flowers", { count: 7, client: "visitor-eeee" });
      db.registerRpc("parva26_add_flowers", () => ({ data: null, error: { message: "down" } }));
      await flushFlowers();
      assert.equal(db.rows("parva26_counters")[0].value, 100);

      db.registerRpc("parva26_add_flowers", ({ amount }, tables) => {
        const row = tables.parva26_counters.find((r) => r.id === "hoomale");
        row.value += amount;
        return { data: row.value, error: null };
      });
      await flushFlowers();
      assert.equal(db.rows("parva26_counters")[0].value, 107);
    });
  });

  describe("which film", () => {
    const start = async () => (await call("POST", "/film/plays")).body.play;
    // The page never learns which puzzle a reel is; the test reads it from the database
    const puzzleAt = (play, i) => PUZZLES.find((p) => p.id === dbPlay(play.id).reel_ids[i]);
    const answerFor = (play, i) => puzzleAt(play, i).answer_en;
    const guess = (play, text) => call("POST", `/film/plays/${play.id}/guess`, { guess: text });
    const dbPlay = (id) => db.rows("parva26_plays").find((p) => p.id === id);

    it("starts a game of five active reels, without the answers", async () => {
      const play = await start();
      assert.equal(play.reels.length, 5);
      assert.equal(play.reel, 0);
      assert.ok(!dbPlay(play.id).reel_ids.includes("retired"));
      assert.deepEqual(play.reels.map((r) => r.id), ["r1", "r2", "r3", "r4", "r5"]);

      const json = JSON.stringify(play);
      for (const p of PUZZLES) {
        assert.ok(!json.includes(p.answer_en), `answer ${p.answer_en} leaked`);
        assert.ok(!json.includes(p.answer_kn), `answer ${p.answer_kn} leaked`);
        assert.ok(!json.includes(`"${p.id}"`), `puzzle id ${p.id} leaked`);
      }
    });

    it("forgives a small typo and scores the reel by the server's clock", async () => {
      const play = await start();
      // 30 seconds on the first reel
      dbPlay(play.id).reel_started_at = new Date(Date.now() - 30_000).toISOString();

      const typo = answerFor(play, 0).toLowerCase().replace(/a/, "e");
      const { body } = await guess(play, typo);
      assert.equal(body.outcome, "right");
      assert.equal(body.answer.en, answerFor(play, 0));
      assert.equal(body.play.reel, 1);
      assert.equal(body.play.results[0].score, scoreFor({ solved: true, wrong: 0, hints: 0, seconds: 30 }));
      assert.equal(body.play.total, body.play.results[0].score);
    });

    it("gives three tries, then shows the answer and moves on", async () => {
      const play = await start();

      let r = await guess(play, "not a film at all");
      assert.equal(r.body.outcome, "wrong");
      assert.equal(r.body.answer, undefined);
      assert.equal(r.body.play.wrong, 1);

      await guess(play, "still wrong");
      r = await guess(play, "wrong again");
      assert.equal(r.body.outcome, "out");
      assert.equal(r.body.answer.en, answerFor(play, 0));
      assert.equal(r.body.play.reel, 1);
      assert.equal(r.body.play.wrong, 0);
      assert.deepEqual(
        { solved: r.body.play.results[0].solved, score: r.body.play.results[0].score },
        { solved: false, score: 0 }
      );
    });

    it("gives the year, then the first letter, then no more hints", async () => {
      const play = await start();

      let r = await call("POST", `/film/plays/${play.id}/hint`);
      assert.equal(r.body.play.hints, 1);
      assert.equal(r.body.play.letter, null);

      r = await call("POST", `/film/plays/${play.id}/hint`);
      const answer = puzzleAt(play, 0);
      assert.deepEqual(r.body.play.letter, firstLetters(answer));

      r = await call("POST", `/film/plays/${play.id}/hint`);
      assert.equal(r.status, 400);
      assert.equal(r.body.code, "NO_MORE_HINTS");
    });

    it("finishes after five reels, takes a name, and puts it on today's chart", async () => {
      const play = await start();
      assert.equal((await call("PUT", `/film/plays/${play.id}/name`, { name: "Too soon" })).status, 409);

      let last;
      for (let i = 0; i < play.reels.length; i++) last = (await guess(play, answerFor(play, i))).body;
      assert.equal(last.play.finished, true);
      assert.equal(last.play.reel, 5);
      assert.equal((await guess(play, "anything")).status, 409);

      // Before naming: not on the chart, but told where they'd stand
      let chart = (await call("GET", `/film/chart?play=${play.id}`)).body.chart;
      assert.ok(!chart.rows.some((r) => r.me));
      assert.equal(chart.me.score, last.play.total);

      const named = await call("PUT", `/film/plays/${play.id}/name`, { name: "  ರಾಜು   K " });
      assert.equal(named.status, 200);
      assert.equal(named.body.name, "ರಾಜು K");

      chart = (await call("GET", `/film/chart?play=${play.id}`)).body.chart;
      const me = chart.rows.find((r) => r.me);
      assert.equal(me.name, "ರಾಜು K");
      assert.equal(me.rank, chart.me.rank);
      // Other players' game ids never reach the page
      assert.ok(!JSON.stringify(chart).includes(play.id));
    });

    it("ranks the chart by score, then by who finished first", async () => {
      const today = dayNumber();
      const row = (id, name, score, at) => ({ id, day: today, finished: true, name, score, finished_at: at, reel_ids: [], results: [] });
      db.rows("parva26_plays").push(
        row("00000000-0000-4000-8000-000000000001", "Late", 400, "2026-10-19T10:00:00Z"),
        row("00000000-0000-4000-8000-000000000002", "Early", 400, "2026-10-19T09:00:00Z"),
        row("00000000-0000-4000-8000-000000000003", null, 999, "2026-10-19T09:00:00Z"),
        { ...row("00000000-0000-4000-8000-000000000004", "Yesterday", 999, "2026-10-18T09:00:00Z"), day: today - 1 }
      );

      const { rows } = (await call("GET", "/film/chart")).body.chart;
      const names = rows.map((r) => r.name);
      assert.ok(names.indexOf("Early") < names.indexOf("Late"));
      assert.ok(!names.includes("Yesterday"));
      assert.ok(!names.includes(null));
    });

    it("refuses a bad name", async () => {
      const play = await start();
      for (let i = 0; i < play.reels.length; i++) await guess(play, answerFor(play, i));

      for (const name of ["", "   ", "<script>", "a".repeat(21), "Fuck you"]) {
        const r = await call("PUT", `/film/plays/${play.id}/name`, { name });
        assert.equal(r.status, 400, `accepted ${JSON.stringify(name)}`);
        assert.equal(r.body.code, "BAD_NAME");
      }
    });

    it("ends yesterday's game, and treats an unknown id the same way", async () => {
      const play = await start();
      dbPlay(play.id).day -= 1;
      assert.equal((await call("GET", `/film/plays/${play.id}`)).status, 404);
      assert.equal((await call("GET", "/film/plays/not-a-uuid")).status, 404);
      assert.equal((await call("GET", "/film/plays/00000000-0000-4000-8000-00000000abcd")).status, 404);
    });

    it("refuses a second answer to a reel that has already moved on", async () => {
      const play = await start();
      const stored = dbPlay(play.id);
      const original = db.client.from;
      let first = true;
      // A parallel guess lands just after this request has read the game
      db.client.from = (table) => {
        const q = original(table);
        if (table === "parva26_plays" && first) {
          first = false;
          const then = q.then;
          q.then = (resolve, reject) =>
            then((result) => {
              stored.wrong += 1;
              return resolve(result);
            }, reject);
        }
        return q;
      };
      try {
        const r = await guess(play, "wrong");
        assert.equal(r.status, 409);
        assert.equal(r.body.code, "PLAY_CHANGED");
      } finally {
        db.client.from = original;
      }
    });
  });
});

describe("parva26 answers and names", () => {
  const kantara = PUZZLES[1];

  it("accepts Kannada, English, other spellings and small typos", () => {
    assert.ok(isRight("ಕಾಂತಾರ", kantara));
    assert.ok(isRight("KANTARA!", kantara));
    assert.ok(isRight("kantra", kantara));
    assert.ok(isRight("mungarumale", PUZZLES[0]));
    assert.ok(!isRight("kgf", kantara));
    assert.ok(!isRight("", kantara));
  });

  it("gives the first Kannada letter as a whole syllable", () => {
    assert.deepEqual(firstLetters(PUZZLES[0]), { kn: "ಮುಂ", en: "M" });
  });

  it("cleans names and refuses blocked words", () => {
    assert.equal(cleanName(" Ananya   S. "), "Ananya S.");
    assert.equal(cleanName("ಶ್ವೇತಾ"), "ಶ್ವೇತಾ");
    assert.throws(() => cleanName("shit"), NameError);
    assert.throws(() => cleanName("a@b.com"), NameError);
  });
});
