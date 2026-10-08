import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import express from "express";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "analytics-"));
process.env.ANALYTICS_DATA_DIR = dir;
process.env.ADMIN_PASSCODE = "open-sesame";

const { default: router } = await import("../src/routes/analytics.routes.js");

describe("analytics", () => {
  let server;
  let base;

  before(async () => {
    const app = express();
    app.set("trust proxy", true); // so a test can be a different visitor each time
    app.use(express.json());
    app.use("/api/analytics", router);
    await new Promise((resolve) => { server = app.listen(0, resolve); });
    base = `http://127.0.0.1:${server.address().port}/api/analytics`;
  });

  after(() => {
    server.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const track = (route, from = "9.9.9.9") =>
    fetch(`${base}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": from },
      body: JSON.stringify({ route }),
    });
  const stats = (pass) => fetch(`${base}/stats`, { headers: pass ? { "x-admin-passcode": pass } : {} });

  it("keeps the stats behind the admin password", async () => {
    assert.equal((await stats()).status, 401);
    assert.equal((await stats("wrong")).status, 401);
    assert.equal((await stats("open-sesame")).status, 200);
  });

  it("counts a visit, ignoring the query string and a trailing slash", async () => {
    assert.equal((await track("/events/?x=1")).status, 204);
    const { stats: rows, summary } = await (await stats("open-sesame")).json();
    const events = rows.find((r) => r.route === "/events");
    assert.equal(events.totalVisits, 1);
    assert.equal(events.uniqueIps, 1);
    assert.equal(summary.totalUniqueIps, 1);
  });

  it("does not store the address itself", async () => {
    const body = JSON.stringify(await (await stats("open-sesame")).json());
    assert.ok(!body.includes("127.0.0.1"));
  });

  it("refuses routes that are not strings, too long, or not plain paths", async () => {
    for (const bad of [undefined, 42, {}, "events", "/a b", "/<script>", `/${"a".repeat(200)}`]) {
      assert.equal((await track(bad)).status, 400, `route ${JSON.stringify(bad)}`);
    }
  });

  it("does not count the admin and analytics pages", async () => {
    assert.equal((await track("/admin")).status, 400);
    assert.equal((await track("/analytics")).status, 400);
  });

  it("stops adding new routes at the cap", async () => {
    for (let i = 0; i < 250; i++) await track(`/junk-${i}`, `10.0.0.${i}`);
    const { stats: rows } = await (await stats("open-sesame")).json();
    assert.equal(rows.length, 200);
  });

  it("limits how often one address can track", async () => {
    let limited = false;
    for (let i = 0; i < 80 && !limited; i++) limited = (await track("/events", "8.8.8.8")).status === 429;
    assert.ok(limited);
  });
});
