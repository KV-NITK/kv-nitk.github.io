import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import { fakeRes } from "./helpers/fakeSupabase.js";
import { importSrc, mockModule } from "./helpers/mocks.js";

const state = { profile: null, profileError: null, sessionError: null, created: [], deleted: [] };

mockModule("services/iris.service.js", {
  getIrisAuthorizationUrl: (s) => `https://iris.example/authorize?state=${s}`,
  getIrisProfile: async () => {
    if (state.profileError) throw state.profileError;
    return state.profile;
  },
});
mockModule("services/session.service.js", {
  createSession: async (...args) => {
    if (state.sessionError) throw state.sessionError;
    state.created.push(args);
    return { sessionId: "sess-1" };
  },
  deleteSession: async (id) => state.deleted.push(id),
});

const { irisLogin, irisCallback, logout, devLogin } = await importSrc("controllers/auth.controller.js");

const FRONTEND = "http://kannadavedike.dev.local:5174";
const profile = { reg_no: "2310113", roll_no: "231CV203", first_name: "Abhijith Sogal V", last_name: "  ", email: "a@example.com" };

const callback = async ({ query = { code: "c", state: "s1" }, cookies = { iris_oauth_state: "s1", iris_redirect_to: "/merch-test" } } = {}) => {
  const res = fakeRes();
  await irisCallback({ query, cookies }, res);
  return res;
};

