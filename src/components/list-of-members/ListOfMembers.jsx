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
  Unlock,
  KeyRound,
  FileSpreadsheet,
  FileText,
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
      setPassInput(passcode);
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

  // ----------------------------------------------------
  // EXPORT TO CSV (EACH MEMBER IN SEPARATE COLUMN)
  // ----------------------------------------------------
  const exportToCSV = () => {
    if (!filteredTeams || filteredTeams.length === 0) return;

    const headers = [
      "ID",
      "Team Name",
      "Leader Name",
      "Member 2",
      "Member 3",
      "Member 4",
    ];

    const rows = filteredTeams.map((team) => [
      team.id,
      `"${(team.teamName || "").replace(/"/g, '""')}"`,
      `"${(team.leaderName || "").replace(/"/g, '""')}"`,
      `"${(team.members?.[0] || "").replace(/"/g, '""')}"`,
      `"${(team.members?.[1] || "").replace(/"/g, '""')}"`,
      `"${(team.members?.[2] || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `HH2026_Registered_Squads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // EXPORT TO PDF (EACH MEMBER IN SEPARATE COLUMN)
  // ----------------------------------------------------
  const exportToPDF = () => {
    if (!filteredTeams || filteredTeams.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF.");
      return;
    }

    const rowsHtml = filteredTeams
      .map(
        (t) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #bbb; text-align: center; font-weight: bold;">#${t.id}</td>
        <td style="padding: 10px; border: 1px solid #bbb; font-weight: bold;">${t.teamName}</td>
        <td style="padding: 10px; border: 1px solid #bbb;">👑 ${t.leaderName}</td>
        <td style="padding: 10px; border: 1px solid #bbb;">${t.members?.[0] || "—"}</td>
        <td style="padding: 10px; border: 1px solid #bbb;">${t.members?.[1] || "—"}</td>
        <td style="padding: 10px; border: 1px solid #bbb;">${t.members?.[2] || "—"}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HH2026 Registered Squads Roster</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 24px; color: #1a0a03; background: #fffdf9; }
            h1 { text-transform: uppercase; letter-spacing: 1px; color: #8b261b; margin-bottom: 4px; font-size: 24px; }
            p { margin-top: 0; color: #555; font-size: 13px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th { background: #eedca8; color: #4a2206; padding: 10px 12px; border: 1px solid #bbb; text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
            tr:nth-child(even) { background: #f9f4e8; }
            .footer { margin-top: 30px; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #ddd; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Hudugata Hudakata 2026</h1>
          <p>Official Registered Squads Roster &bull; Total Squads: ${filteredTeams.length} &bull; Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 45px;">ID</th>
                <th style="width: 180px;">Team Name</th>
                <th style="width: 160px;">Leader Name</th>
                <th style="width: 150px;">Member 2</th>
                <th style="width: 150px;">Member 3</th>
                <th style="width: 150px;">Member 4</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Kannada Vedike NITK Surathkal &bull; Official Event Roster Document
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
        {/* PASSCODE INPUT BAR (ONLY SHOWN WHEN LOCKED) */}
        {/* ---------------------------------------------------- */}
        {!isUnlocked && (
          <div className="border-2 border-primary/40 bg-card p-5 sm:p-6 shadow-xl rounded-sm">
            <form
              onSubmit={handleUnlockSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 shrink-0">
                <div className="size-10 rounded-full border border-primary/40 bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="size-5" />
                </div>
                <div>
                  <p className="font-serif text-xs font-bold uppercase tracking-wider text-primary">
                    Passcode Required
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Enter secret passcode to view registered squad members
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:max-w-md">
                <div className="relative w-full">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-primary/70" />
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => {
                      setPassInput(e.target.value);
                      if (passError) setPassError("");
                    }}
                    placeholder="Enter secret passcode"
                    required
                    className="w-full border-2 border-primary/40 bg-background pl-10 pr-4 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-inner rounded-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-6 py-2.5 font-serif text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Unlock Roster</span>
                  )}
                </button>
              </div>
            </form>

            {passError && (
              <p className="mt-3 text-xs font-bold text-destructive bg-destructive/15 p-2.5 rounded border border-destructive/30 text-center font-serif">
                {passError}
              </p>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* PASSCODE LOCKED NOTICE */}
        {/* ---------------------------------------------------- */}
        {!isUnlocked && !loading && (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-4 border border-primary/20 bg-card/60 p-8 rounded-sm shadow-md">
            <Lock className="size-12 text-primary/60" />
            <h3 className="font-serif text-xl font-bold uppercase text-foreground">
              Roster Access Restricted
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
              Enter the event secret passcode in the input field above and click <strong>&quot;Submit&quot;</strong> to view the list of registered teams and members.
            </p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* UNLOCKED ROSTER CONTENT */}
        {/* ---------------------------------------------------- */}
        {isUnlocked && (
          <>
            {/* Search, Refresh & Export Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-2 border-primary/30 bg-card p-4 rounded-sm shadow-md">
              {/* Search Bar */}
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by team, leader, or member..."
                  className="w-full border border-primary/30 bg-background/80 pl-10 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-sm shadow-inner"
                />
              </div>

              {/* Action Buttons: Export CSV, Export PDF, Refresh, Lock */}
              <div className="flex flex-wrap items-center gap-2.5 justify-end">
                <button
                  onClick={exportToCSV}
                  disabled={filteredTeams.length === 0}
                  className="inline-flex items-center gap-2 border border-emerald-700/60 bg-emerald-950/20 text-emerald-800 hover:bg-emerald-800 hover:text-white px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-wider transition-all rounded-sm shadow-sm cursor-pointer disabled:opacity-50"
                  title="Export to CSV"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={exportToPDF}
                  disabled={filteredTeams.length === 0}
                  className="inline-flex items-center gap-2 border border-[#8b261b]/60 bg-[#8b261b]/15 text-[#8b261b] hover:bg-[#8b261b] hover:text-[#f7eed6] px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-wider transition-all rounded-sm shadow-sm cursor-pointer disabled:opacity-50"
                  title="Export / Print PDF"
                >
                  <FileText className="size-4" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={() => fetchTeams(passcode)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 border border-primary/40 bg-secondary px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-wider text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all rounded-sm shadow-sm cursor-pointer disabled:opacity-60"
                  title="Refresh Roster"
                >
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("hh_roster_pass");
                    setIsUnlocked(false);
                    setPasscode("");
                    setPassInput("");
                    setTeams([]);
                  }}
                  className="border border-primary/30 bg-background px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-all rounded-sm cursor-pointer"
                  title="Lock Roster Session"
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
