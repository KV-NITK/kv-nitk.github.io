import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAnalyticsStats } from "../../api/admin";

const PASS_KEY = "analytics_pass";
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID || "ca6f3d23-4369-4e89-8322-6e4666818e3d";
const UMAMI_PORTAL_URL = `https://cloud.umami.is/websites/${WEBSITE_ID}`;
const UMAMI_SHARE_URL = `https://cloud.umami.is/share/${WEBSITE_ID}`;

// Default target routes as shown in user screenshot
const TARGET_ROUTES = [
  { path: "/", name: "Home Page" },
  { path: "/events", name: "Events Page" },
  { path: "/social", name: "Social Initiatives" },
  { path: "/parva-26/merch", name: "Parva 2026 Merch Shop" },
  { path: "/parva-26/market", name: "Parva 2026 Market" },
  { path: "/hh-2026", name: "Hotte Hunnime 2026" },
  { path: "/team-registration", name: "Team Registration" },
  { path: "/my-orders", name: "User Orders" },
  { path: "/admin", name: "Admin Orders Dashboard" },
];

const formatTimestamp = (iso) => {
  if (!iso) return "No visits yet";
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const readPass = () => {
  try {
    return sessionStorage.getItem(PASS_KEY) || "";
  } catch {
    return "";
  }
};

const writePass = (value) => {
  try {
    if (value) sessionStorage.setItem(PASS_KEY, value);
    else sessionStorage.removeItem(PASS_KEY);
  } catch {
    // the page works without remembering the password
  }
};

export default function AnalyticsDashboard() {
  // The password is checked by the server on every call; this page only holds it
  const [passcode, setPasscode] = useState(readPass);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [statsData, setStatsData] = useState([]);
  const [summaryData, setSummaryData] = useState({ totalVisits: 0, totalUniqueIps: 0, activeRoutesCount: 9 });
  const [loading, setLoading] = useState(false);
  const isAuthenticated = Boolean(passcode);

  const fetchLiveStats = useCallback(
    async (pass) => {
      setLoading(true);
      try {
        const json = await getAnalyticsStats(pass);
        setStatsData(json.stats || []);
        if (json.summary) setSummaryData(json.summary);
        setPasscode(pass);
        writePass(pass);
        setErrorMsg("");
      } catch (err) {
        if (err.status) {
          // Wrong password (or locked out): back to the password box
          writePass("");
          setPasscode("");
          setErrorMsg(err.message);
        }
        // Otherwise the server is unreachable; keep what is on screen
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!passcode) return;
    fetchLiveStats(passcode);
    const interval = setInterval(() => fetchLiveStats(passcode), 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, [passcode, fetchLiveStats]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput.trim()) {
      fetchLiveStats(passwordInput.trim());
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    writePass("");
    setPasscode("");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4 font-sans text-neutral-900">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-lg">
              🔒
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Analytics Access</h1>
            <p className="mt-1 text-xs text-neutral-500">
              Enter password to access page visit analytics & visitor stats.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-semibold text-red-700 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Unlock Analytics
            </button>
          </div>

          <div className="mt-5 text-center">
            <Link to="/" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 underline">
              ← Return to Home
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // Combine TARGET_ROUTES with live statsData
  const displayRoutes = TARGET_ROUTES.map((target) => {
    const live = statsData.find((s) => s.route === target.path);
    return {
      route: target.path,
      name: target.name,
      totalVisits: live?.totalVisits || 0,
      uniqueIps: live?.uniqueIps || 0,
      lastVisited: live?.lastVisited || null,
    };
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-8 font-sans text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                Kannada Vedike NITK — Analytics
              </h1>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Per-route page visit counts & unique IP visitor analytics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchLiveStats(passcode)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 shadow-sm disabled:opacity-60 transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh Stats"}
            </button>
            <a
              href={UMAMI_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 shadow-sm transition-colors"
            >
              Open Umami Portal ↗
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 shadow-sm transition-colors"
            >
              Lock Analytics
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Total Page Visits
            </div>
            <div className="mt-1.5 text-3xl font-bold text-neutral-900">
              {summaryData.totalVisits}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Total page hits across all tracked endpoints
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Unique IP Visitors
            </div>
            <div className="mt-1.5 text-3xl font-bold text-neutral-900">
              {summaryData.totalUniqueIps}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Distinct client IP addresses that visited the site
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Tracked Endpoints
            </div>
            <div className="mt-1.5 text-3xl font-bold text-neutral-900">
              {displayRoutes.length}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Individual route endpoints actively tracked
            </p>
          </div>
        </div>

        {/* Route Stats Table (Matching User Screenshot Specification) */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-neutral-900">Per-Route Visit & Unique IP Analytics</h2>
            <span className="text-xs text-neutral-500">Live updates every 10s</span>
          </div>

          <table className="w-full min-w-[45rem] text-left text-sm">
            <thead className="bg-neutral-50/70 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-bold">ROUTE</th>
                <th className="px-4 py-3 font-bold">TOTAL VISITS</th>
                <th className="px-4 py-3 font-bold">UNIQUE IP VISITORS</th>
                <th className="px-4 py-3 font-bold">LAST VISITED</th>
                <th className="px-4 py-3 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {displayRoutes.map((row) => (
                <tr key={row.route} className="align-middle hover:bg-neutral-50/50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold font-mono text-neutral-900 text-sm">
                    {row.route}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold text-neutral-900 text-base">
                    {row.totalVisits}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold text-neutral-900 text-base">
                    {row.uniqueIps}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-neutral-600 font-medium">
                    {formatTimestamp(row.lastVisited)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                      Active Tracking
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Embedded Umami Cloud Dashboard Frame / Fallback */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Umami Cloud Share Frame</h2>
              <p className="text-xs text-neutral-500">Live analytics dashboard from Umami Cloud</p>
            </div>
            <a
              href={UMAMI_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Open Full Portal ↗
            </a>
          </div>

          <div className="relative w-full h-[550px] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
            <iframe
              src={UMAMI_SHARE_URL}
              title="Umami Analytics Dashboard"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
