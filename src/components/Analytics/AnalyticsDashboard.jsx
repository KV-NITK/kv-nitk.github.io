import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ANALYTICS_PASSWORD = "KV2026";
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID || "ca6f3d23-4369-4e89-8322-6e4666818e3d";
const UMAMI_PORTAL_URL = `https://cloud.umami.is/websites/${WEBSITE_ID}`;
const UMAMI_SHARE_URL = `https://cloud.umami.is/share/${WEBSITE_ID}`;

const TRACKED_ROUTES = [
  { path: "/", name: "Home Page", category: "Core" },
  { path: "/events", name: "Events Page", category: "Core" },
  { path: "/social", name: "Social Initiatives", category: "Core" },
  { path: "/parva-26/merch", name: "Parva 2026 Merch Shop", category: "Merchandise" },
  { path: "/parva-26/market", name: "Parva 2026 Market", category: "Landing" },
  { path: "/hh-2026", name: "Hotte Hunnime 2026", category: "Games" },
  { path: "/team-registration", name: "Team Registration", category: "Events" },
  { path: "/my-orders", name: "User Orders", category: "Merchandise" },
  { path: "/admin", name: "Admin Orders Dashboard", category: "Admin" },
];

export default function AnalyticsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const authed = sessionStorage.getItem("umami_analytics_auth");
    if (authed === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ANALYTICS_PASSWORD) {
      sessionStorage.setItem("umami_analytics_auth", "true");
      setIsAuthenticated(true);
      setErrorMsg("");
      setPasswordInput("");
    } else {
      setErrorMsg("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("umami_analytics_auth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4 font-sans">
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

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-8 font-sans text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                Kannada Vedike NITK — Analytics
              </h1>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Tracking unique IP visits & individual page views via Umami Analytics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Unique IP Visitors
            </div>
            <div className="mt-1.5 text-2xl font-bold text-neutral-900">Active</div>
            <p className="mt-1 text-xs text-neutral-500">
              Measures unique individual users and IP addresses visiting each page.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Per-Page Tracking
            </div>
            <div className="mt-1.5 text-2xl font-bold text-neutral-900">All Routes</div>
            <p className="mt-1 text-xs text-neutral-500">
              Tracks routes like /events, /parva-26/merch, /hh-2026, /team-registration, etc.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Website ID
            </div>
            <div className="mt-1.5 text-xs font-mono font-bold text-neutral-900 truncate">
              {WEBSITE_ID}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Umami Cloud Property Identifier
            </p>
          </div>
        </div>

        {/* Embedded Analytics / Umami Dashboard */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Live Analytics Dashboard</h2>
              <p className="text-xs text-neutral-500">Powered by Umami Analytics Cloud</p>
            </div>
            <a
              href={UMAMI_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Launch Live Dashboard ↗
            </a>
          </div>

          {/* Embedded Share Frame */}
          <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
            <iframe
              src={UMAMI_SHARE_URL}
              title="Umami Analytics Dashboard"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>

          {/* Fallback help banner if iframe is restricted by browser security policies */}
          <div className="mt-3 rounded-lg bg-neutral-100 p-3.5 border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
            <span>
              ℹ️ Note: If your browser (e.g. Brave Shields / AdBlock) blocks the embedded iframe from loading, click the button to view your live stats directly on Umami Cloud.
            </span>
            <a
              href={UMAMI_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-neutral-900 underline hover:text-black whitespace-nowrap"
            >
              Open Full Umami Dashboard ↗
            </a>
          </div>
        </div>

        {/* Tracked Pages List */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-neutral-900 text-base mb-3">Tracked Page Routes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Route</th>
                  <th className="px-4 py-2.5 font-bold">Page Name</th>
                  <th className="px-4 py-2.5 font-bold">Category</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {TRACKED_ROUTES.map((route) => (
                  <tr key={route.path} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-neutral-900">{route.path}</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{route.name}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{route.category}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        Active Tracking
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