describe("IRIS login", () => {
  beforeEach(() => {
    process.env.FRONTEND_URL = FRONTEND;
    Object.assign(state, { profile, profileError: null, sessionError: null, created: [], deleted: [] });
    mock.method(console, "error", () => {});
  });

  describe("start", () => {
    it("sets a random state cookie and sends the browser to IRIS with that state", () => {
      const res = fakeRes();
      irisLogin({ query: { redirect: "/merch-test" } }, res);

      const { value, options } = res.cookies.iris_oauth_state;
      assert.match(value, /^[0-9a-f]{64}$/);
      assert.equal(options.httpOnly, true);
      assert.equal(res.redirectedTo, `https://iris.example/authorize?state=${value}`);
      assert.equal(res.cookies.iris_redirect_to.value, "/merch-test");
    });

    it("uses a different state every time", () => {
      const a = fakeRes();
      const b = fakeRes();
      irisLogin({ query: {} }, a);
      irisLogin({ query: {} }, b);
      assert.notEqual(a.cookies.iris_oauth_state.value, b.cookies.iris_oauth_state.value);
    });

    for (const bad of ["//evil.com", "https://evil.com", "evil.com/x", "javascript:alert(1)", undefined, ["/a", "/b"]]) {
      it(`falls back to the default page for redirect=${JSON.stringify(bad)}`, () => {
        const res = fakeRes();
        irisLogin({ query: { redirect: bad } }, res);
        assert.equal(res.cookies.iris_redirect_to.value, "/team-registration");
      });
    }
  });

  describe("callback success", () => {
    it("creates a session with the profile, sets cookies and goes back to the page the user came from", async () => {
      const res = await callback();

      assert.equal(res.statusCode, 302);
      assert.match(res.redirectedTo, new RegExp(`^${FRONTEND}/merch-test\\?t=\\d+$`));

      const [[userId, type, user]] = state.created;
      assert.equal(userId, "2310113");
      assert.equal(type, "user");
      assert.deepEqual(user, { irisId: "2310113", name: "Abhijith Sogal V", email: "a@example.com", rollNo: "231CV203", regNo: "2310113" });

      assert.equal(res.cookies.session_id.value, "sess-1");
      assert.equal(res.cookies.session_id.options.httpOnly, true);
      assert.ok(res.cleared.includes("iris_oauth_state"));
      assert.ok(res.cleared.includes("iris_redirect_to"));
    });

    it("appends t= with & when the destination already has a query", async () => {
      const res = await callback({ cookies: { iris_oauth_state: "s1", iris_redirect_to: "/x?a=1" } });
      assert.match(res.redirectedTo, /\/x\?a=1&t=\d+$/);
    });

    it("falls back to roll_no or id for the user id and to a default name", async () => {
      state.profile = { roll_no: "R1" };
      await callback();
      assert.equal(state.created[0][0], "R1");
      assert.equal(state.created[0][2].name, "IRIS Student");

      state.profile = { user: { reg_no: "9", first_name: "Nested", last_name: "User" } };
      await callback();
      assert.equal(state.created[1][0], "9");
      assert.equal(state.created[1][2].name, "Nested User");
    });

    it("never redirects off-site, even if the redirect cookie was tampered with", async () => {
      const res = await callback({ cookies: { iris_oauth_state: "s1", iris_redirect_to: "//evil.com/steal" } });
      assert.ok(res.redirectedTo.startsWith(`${FRONTEND}/team-registration`));
    });
  });

  describe("callback failures go back to the site, not to a JSON page", () => {
    const failedWith = (res, reason, path = "/merch-test") => {
      assert.equal(res.statusCode, 302);
      assert.equal(res.redirectedTo, `${FRONTEND}${path}?login_error=${reason}`);
      assert.deepEqual(res.cookies, {});
      assert.equal(state.created.length, 0);
    };

    it("user declined at IRIS (no code)", async () => {
      failedWith(await callback({ query: { error: "access_denied" } }), "denied");
    });

    it("state cookie missing", async () => {
      const res = await callback({ cookies: { iris_redirect_to: "/merch-test", session_id: "old" } });
      failedWith(res, "state");
    });

    it("state does not match, and no profile is requested", async () => {
      state.profile = null; // would crash if fetched
      failedWith(await callback({ query: { code: "c", state: "forged" } }), "state");
    });

    it("state missing from the URL", async () => {
      failedWith(await callback({ query: { code: "c" } }), "state");
    });

    it("IRIS profile request fails", async () => {
      state.profileError = new Error("404");
      failedWith(await callback(), "failed");
    });

    it("session cannot be saved", async () => {
      state.sessionError = new Error("db down");
      const res = await callback();
      assert.equal(res.redirectedTo, `${FRONTEND}/merch-test?login_error=failed`);
      assert.ok(!("session_id" in res.cookies));
    });

    it("uses the default page when the redirect cookie is gone", async () => {
      failedWith(await callback({ cookies: {}, query: { code: "c", state: "s" } }), "state", "/team-registration");
    });

    it("clears the one-time cookies so a reload cannot replay them", async () => {
      const res = await callback({ query: { code: "c", state: "forged" } });
      assert.ok(res.cleared.includes("iris_oauth_state"));
      assert.ok(res.cleared.includes("iris_redirect_to"));
    });

    it("does not log cookie values (they include the session id)", async () => {
      await callback({ cookies: { iris_oauth_state: "s1", session_id: "SECRET-SESSION" }, query: { code: "c", state: "bad" } });
      const logged = JSON.stringify(console.error.mock.calls);
      assert.ok(!logged.includes("SECRET-SESSION"));
    });
  });

  describe("logout", () => {
    it("deletes the session and clears cookies", async () => {
      const res = fakeRes();
      await logout({ cookies: { session_id: "sess-9" } }, res);

      assert.deepEqual(state.deleted, ["sess-9"]);
      assert.ok(res.cleared.includes("session_id"));
      assert.equal(res.body.success, true);
    });
  });

  describe("devLogin", () => {
    it("creates session for DEV_USER_001, sets cookies, and redirects to scanner", async () => {
      const res = fakeRes();
      await devLogin({ query: {}, headers: {} }, res);

      assert.equal(state.created.length, 1);
      const [userId, type, userProfile] = state.created[0];
      assert.equal(userId, "DEV_USER_001");
      assert.equal(type, "user");
      assert.equal(userProfile.name, "Dev Staff");
      assert.equal(userProfile.email, "dev@nitk.edu.in");
      assert.equal(userProfile.rollNo, "DEV001");

      assert.equal(res.cookies.session_id.value, "sess-1");
      assert.equal(res.cookies.session_id.options.httpOnly, true);
      assert.ok(res.cookies.user_meta);
      assert.equal(res.redirectedTo, "http://localhost:5173/parva-26/scan");
    });

    it("respects custom redirect parameter", async () => {
      const res = fakeRes();
      await devLogin({ query: { redirect: "/custom-path" }, headers: {} }, res);
      assert.equal(res.redirectedTo, "/custom-path");
    });

    it("returns JSON when format=json is requested", async () => {
      const res = fakeRes();
      await devLogin({ query: { format: "json" }, headers: {} }, res);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.irisId, "DEV_USER_001");
      assert.equal(res.body.sessionId, "sess-1");
      assert.equal(res.cookies.session_id.value, "sess-1");
    });
  });
});
