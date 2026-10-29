import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { staffActivityController, revertClaimController, addNoteController } = await importSrc("controllers/staffActivity.controller.js");

const PASS = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

const call = async (controller, { params = {}, query = {}, body } = {}) => {
  const res = fakeRes();
  await controller({ params, query, body }, res);
  return res;
};

const row = (extra = {}) => ({
  event_id: 7,
  event_action: "CLAIM",
  event_category: "MERCH",
  event_at: "2026-10-31T07:00:00Z",
  pass_id: PASS,
  item_name: "Parva T-shirt",
  variant: "M",
  fit: "Oversized",
  holder_name: "Asha",
  holder_iris_id: "2312345",
  pass_status: "CLAIMED",
  reverted_at: null,
  is_latest: true,
  notes: [],
  total: 41,
  ...extra,
});

describe("staff activity", () => {
  let lastArgs;

  beforeEach(() => {
    lastArgs = null;
    db.registerRpc("staff_activity", (args) => {
      lastArgs = args;
      return { data: [row()], error: null };
    });
  });

  it("returns the item details, the total, and asks the database for the right page", async () => {
    const res = await call(staffActivityController, { params: { irisId: "1111111" }, query: { category: "MERCH", page: "2" } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(lastArgs, { p_staff: "1111111", p_category: "MERCH", p_action: null, p_limit: 30, p_offset: 30, p_query: null });
    assert.equal(res.body.total, 41);
    const a = res.body.activity[0];
    assert.deepEqual([a.itemName, a.size, a.fit, a.holderName, a.holderIrisId, a.category, a.action], ["Parva T-shirt", "M", "Oversized", "Asha", "2312345", "MERCH", "CLAIM"]);
    assert.equal(a.canRevert, true);
  });

  it("only offers revert on the newest event of a pass that is still claimed", async () => {
    const cases = [
      [{ pass_status: "ISSUED", reverted_at: "2026-10-31T08:00:00Z" }, false],
      [{ is_latest: false }, false],
      [{ event_action: "REVERT" }, false],
      [{}, true],
    ];
    for (const [extra, expected] of cases) {
      db.registerRpc("staff_activity", () => ({ data: [row(extra)], error: null }));
      const res = await call(staffActivityController, { params: { irisId: "1111111" } });
      assert.equal(res.body.activity[0].canRevert, expected, JSON.stringify(extra));
    }
  });

  it("passes a trimmed holder search along, and treats a blank one as no search", async () => {
    await call(staffActivityController, { params: { irisId: "1111111" }, query: { q: "  asha rao " } });
    assert.equal(lastArgs.p_query, "asha rao");
    await call(staffActivityController, { params: { irisId: "1111111" }, query: { q: "   " } });
    assert.equal(lastArgs.p_query, null);
    const res = await call(staffActivityController, { params: { irisId: "1111111" }, query: { q: "x".repeat(61) } });
    assert.equal(res.statusCode, 400);
  });

  it("an empty history is total 0, not an error", async () => {
    db.registerRpc("staff_activity", () => ({ data: [], error: null }));
    const res = await call(staffActivityController, { params: { irisId: "1111111" } });
    assert.deepEqual([res.statusCode, res.body.total, res.body.activity.length], [200, 0, 0]);
  });

  it("says to run the migration (503) when the function is missing", async () => {
    db.registerRpc("staff_activity", () => ({ data: null, error: { code: "PGRST202", message: "Could not find the function" } }));
    const res = await call(staffActivityController, { params: { irisId: "1111111" } });
    assert.equal(res.statusCode, 503);
    assert.match(res.body.message, /007_staff_activity/);
  });

  it("rejects a bad IRIS id, category, action or page with 400", async () => {
    const bad = [
      { params: { irisId: "12" } },
      { params: { irisId: "1111111" }, query: { category: "SHOES" } },
      { params: { irisId: "1111111" }, query: { action: "DELETE" } },
      { params: { irisId: "1111111" }, query: { page: "0" } },
      { params: { irisId: "1111111" }, query: { page: "abc" } },
    ];
    for (const input of bad) {
      assert.equal((await call(staffActivityController, input)).statusCode, 400, JSON.stringify(input));
    }
  });
});

describe("revert from the staff admin page", () => {
  let lastArgs;

  beforeEach(() => {
    lastArgs = null;
    db.registerRpc("admin_revert_event_pass", (args) => {
      lastArgs = args;
      return { data: { result: "REVERTED", item: { id: args.p_id, status: "ISSUED" } }, error: null };
    });
  });

  it("reverts without a reason (skipped, empty or blank)", async () => {
    for (const body of [undefined, {}, { reason: "" }, { reason: "   " }]) {
      const res = await call(revertClaimController, { params: { passId: PASS }, body });
      assert.equal(res.statusCode, 200, JSON.stringify(body));
      assert.deepEqual(lastArgs, { p_id: PASS, p_reason: null });
    }
  });

  it("passes a trimmed reason along", async () => {
    const res = await call(revertClaimController, { params: { passId: PASS }, body: { reason: "  gave L, wanted M  " } });
    assert.equal(res.statusCode, 200);
    assert.equal(lastArgs.p_reason, "gave L, wanted M");
  });

  it("409 when the pass is no longer claimed, 404 when it does not exist", async () => {
    db.registerRpc("admin_revert_event_pass", () => ({ data: { result: "NOT_CLAIMED" }, error: null }));
    assert.equal((await call(revertClaimController, { params: { passId: PASS } })).statusCode, 409);
    db.registerRpc("admin_revert_event_pass", () => ({ data: { result: "INVALID", message: "Pass not found" }, error: null }));
    assert.equal((await call(revertClaimController, { params: { passId: PASS } })).statusCode, 404);
  });

  it("rejects a bad pass id or a reason over 500 characters", async () => {
    assert.equal((await call(revertClaimController, { params: { passId: "nope" } })).statusCode, 400);
    assert.equal((await call(revertClaimController, { params: { passId: PASS }, body: { reason: "x".repeat(501) } })).statusCode, 400);
    assert.equal(lastArgs, null);
  });
});

describe("notes on a pass", () => {
  beforeEach(() => {
    db.rows("claimable_items").splice(0, Infinity, { id: PASS, status: "CLAIMED" });
    db.rows("pass_notes").splice(0, Infinity);
  });

  it("saves a note, as NOTE by default", async () => {
    const res = await call(addNoteController, { params: { passId: PASS }, body: { note: "  wrong size given  " } });
    assert.equal(res.statusCode, 201);
    assert.deepEqual([res.body.note.kind, res.body.note.note], ["NOTE", "wrong size given"]);
    assert.deepEqual(db.rows("pass_notes").map((n) => [n.pass_id, n.kind, n.note]), [[PASS, "NOTE", "wrong size given"]]);
  });

  it("can mark it as mishandled", async () => {
    const res = await call(addNoteController, { params: { passId: PASS }, body: { note: "gave L, student kept it", kind: "MISHANDLED" } });
    assert.equal(res.body.note.kind, "MISHANDLED");
  });

  it("404 for an unknown pass, and nothing is saved", async () => {
    const res = await call(addNoteController, { params: { passId: OTHER }, body: { note: "x" } });
    assert.equal(res.statusCode, 404);
    assert.equal(db.rows("pass_notes").length, 0);
  });

  it("rejects an empty or too long note, and the REVERT_REASON kind (only revert writes that)", async () => {
    for (const body of [{}, { note: "   " }, { note: "x".repeat(501) }, { note: "ok", kind: "REVERT_REASON" }]) {
      assert.equal((await call(addNoteController, { params: { passId: PASS }, body })).statusCode, 400, JSON.stringify(body));
    }
    assert.equal(db.rows("pass_notes").length, 0);
  });
});
