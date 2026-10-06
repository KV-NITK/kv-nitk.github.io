import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../../data/analytics.json");

const router = express.Router();

// Route store: route -> { totalVisits: number, uniqueIps: Set<string>, lastVisited: string }
let routeDataMap = new Map();

// Helper to load persisted data from disk
const loadPersistedData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      Object.entries(parsed).forEach(([route, obj]) => {
        routeDataMap.set(route, {
          totalVisits: Number(obj.totalVisits) || 0,
          uniqueIps: new Set(Array.isArray(obj.uniqueIps) ? obj.uniqueIps : []),
          lastVisited: obj.lastVisited || null,
        });
      });
    }
  } catch (err) {
    console.warn("Could not load analytics.json:", err.message);
  }
};

// Helper to save data to disk
const savePersistedData = () => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const exportObj = {};
    for (const [route, data] of routeDataMap.entries()) {
      exportObj[route] = {
        totalVisits: data.totalVisits,
        uniqueIps: Array.from(data.uniqueIps),
        lastVisited: data.lastVisited,
      };
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(exportObj, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save analytics.json:", err.message);
  }
};

// Load data on initialization
loadPersistedData();

const TARGET_ROUTES = [
  "/",
  "/events",
  "/social",
  "/parva-26/merch",
  "/parva-26/market",
  "/hh-2026",
  "/team-registration",
  "/my-orders",
  "/admin",
];

// Pre-initialize default target routes
TARGET_ROUTES.forEach((r) => {
  if (!routeDataMap.has(r)) {
    routeDataMap.set(r, {
      totalVisits: 0,
      uniqueIps: new Set(),
      lastVisited: null,
    });
  }
});

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
};

// POST /api/analytics/track
router.post("/track", (req, res) => {
  try {
    const rawRoute = req.body?.route || req.body?.path || "/";
    const normalizedRoute = rawRoute.split("?")[0] || "/";
    const clientIp = getClientIp(req);

    let data = routeDataMap.get(normalizedRoute);
    if (!data) {
      data = {
        totalVisits: 0,
        uniqueIps: new Set(),
        lastVisited: null,
      };
      routeDataMap.set(normalizedRoute, data);
    }

    data.totalVisits += 1;
    data.uniqueIps.add(clientIp);
    data.lastVisited = new Date().toISOString();

    // Save to disk
    savePersistedData();

    return res.json({
      success: true,
      route: normalizedRoute,
      totalVisits: data.totalVisits,
      uniqueIpsCount: data.uniqueIps.size,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/stats
router.get("/stats", (req, res) => {
  try {
    const stats = [];

    // Include target routes
    TARGET_ROUTES.forEach((r) => {
      const data = routeDataMap.get(r) || { totalVisits: 0, uniqueIps: new Set(), lastVisited: null };
      stats.push({
        route: r,
        totalVisits: data.totalVisits,
        uniqueIps: data.uniqueIps.size,
        lastVisited: data.lastVisited,
      });
    });

    // Add any dynamically discovered routes
    for (const [r, data] of routeDataMap.entries()) {
      if (!TARGET_ROUTES.includes(r)) {
        stats.push({
          route: r,
          totalVisits: data.totalVisits,
          uniqueIps: data.uniqueIps.size,
          lastVisited: data.lastVisited,
        });
      }
    }

    const totalVisitsAll = stats.reduce((acc, curr) => acc + curr.totalVisits, 0);
    const allUniqueIps = new Set();
    for (const data of routeDataMap.values()) {
      data.uniqueIps.forEach((ip) => allUniqueIps.add(ip));
    }

    return res.json({
      success: true,
      summary: {
        totalVisits: totalVisitsAll,
        totalUniqueIps: allUniqueIps.size,
        activeRoutesCount: stats.length,
      },
      stats,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
