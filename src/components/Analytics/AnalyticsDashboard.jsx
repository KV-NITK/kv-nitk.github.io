import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ANALYTICS_PASSWORD = "KV2026";
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID || "ca6f3d23-4369-4e89-8322-6e4666818e3d";

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
      <div className="min-h-screen bg-[#0b0705] flex items-center justify-center px-4 py-12 text-[#f3ead5] font-sans">
        <div className="w-full max-w-md bg-[#160e0a] border border-[#3a2215] rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#3a2215] text-[#c9a052] flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-[#f3ead5]">Analytics Access</h1>
            <p className="text-xs text-[#a38e75] mt-1">
              Enter password to access page visit analytics & visitor stats.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#c9a052] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg bg-[#0b0705] border border-[#3a2215] text-[#f3ead5] placeholder-[#6b5845] outline-none focus:border-[#c9a052] transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#c9a052] hover:bg-[#b0883d] text-[#0b0705] font-bold rounded-lg transition-colors shadow-lg"
            >
              Unlock Analytics
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-[#a38e75] hover:text-[#f3ead5] underline">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0705] text-[#f3ead5] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#160e0a] border border-[#3a2215] rounded-xl p-5 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-xl md:text-2xl font-bold">Kannada Vedike NITK — Analytics</h1>
            </div>
            <p className="text-xs text-[#a38e75] mt-1">
              Tracking unique IP visits & individual page views via Umami Analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://cloud.umami.is/websites/${WEBSITE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#c9a052] text-[#0b0705] text-xs font-bold hover:bg-[#b0883d] transition-colors"
            >
              Open Umami Portal ↗
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-[#3a2215] text-[#f3ead5] text-xs font-semibold hover:bg-[#4a2e1d] transition-colors"
            >
              Lock Analytics
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#160e0a] border border-[#3a2215] rounded-xl p-5">
            <div className="text-[#c9a052] text-xl mb-2">👤</div>
            <h3 className="font-bold text-sm text-[#f3ead5]">Unique IP Visitors</h3>
            <p className="text-xs text-[#a38e75] mt-1">
              Measures unique individual users and IP addresses visiting each page.
            </p>
          </div>

          <div className="bg-[#160e0a] border border-[#3a2215] rounded-xl p-5">
            <div className="text-[#c9a052] text-xl mb-2">📊</div>
            <h3 className="font-bold text-sm text-[#f3ead5]">Per-Page Tracking</h3>
            <p className="text-xs text-[#a38e75] mt-1">
              Tracks routes like /events, /parva-26/merch, /hh-2026, /team-registration, etc.
            </p>
          </div>

          <div className="bg-[#160e0a] border border-[#3a2215] rounded-xl p-5">
            <div className="text-[#c9a052] text-xl mb-2">🆔</div>
            <h3 className="font-bold text-sm text-[#f3ead5]">Website ID</h3>
            <p className="text-xs font-mono text-[#c9a052] mt-1 truncate">
              {WEBSITE_ID}
            </p>
          </div>
        </div>

        {/* Embedded Analytics / Umami Frame */}
        <div className="bg-[#160e0a] border border-[#3a2215] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#f3ead5]">Live Analytics Dashboard</h2>
            <span className="text-xs text-[#a38e75]">Powered by Umami</span>
          </div>

          <div className="w-full h-[650px] rounded-lg overflow-hidden border border-[#26170e] bg-[#0b0705]">
            <iframe
              src={`https://cloud.umami.is/share/${WEBSITE_ID}`}
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

