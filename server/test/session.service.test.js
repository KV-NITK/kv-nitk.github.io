import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { createSession, getSession, deleteSession } = await importSrc("services/session.service.js");
const { requireAuth } = await importSrc("middleware/auth.middleware.js");

const profile = { irisId: "2310113", name: "Abhijith", email: "a@example.com", rollNo: "231CV203" };

describe("sessions", () => {
  beforeEach(() => {
    db.rows("sessions").splice(0, Infinity);
    mock.method(console, "warn", () => {});
  });

  it("stores the profile in the session row", async () => {
    const { sessionId, expiresAt } = await createSession("2310113", "user", profile);

    const [row] = db.rows("sessions");
    assert.equal(row.id, sessionId);
    assert.equal(row.user_id, "2310113");
    assert.deepEqual(row.user_data, profile);
    assert.ok(new Date(expiresAt) > new Date(Date.now() + 23 * 3600e3));
  });

  it("returns the stored profile when the session is read back", async () => {
    const { sessionId } = await createSession("2310113", "user", profile);
    assert.deepEqual((await getSession(sessionId)).user_data, profile);
  });

  it("does not return an expired session", async () => {
    db.rows("sessions").push({ id: "old", user_id: "u", expires_at: new Date(Date.now() - 1000).toISOString() });
    assert.equal(await getSession("old"), null);
  });

  it("still logs users in when the user_data column is not migrated yet", async () => {
    db.failNext("sessions", "insert", { code: "PGRST204", message: "Could not find the 'user_data' column" });

    const { sessionId } = await createSession("2310113", "user", profile);

    assert.equal(db.rows("sessions").length, 1);
    assert.ok(!("user_data" in db.rows("sessions")[0]));
    assert.deepEqual((await getSession(sessionId)).user_data, profile); // kept in memory
  });

  it("throws on other database errors", async () => {
    db.failNext("sessions", "insert", { code: "42501", message: "row-level security" });
    await assert.rejects(createSession("u", "user", profile), (e) => e.code === "42501");
  });

  it("creates sessions without a profile (coordinator / team sessions)", async () => {
    const { sessionId } = await createSession("team-1", "team");
    assert.equal((await getSession(sessionId)).user_data, null);
  });

  it("deletes a session", async () => {
    const { sessionId } = await createSession("u", "user", profile);
    await deleteSession(sessionId);
    assert.equal(db.rows("sessions").length, 0);
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    db.rows("sessions").splice(0, Infinity);
    mock.method(console, "warn", () => {});
    mock.method(console, "error", () => {});
  });

  const run = async (cookies) => {
    const req = { cookies };
    const res = fakeRes();
    let nextCalled = false;
    await requireAuth(req, res, () => (nextCalled = true));
    return { req, res, nextCalled };
  };

  it("rejects a request without a session cookie", async () => {
    const { res, nextCalled } = await run({});
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it("rejects an unknown or expired session", async () => {
    assert.equal((await run({ session_id: "nope" })).res.statusCode, 401);

    db.rows("sessions").push({ id: "old", user_id: "u", expires_at: new Date(Date.now() - 1000).toISOString() });
    assert.equal((await run({ session_id: "old" })).res.statusCode, 401);
  });

  it("builds req.user from the stored session profile", async () => {
    const { sessionId } = await createSession("2310113", "user", profile);
    const { req, nextCalled } = await run({ session_id: sessionId });

    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, { irisId: "2310113", name: "Abhijith", email: "a@example.com", rollNo: "231CV203" });
  });

  it("ignores a forged user_meta cookie (name and email feed payment details)", async () => {
    const { sessionId } = await createSession("2310113", "user", profile);
    const forged = Buffer.from(JSON.stringify({ name: "Forged", email: "evil@example.com" })).toString("base64");

    const { req } = await run({ session_id: sessionId, user_meta: forged });
    assert.equal(req.user.name, "Abhijith");
    assert.equal(req.user.email, "a@example.com");
  });

  it("does not take a profile from user_meta, so a session with none counts as logged out", async () => {
    db.rows("sessions").push({ id: "bare", user_id: "2310113", expires_at: new Date(Date.now() + 3600e3).toISOString() });
    const forged = Buffer.from(JSON.stringify({ name: "Forged", email: "evil@example.com" })).toString("base64");

    const { req, res, nextCalled } = await run({ session_id: "bare", user_meta: forged });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.notEqual(req.user?.name, "Forged");
  });

  it("answers 500 when the session lookup fails", async () => {
    db.failNext("sessions", "select", { code: "XX", message: "down" });
    assert.equal((await run({ session_id: "x" })).res.statusCode, 500);
  });
});
