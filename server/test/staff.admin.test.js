import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { requireStaffAdminPasscode } = await importSrc("middleware/staffAdminAuth.middleware.js");
const { requireStaff } = await importSrc("middleware/auth.middleware.js");
const { listStaffController, addStaffController, updateStaffController } = await importSrc("controllers/staff.controller.js");

const run = (r) => {
  const res = fakeRes();
  let passed = false;
  requireStaffAdminPasscode(r, res, () => { passed = true; });
  return { res, passed };
};

const header = (value, ip) => ({ ip, headers: value === undefined ? {} : { "x-staff-admin-passcode": value } });

describe("staff admin password", () => {
  let saved;
  let savedOrders;
  beforeEach(() => {
    saved = process.env.STAFF_ADMIN_PASSCODE;
    savedOrders = process.env.ADMIN_PASSCODE;
    process.env.STAFF_ADMIN_PASSCODE = "staff-key";
    process.env.ADMIN_PASSCODE = "orders-key";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.STAFF_ADMIN_PASSCODE; else process.env.STAFF_ADMIN_PASSCODE = saved;
    if (savedOrders === undefined) delete process.env.ADMIN_PASSCODE; else process.env.ADMIN_PASSCODE = savedOrders;
  });

  it("lets the right password through", () => {
    assert.equal(run(header("staff-key", "10.0.0.1")).passed, true);
  });

  it("does not accept the orders password", () => {
    const { res, passed } = run(header("orders-key", "10.0.0.2"));
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
  });

  it("refuses a wrong or missing password with 401", () => {
    for (const given of ["nope", "", undefined]) {
      const { res, passed } = run(header(given, "10.0.0.3"));
      assert.equal(passed, false);
      assert.equal(res.statusCode, 401);
    }
  });

  it("is off, with a 500, when STAFF_ADMIN_PASSCODE is not set (even if ADMIN_PASSCODE is)", () => {
    delete process.env.STAFF_ADMIN_PASSCODE;
    const { res, passed } = run(header("orders-key", "10.0.0.4"));
    assert.equal(passed, false);
    assert.equal(res.statusCode, 500);
  });

  it("locks an address out after 10 wrong tries and leaves others alone", () => {
    for (let i = 0; i < 10; i++) assert.equal(run(header("wrong", "10.0.0.5")).res.statusCode, 401);
    assert.equal(run(header("staff-key", "10.0.0.5")).res.statusCode, 429);
    assert.equal(run(header("staff-key", "10.0.0.6")).passed, true);
  });
});

