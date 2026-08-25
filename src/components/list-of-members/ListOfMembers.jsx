import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../../api/api";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Users,
  RefreshCw,
  MessageCircle,
  Lock,
  KeyRound,
} from "lucide-react";

export default function ListOfMembers() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [passcode, setPasscode] = useState(
    () => localStorage.getItem("hh_roster_pass") || ""
  );
  const [passInput, setPassInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState("");

  const fetchTeams = async (passToUse) => {
    const activePass = passToUse !== undefined ? passToUse : passcode;
    if (!activePass) {
      setIsUnlocked(false);
      return;
    }

    setLoading(true);
    setError("");
    setPassError("");

    try {
      const response = await fetch(
        `${API_URL}/teams/public-list?pass=${encodeURIComponent(activePass)}`,
        {
          headers: {
            "x-passcode": activePass,
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setError("Server returned an invalid response. Please try again later.");
        setIsUnlocked(false);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setTeams(data.teams || []);
        setIsUnlocked(true);
        setPasscode(activePass);
        localStorage.setItem("hh_roster_pass", activePass);
      } else {
        setIsUnlocked(false);
        setPassError(data.message || "Invalid passcode. Please try again.");
        localStorage.removeItem("hh_roster_pass");
      }
    } catch (err) {
      console.error("Fetch teams error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passcode) {
      fetchTeams(passcode);
    }
  }, []);

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    if (!passInput.trim()) {
      setPassError("Please enter the passcode.");
      return;
    }
    fetchTeams(passInput.trim());
  };

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchTeam = (t.teamName || "").toLowerCase().includes(q);
    const matchLeader = (t.leaderName || "").toLowerCase().includes(q);
    const matchMembers = (t.members || []).some((m) =>
      (m || "").toLowerCase().includes(q)
    );

    return matchTeam || matchLeader || matchMembers;
  });

  const totalHunters = teams.reduce(
    (acc, t) => acc + 1 + (t.members ? t.members.length : 0),
    0
  );

  return (
    <div className="hh2026-page min-h-screen bg-parchment text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/90 backdrop-blur-md px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            to="/hh-2026"
            className="inline-flex items-center gap-2 border border-primary/40 bg-card px-4 py-2 font-serif text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm shadow-sm"
          >
            <ArrowLeft className="size-4" />
            <span>HH-2026 Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/team-registration"
              className="hidden sm:inline-flex items-center gap-2 border border-primary/40 bg-secondary px-4 py-2 font-serif text-xs font-bold uppercase tracking-wider text-secondary-foreground hover:border-primary transition-all rounded-sm shadow-sm"
            >
              <Users className="size-4 text-primary" />
              <span>Squad Registration</span>
            </Link>

            <a
              href="https://chat.whatsapp.com/EqzxIHeU7Ol9AYZcfbFSUW?s=sw&p=a&ilr=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 font-serif text-xs font-bold uppercase tracking-wider transition-all rounded shadow-md"
            >
              <MessageCircle className="size-4" />
              <span className="hidden sm:inline">Event WhatsApp Group</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14 flex-1 flex flex-col gap-8">
        {/* Title Header */}
        <div className="text-center flex flex-col items-center gap-3 border-b-2 border-primary/20 pb-8">
          <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Hudugata Hudakata 2026 &bull; Registered Squads
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black uppercase text-carved tracking-tight">
            List of Registered Members
          </h1>
          <p className="font-serif text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Official Roster of Registered Treasure Hunt Squads
          </p>

          {isUnlocked && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-serif font-bold uppercase">
              <div className="border border-primary/30 bg-card px-4 py-2 rounded shadow-sm text-primary">
                <span className="text-foreground">{teams.length}</span> Squads Registered
              </div>
              <div className="border border-primary/30 bg-card px-4 py-2 rounded shadow-sm text-primary">
                <span className="text-foreground">{totalHunters}</span> Hunters On Board
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* PASSCODE LOCKED GATE SCREEN */}
        {/* ---------------------------------------------------- */}
        {!isUnlocked && (
          <div className="mx-auto w-full max-w-md my-8">
            <div className="border-2 border-primary/50 bg-wood p-8 shadow-2xl rounded-sm text-center flex flex-col items-center gap-6 relative">
              <div className="size-14 rounded-full border-2 border-primary bg-background/80 flex items-center justify-center text-primary shadow-lg">
                <Lock className="size-7" />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-2xl font-black uppercase text-carved tracking-wide">
                  Restricted Access
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  Enter the event secret passcode to view the registered squad roster.
                </p>
              </div>

              <form onSubmit={handleUnlockSubmit} className="w-full flex flex-col gap-4">
                <div className="relative w-full">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary/70" />
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="Enter passcode (e.g. raama-raama)"
                    required
                    className="w-full border-2 border-primary/40 bg-background pl-10 pr-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-inner rounded-sm"
                  />
                </div>

                {passError && (
                  <p className="text-xs font-bold text-destructive bg-destructive/15 p-3 rounded border border-destructive/30 font-serif">
                    {passError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="clip-torn w-full bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-6 py-3.5 font-serif text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Verifying Passcode..." : "UNLOCK ROSTER"}
                </button>
              </form>

              <p className="text-[11px] font-serif italic text-primary/80 mt-2">
                Hint: &ldquo;Rama Rama... Thusu Daksha Vrutha Jaripa!&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* UNLOCKED ROSTER CONTENT */}
        {/* ---------------------------------------------------- */}
        {isUnlocked && (
          <>
            {/* Search & Refresh Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-primary/30 bg-card p-4 rounded-sm shadow-md">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by team name, leader, or member..."
                  className="w-full border border-primary/30 bg-background/80 pl-10 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-sm shadow-inner"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => fetchTeams(passcode)}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary/40 bg-secondary px-5 py-2.5 font-serif text-xs font-bold uppercase tracking-wider text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all rounded-sm shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("hh_roster_pass");
                    setIsUnlocked(false);
                    setPasscode("");
                    setTeams([]);
                  }}
                  className="border border-primary/30 bg-background px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-all rounded-sm"
                >
                  Lock
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-4 border border-primary/20 bg-card/40 rounded-sm">
                <RefreshCw className="size-8 text-primary animate-spin" />
                <p className="font-serif text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Fetching Registered Squads...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="border-2 border-destructive/60 bg-destructive/15 p-6 text-center font-serif text-sm font-bold text-destructive rounded-sm shadow-md">
                <p>{error}</p>
                <button
                  onClick={() => fetchTeams(passcode)}
                  className="mt-3 inline-flex items-center gap-2 border border-destructive bg-card px-4 py-2 text-xs font-bold uppercase text-foreground hover:bg-destructive hover:text-white transition-all rounded shadow-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredTeams.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-primary/20 bg-card p-8 rounded-sm shadow-md">
                <ShieldCheck className="size-10 text-primary/60" />
                <h3 className="font-serif text-lg font-bold uppercase text-foreground">
                  No Registered Squads Found
                </h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  {searchQuery
                    ? `No squads matched "${searchQuery}". Try clearing your search.`
                    : "No teams have registered yet. Be the first squad to register!"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs font-bold text-primary underline uppercase hover:text-foreground"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            )}

            {/* Desktop & Mobile Table View */}
            {!loading && !error && filteredTeams.length > 0 && (
              <div className="border-2 border-primary/40 bg-card shadow-2xl rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-primary/30 bg-secondary/80 font-serif text-xs font-bold uppercase tracking-widest text-primary">
                        <th className="py-4 px-6 w-16 text-center">ID</th>
                        <th className="py-4 px-6 min-w-[200px]">Team Name</th>
                        <th className="py-4 px-6 min-w-[200px]">Leader</th>
                        <th className="py-4 px-6 min-w-[300px]">Member Names</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/15 text-xs sm:text-sm font-medium">
                      {filteredTeams.map((team) => (
                        <tr
                          key={team.id}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          {/* Column 1: ID */}
                          <td className="py-4 px-6 font-serif font-bold text-center text-primary/80">
                            #{team.id}
                          </td>

                          {/* Column 2: Team Name */}
                          <td className="py-4 px-6 font-serif font-bold text-foreground text-base">
                            {team.teamName}
                          </td>

                          {/* Column 3: Leader Name */}
                          <td className="py-4 px-6 font-semibold text-primary">
                            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 px-3 py-1 rounded text-xs">
                              👑 {team.leaderName}
                            </span>
                          </td>

                          {/* Column 4: Member Names (Only Names) */}
                          <td className="py-4 px-6">
                            {team.members && team.members.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {team.members.map((mName, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-secondary/70 border border-primary/20 px-2.5 py-1 rounded text-xs font-semibold text-foreground/90"
                                  >
                                    {mName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">
                                No additional members
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Banner */}
      <footer className="border-t border-primary/20 bg-background/90 py-6 text-center text-xs font-serif font-semibold text-muted-foreground">
        Kannada Vedike NITK Surathkal &bull; Hudugata Hudakata 2026
      </footer>
    </div>
  );
}
