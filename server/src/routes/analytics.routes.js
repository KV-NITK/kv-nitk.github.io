import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

import { requireAdminPasscode } from "../middleware/adminAuth.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set ANALYTICS_DATA_DIR to a folder that survives a deploy (a mounted volume),
// or the counts start again from zero with every new container.
const DATA_DIR = process.env.ANALYTICS_DATA_DIR || path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "analytics.json");

const SAVE_EVERY_MS = 10 * 1000;
const MAX_ROUTES = 200;
const MAX_ROUTE_LENGTH = 100;
const ROUTE_PATTERN = /^\/[a-zA-Z0-9\-_/]*$/;

// Per client address, so one machine cannot flood the counters
const TRACK_LIMIT = 60;
const TRACK_WINDOW_MS = 60 * 1000;

const TARGET_ROUTES = [
  "/",
  "/events",
  "/social",
  "/parva-26/merch",
  "/parva-26/market",
  "/hh-2026",
  "/team-registration",
  "/my-orders",
];

// Pages that must not count their own visits
const NOT_TRACKED = ["/admin", "/analytics"];

const router = express.Router();

// route -> { totalVisits, visitors: Set<hashed visitor>, lastVisited }
const routes = new Map();
let dirty = false;

const emptyRoute = () => ({ totalVisits: 0, visitors: new Set(), lastVisited: null });

// Visitors are stored as a salted hash, never as the address itself
const visitorId = (ip) =>
  crypto
    .createHash("sha256")
    .update(`${process.env.ANALYTICS_SALT || process.env.ADMIN_PASSCODE || ""}|${ip}`)
    .digest("hex")
    .slice(0, 16);

const load = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

    for (const [route, entry] of Object.entries(parsed)) {
      routes.set(route, {
        totalVisits: Number(entry.totalVisits) || 0,
        visitors: new Set(Array.isArray(entry.visitors) ? entry.visitors : []),
        lastVisited: entry.lastVisited || null,
      });
    }
  } catch (err) {
    if (err.code !== "ENOENT") console.warn("Could not load analytics data:", err.message);
  }
};

const snapshot = () => {
  const out = {};

  for (const [route, entry] of routes) {
    out[route] = {
      totalVisits: entry.totalVisits,
      visitors: [...entry.visitors],
      lastVisited: entry.lastVisited,
    };
  }

  return JSON.stringify(out);
};

// Written off the request path, at most once every SAVE_EVERY_MS, and through a
// temporary file so a crash mid-write cannot leave half a file behind.
const save = async () => {
  if (!dirty) return;
  dirty = false;

  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    await fs.promises.writeFile(tmp, snapshot());
    await fs.promises.rename(tmp, DATA_FILE);
  } catch (err) {
    dirty = true;
    console.warn("Could not save analytics data:", err.message);
  }
};

// On shutdown, so the last few seconds of visits are not lost
const saveNow = () => {
  if (!dirty) return;

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, snapshot());
  } catch (err) {
    console.warn("Could not save analytics data:", err.message);
  }
};

load();
TARGET_ROUTES.forEach((r) => routes.has(r) || routes.set(r, emptyRoute()));

setInterval(save, SAVE_EVERY_MS).unref();

// A handler for these signals replaces Node's default of exiting, so exit here
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.once(signal, () => {
    saveNow();
    process.exit(0);
  });
}

const hits = new Map();

const tooMany = (ip) => {
  const now = Date.now();
  const record = hits.get(ip);

  if (!record || now > record.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + TRACK_WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > TRACK_LIMIT;
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of hits) if (now > record.resetAt) hits.delete(ip);
}, TRACK_WINDOW_MS).unref();

// Query string and trailing slash dropped; null when it is not a path we keep
const cleanRoute = (value) => {
  if (typeof value !== "string") return null;

  let route = value.split(/[?#]/)[0];
  if (route.length > 1) route = route.replace(/\/+$/, "");

  if (!route || route.length > MAX_ROUTE_LENGTH || !ROUTE_PATTERN.test(route)) return null;
  if (NOT_TRACKED.some((p) => route === p || route.startsWith(`${p}/`))) return null;

  return route;
};

// POST /api/analytics/track  { route }
router.post("/track", (req, res) => {
  // trust proxy is set in app.js, so this is the visitor and not nginx
  if (tooMany(req.ip)) return res.status(429).json({ success: false });

  const route = cleanRoute(req.body?.route);
  if (!route) return res.status(400).json({ success: false });

  let entry = routes.get(route);

  if (!entry) {
    // Anything beyond the cap is dropped, so junk paths cannot grow the file
    if (routes.size >= MAX_ROUTES) return res.status(204).end();
    entry = emptyRoute();
    routes.set(route, entry);
  }

  entry.totalVisits += 1;
  entry.visitors.add(visitorId(req.ip));
  entry.lastVisited = new Date().toISOString();
  dirty = true;

  return res.status(204).end();
});

// GET /api/analytics/stats - needs the admin password
router.get("/stats", requireAdminPasscode, (req, res) => {
  const stats = [...routes].map(([route, entry]) => ({
    route,
    totalVisits: entry.totalVisits,
    uniqueIps: entry.visitors.size,
    lastVisited: entry.lastVisited,
  }));

  const everyone = new Set();
  for (const entry of routes.values()) entry.visitors.forEach((v) => everyone.add(v));

  return res.json({
    success: true,
    summary: {
      totalVisits: stats.reduce((sum, s) => sum + s.totalVisits, 0),
      totalUniqueIps: everyone.size,
      activeRoutesCount: stats.length,
    },
    stats,
  });
});

export default router;
