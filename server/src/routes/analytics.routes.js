import express from "express";

const router = express.Router();

// In-memory route analytics storage
// Stores route -> { totalVisits: number, uniqueIps: Set<string>, lastVisited: string, history: Array }
const routeStore = new Map();

// Default target routes to ensure they are listed in stats even before initial hits
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

// Pre-populate target routes
TARGET_ROUTES.forEach((r) => {
  if (!routeStore.has(r)) {
    routeStore.set(r, {
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
    // Normalize route path (strip query params for grouping)
    const normalizedRoute = rawRoute.split("?")[0] || "/";
    const clientIp = getClientIp(req);

    let data = routeStore.get(normalizedRoute);
    if (!data) {
      data = {
        totalVisits: 0,
        uniqueIps: new Set(),
        lastVisited: null,
      };
      routeStore.set(normalizedRoute, data);
    }

    data.totalVisits += 1;
    data.uniqueIps.add(clientIp);
    data.lastVisited = new Date().toISOString();

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

    // Ensure all TARGET_ROUTES appear in response
    TARGET_ROUTES.forEach((r) => {
      const data = routeStore.get(r) || { totalVisits: 0, uniqueIps: new Set(), lastVisited: null };
      stats.push({
        route: r,
        totalVisits: data.totalVisits,
        uniqueIps: data.uniqueIps.size,
        lastVisited: data.lastVisited,
      });
    });

    // Add any extra routes visited that weren't in default list
    for (const [r, data] of routeStore.entries()) {
      if (!TARGET_ROUTES.includes(r)) {
        stats.push({
          route: r,
          totalVisits: data.totalVisits,
          uniqueIps: data.uniqueIps.size,
          lastVisited: data.lastVisited,
        });
      }
    }

    // Calculate overall totals
    const totalVisitsAll = stats.reduce((acc, curr) => acc + curr.totalVisits, 0);
    const allUniqueIps = new Set();
    for (const data of routeStore.values()) {
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
