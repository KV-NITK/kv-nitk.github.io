import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { listPassesController } = await importSrc("controllers/passList.controller.js");

const call = async (query) => {
  const res = fakeRes();
  await listPassesController({ query }, res);
  return res;
};

const ROW = {
  id: "11111111-1111-4111-8111-111111111111",
  token: "22222222-2222-4222-8222-222222222222",
  user_iris_id: "2312345",
  user_name: "Asha Rao",
  category: "MERCH",
  item_name: "Parva Tee",
  variant: "M",
  fit: "Oversized",
  item_index: 1,
  status: "ISSUED",
  claimed_at: null,
  claimed_by: null,
  claimed_by_name: null,
  phone: "9876543210",
  rn: 1,
};

let lastArgs;
const answer = (result) =>
  db.registerRpc("list_event_passes", (args) => {
    lastArgs = args;
    return result;
  });

beforeEach(() => {
  lastArgs = null;
  answer({ data: { passes: [ROW], total: 41, facets: [{ fit: "Oversized", size: "M", count: 12 }] }, error: null });
});

describe("pass list for the scanner", () => {
  it("asks for 25 at a time, and the right page", async () => {
    const res = await call({ category: "MERCH", status: "ISSUED", page: "3" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(lastArgs, {
      p_category: "MERCH", p_status: "ISSUED", p_fit: null, p_size: null, p_query: null, p_limit: 25, p_offset: 50,
    });
    assert.deepEqual([res.body.total, res.body.page, res.body.pageSize], [41, 3, 25]);
  });

  it("passes fit, size and a trimmed search along; a blank search or filter means none", async () => {
    await call({ category: "MERCH", status: "CLAIMED", fit: "Oversized", size: "M", q: "  asha " });
    assert.deepEqual([lastArgs.p_fit, lastArgs.p_size, lastArgs.p_query, lastArgs.p_status], ["Oversized", "M", "asha", "CLAIMED"]);
    await call({ category: "MERCH", status: "ISSUED", fit: "", size: " ", q: "   " });
    assert.deepEqual([lastArgs.p_fit, lastArgs.p_size, lastArgs.p_query], [null, null, null]);
  });

  it("a one character search is allowed", async () => {
    const res = await call({ category: "FOOD", status: "ISSUED", q: "a" });
    assert.equal(res.statusCode, 200);
    assert.equal(lastArgs.p_query, "a");
  });

  it("returns the passes with the phone number and the counts for the chips, without the row number", async () => {
    const res = await call({ category: "MERCH", status: "ISSUED" });
    const p = res.body.passes[0];
    assert.deepEqual([p.user_name, p.user_iris_id, p.fit, p.variant, p.phone, p.status], ["Asha Rao", "2312345", "Oversized", "M", "9876543210", "ISSUED"]);
    assert.equal("rn" in p, false);
    assert.deepEqual(res.body.facets, [{ fit: "Oversized", size: "M", count: 12 }]);
  });

  it("shows only the 10 digits of a phone number, and null when there is none", async () => {
    answer({
      data: { passes: [{ ...ROW, phone: "+91 98765-43210" }, { ...ROW, id: "x2", phone: null }, { ...ROW, id: "x3", phone: "" }], total: 3, facets: [] },
      error: null,
    });
    const res = await call({ category: "MERCH", status: "ISSUED" });
    assert.deepEqual(res.body.passes.map((p) => p.phone), ["9876543210", null, null]);
  });

  it("an empty list is total 0, not an error", async () => {
    answer({ data: { passes: [], total: 0, facets: [] }, error: null });
    const res = await call({ category: "MERCH", status: "CLAIMED" });
    assert.deepEqual([res.statusCode, res.body.total, res.body.passes.length], [200, 0, 0]);
  });

  it("says to run the migration (503) when the function is missing", async () => {
    answer({ data: null, error: { code: "PGRST202", message: "Could not find the function" } });
    const res = await call({ category: "MERCH", status: "ISSUED" });
    assert.equal(res.statusCode, 503);
    assert.match(res.body.message, /013_pass_lists/);
  });

  it("rejects an unknown category or status, a missing status, a long search and a bad page with 400", async () => {
    const bad = [
      { category: "SHOES", status: "ISSUED" },
      { category: "MERCH", status: "VOID" },
      { category: "MERCH" },
      { status: "ISSUED" },
      { category: "MERCH", status: "ISSUED", q: "x".repeat(41) },
      { category: "MERCH", status: "ISSUED", page: "0" },
      { category: "MERCH", status: "ISSUED", page: "abc" },
    ];
    for (const query of bad) {
      lastArgs = null;
      assert.equal((await call(query)).statusCode, 400, JSON.stringify(query));
      assert.equal(lastArgs, null);
    }
  });
});
