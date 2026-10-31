import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { requireBoothPasscode } = await importSrc("middleware/adminAuth.middleware.js");
const { boothMeController, boothScanController, boothSearchController, BOOTH_STAFF_ID } = await importSrc(
  "controllers/booth.controller.js"
);

const guard = (passcode, ip = "1.1.1.1") => {
  const res = fakeRes();
  let passed = false;
  requireBoothPasscode({ ip, headers: passcode === undefined ? {} : { "x-booth-passcode": passcode } }, res, () => {
    passed = true;
  });
  return { res, passed };
};

describe("photo booth password", () => {
  beforeEach(() => {
    process.env.PHOTO_BOOTH_PASSCODE = "click71";
  });

  it("lets the right password through and refuses a wrong or missing one", () => {
    assert.equal(guard("click71").passed, true);
    assert.equal(guard("nope", "2.2.2.2").res.statusCode, 401);
    assert.equal(guard(undefined, "2.2.2.3").res.statusCode, 401);
  });

  it("is off when PHOTO_BOOTH_PASSCODE is not set", () => {
    delete process.env.PHOTO_BOOTH_PASSCODE;
    const { res, passed } = guard("click71", "3.3.3.3");
    assert.equal(passed, false);
    assert.equal(res.statusCode, 500);
  });

  it("does not open with the staff admin password", () => {
    process.env.STAFF_ADMIN_PASSCODE = "staff-secret";
    assert.equal(guard("staff-secret", "4.4.4.4").res.statusCode, 401);
  });
});

describe("photo booth scanner", () => {
  let calls;

  beforeEach(() => {
    calls = [];
    db.rows("event_staff").splice(0, Infinity, { iris_id: BOOTH_STAFF_ID, name: "Photo booth", role: "VOLUNTEER", active: true });
    db.registerRpc("claim_event_pass", (args) => {
      calls.push(["claim", args]);
      return { data: { result: "OK", item: { id: "p1", category: "PHOTO", variant: "3 prints" } }, error: null };
    });
    db.registerRpc("search_event_passes", (args) => {
      calls.push(["search", args]);
      return { data: [], error: null };
    });
  });

  it("claims as the booth's staff row, always in PHOTO mode, whatever the request says", async () => {
    const res = fakeRes();
    await boothScanController({ body: { token: crypto.randomUUID(), category: "FOOD" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.result, "OK");
    assert.equal(calls[0][1].p_staff_iris_id, BOOTH_STAFF_ID);
    assert.equal(calls[0][1].p_category, "PHOTO");
  });

  it("rejects a token that is not a pass token, without claiming", async () => {
    const res = fakeRes();
    await boothScanController({ body: { token: "not-a-token" } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 0);
  });

  it("searches photo passes only", async () => {
    const res = fakeRes();
    await boothSearchController({ query: { q: "2310103", category: "MERCH" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(calls[0][1].p_category, "PHOTO");
  });

  it("says who the claims are made as, and whether that row is switched on", async () => {
    const res = fakeRes();
    await boothMeController({}, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.staff, { irisId: BOOTH_STAFF_ID, name: "Photo booth", role: "VOLUNTEER", active: true });
  });

  it("reports a missing staff row (the migration has not run) instead of scanning", async () => {
    db.rows("event_staff").splice(0, Infinity);
    const res = fakeRes();
    await boothMeController({}, res);
    assert.equal(res.statusCode, 500);
  });
});