describe("staff admin", () => {
  beforeEach(() => {
    db.rows("event_staff").splice(0, Infinity,
      { iris_id: "1111111", name: "Head", role: "ADMIN", active: true, created_at: "2026-10-01T00:00:00Z" },
      { iris_id: "2222222", name: "Vol", role: "VOLUNTEER", active: true, created_at: "2026-10-02T00:00:00Z" },
    );
    db.registerRpc("staff_claim_stats", () => ({
      data: [{ staff_iris_id: "2222222", food_claims: 5, merch_claims: 2, reverts: 1, last_action_at: "2026-10-31T08:00:00Z" }],
      error: null,
    }));
  });

  const call = async (controller, { body, params } = {}) => {
    const res = fakeRes();
    await controller({ body, params }, res);
    return res;
  };

  it("lists staff newest first with claim totals (zero when none)", async () => {
    const res = await call(listStaffController);
    assert.equal(res.body.success, true);
    assert.equal(res.body.statsAvailable, true);
    assert.deepEqual(res.body.staff.map((s) => s.irisId), ["2222222", "1111111"]);
    const vol = res.body.staff[0];
    assert.deepEqual([vol.foodClaims, vol.merchClaims, vol.reverts], [5, 2, 1]);
    assert.deepEqual([res.body.staff[1].foodClaims, res.body.staff[1].reverts], [0, 0]);
  });

  it("still lists staff when the stats function is missing", async () => {
    db.registerRpc("staff_claim_stats", () => ({ data: null, error: { message: "function does not exist" } }));
    const res = await call(listStaffController);
    assert.equal(res.body.success, true);
    assert.equal(res.body.statsAvailable, false);
    assert.equal(res.body.staff.length, 2);
  });

  it("adds a staff member, active by default, and the database sets created_at", async () => {
    const res = await call(addStaffController, { body: { irisId: " 3333333 ", name: "  Asha  ", role: "VOLUNTEER" } });
    assert.equal(res.statusCode, 201);
    assert.deepEqual([res.body.staff.irisId, res.body.staff.name, res.body.staff.active], ["3333333", "Asha", true]);
    const row = db.rows("event_staff").find((r) => r.iris_id === "3333333");
    assert.equal(row.role, "VOLUNTEER");
    assert.ok(row.created_at);
  });

  it("refuses a duplicate IRIS ID with 409 and changes nothing", async () => {
    const res = await call(addStaffController, { body: { irisId: "1111111", name: "Again", role: "VOLUNTEER" } });
    assert.equal(res.statusCode, 409);
    assert.equal(db.rows("event_staff").find((r) => r.iris_id === "1111111").role, "ADMIN");
  });

  it("rejects bad input with 400", async () => {
    const bad = [
      { irisId: "12345", name: "A", role: "VOLUNTEER" },
      { irisId: "12345678", name: "A", role: "VOLUNTEER" },
      { irisId: "abcdefg", name: "A", role: "VOLUNTEER" },
      { irisId: "3333333", name: "  ", role: "VOLUNTEER" },
      { irisId: "3333333", name: "A", role: "OWNER" },
      { irisId: "3333333", name: "A", role: "ADMIN", active: "yes" },
    ];
    for (const body of bad) {
      const res = await call(addStaffController, { body });
      assert.equal(res.statusCode, 400, JSON.stringify(body));
    }
    assert.equal(db.rows("event_staff").length, 2);
  });

  it("changes role and active, and does not touch anything else", async () => {
    const res = await call(updateStaffController, { params: { irisId: "2222222" }, body: { role: "ADMIN", active: false } });
    assert.equal(res.statusCode, 200);
    const row = db.rows("event_staff").find((r) => r.iris_id === "2222222");
    assert.deepEqual([row.role, row.active, row.name, row.created_at], ["ADMIN", false, "Vol", "2026-10-02T00:00:00Z"]);
  });

  it("returns 404 for someone not on the list, 400 for an empty or bad change", async () => {
    assert.equal((await call(updateStaffController, { params: { irisId: "9999999" }, body: { active: false } })).statusCode, 404);
    assert.equal((await call(updateStaffController, { params: { irisId: "2222222" }, body: {} })).statusCode, 400);
    assert.equal((await call(updateStaffController, { params: { irisId: "2222222" }, body: { role: "BOSS" } })).statusCode, 400);
    assert.equal((await call(updateStaffController, { params: { irisId: "22" }, body: { active: false } })).statusCode, 400);
  });

  it("will not demote or deactivate the last active admin", async () => {
    const demote = await call(updateStaffController, { params: { irisId: "1111111" }, body: { role: "VOLUNTEER" } });
    const off = await call(updateStaffController, { params: { irisId: "1111111" }, body: { active: false } });
    assert.equal(demote.statusCode, 409);
    assert.equal(off.statusCode, 409);
    const row = db.rows("event_staff").find((r) => r.iris_id === "1111111");
    assert.deepEqual([row.role, row.active], ["ADMIN", true]);
  });

  it("allows it once another active admin exists", async () => {
    await call(updateStaffController, { params: { irisId: "2222222" }, body: { role: "ADMIN" } });
    const res = await call(updateStaffController, { params: { irisId: "1111111" }, body: { active: false } });
    assert.equal(res.statusCode, 200);
  });

  it("a change takes effect for the scanner at once, not after the 5 minute cache", async () => {
    const check = async () => {
      const res = fakeRes();
      let passed = false;
      await requireStaff({ user: { irisId: "2222222" } }, res, () => { passed = true; });
      return passed;
    };

    assert.equal(await check(), true); // now cached as active
    await call(updateStaffController, { params: { irisId: "2222222" }, body: { active: false } });
    assert.equal(await check(), false);
    await call(updateStaffController, { params: { irisId: "2222222" }, body: { active: true } });
    assert.equal(await check(), true);
  });
});
