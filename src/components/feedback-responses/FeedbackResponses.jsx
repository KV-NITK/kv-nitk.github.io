import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../../api/api";
import {
  ArrowLeft,
  Search,
  Users,
  RefreshCw,
  Lock,
  Unlock,
  KeyRound,
  FileSpreadsheet,
  Star,
  Sparkles,
  MessageSquare,
  Award,
  Filter,
} from "lucide-react";

export default function FeedbackResponses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const [passcode, setPasscode] = useState(
    () => localStorage.getItem("hh_feedback_pass") || ""
  );
  const [passInput, setPassInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState("");

  const fetchResponses = async (passToUse) => {
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
        `${API_URL}/feedback/public-list?pass=${encodeURIComponent(activePass)}`,
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
        setResponses(data.feedback || []);
        setIsUnlocked(true);
        setPasscode(activePass);
        localStorage.setItem("hh_feedback_pass", activePass);
      } else {
        setIsUnlocked(false);
        setPassError(data.message || "Invalid passcode. Please enter the correct event passcode.");
        localStorage.removeItem("hh_feedback_pass");
      }
    } catch (err) {
      console.error("Fetch feedback responses error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passcode) {
      setPassInput(passcode);
      fetchResponses(passcode);
    }
  }, []);

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    if (!passInput.trim()) {
      setPassError("Please enter the passcode.");
      return;
    }
    fetchResponses(passInput.trim());
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasscode("");
    setPassInput("");
    setResponses([]);
    localStorage.removeItem("hh_feedback_pass");
  };

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filteredResponses = responses.filter((r) => {
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !q ||
      (r.team_name || "").toLowerCase().includes(q) ||
      (r.user_name || "").toLowerCase().includes(q) ||
      (r.user_roll_no || "").toLowerCase().includes(q) ||
      (r.user_email || "").toLowerCase().includes(q) ||
      (r.favorite_moment || "").toLowerCase().includes(q) ||
      (r.suggestions || "").toLowerCase().includes(q);

    const matchesRating =
      ratingFilter === "all" || String(r.event_rating) === String(ratingFilter);

    const matchesDifficulty =
      difficultyFilter === "all" ||
      String(r.clue_difficulty) === String(difficultyFilter);

    return matchesSearch && matchesRating && matchesDifficulty;
  });

  // ----------------------------------------------------
  // STATS COMPUTATION
  // ----------------------------------------------------
  const totalResponses = responses.length;
  const uniqueSquads = new Set(
    responses.map((r) => (r.team_name || "").trim().toLowerCase()).filter(Boolean)
  ).size;

  const avgEventRating =
    totalResponses > 0
      ? (
          responses.reduce((sum, r) => sum + (Number(r.event_rating) || 0), 0) /
          totalResponses
        ).toFixed(1)
      : "0.0";

  const avgDifficulty =
    totalResponses > 0
      ? (
          responses.reduce((sum, r) => sum + (Number(r.clue_difficulty) || 0), 0) /
          totalResponses
        ).toFixed(1)
      : "0.0";

  // ----------------------------------------------------
  // EXPORT TO CSV
  // ----------------------------------------------------
  const exportToCSV = () => {
    if (!filteredResponses || filteredResponses.length === 0) return;

    const headers = [
      "Response ID",
      "Squad Name",
      "Participant Name",
      "Roll No",
      "Email",
      "Role",
      "Event Rating (1-5)",
      "Clue Difficulty (1=Hard, 5=Easy)",
      "Favorite Clue/Moment",
      "Suggestions & Feedback",
      "Submitted At",
    ];

    const rows = filteredResponses.map((r, i) => [
      r.id || i + 1,
      `"${(r.team_name || "").replace(/"/g, '""')}"`,
      `"${(r.user_name || "").replace(/"/g, '""')}"`,
      `"${(r.user_roll_no || "").replace(/"/g, '""')}"`,
      `"${(r.user_email || "").replace(/"/g, '""')}"`,
      `"${(r.user_role || "member").replace(/"/g, '""')}"`,
      r.event_rating || "",
      r.clue_difficulty || "",
      `"${(r.favorite_moment || "").replace(/"/g, '""')}"`,
      `"${(r.suggestions || "").replace(/"/g, '""')}"`,
      `"${r.created_at ? new Date(r.created_at).toLocaleString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `HH2026_Feedback_Responses_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ====================================================
  // PASSCODE UNLOCK SCREEN
  // ====================================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#110d0a] text-[#f7eed6] flex flex-col items-center justify-center p-4 selection:bg-[#8b261b] selection:text-white">
        <div className="w-full max-w-md bg-[#1c1510] border-2 border-[#7a4823]/40 rounded-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d48b14] to-transparent" />

          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="size-12 rounded-full bg-[#7a4823]/20 border border-[#7a4823]/50 flex items-center justify-center text-[#d48b14]">
              <Lock className="size-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-wide text-white">
              Coordinator Access
            </h1>
            <p className="text-xs text-[#eedca8]/70">
              Enter the event passcode to view participant feedback responses
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="passcodeInput"
                className="text-xs font-serif font-bold text-[#eedca8] tracking-wider uppercase"
              >
                Event Passcode
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#eedca8]/50" />
                <input
                  id="passcodeInput"
                  type="password"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Enter passcode"
                  autoFocus
                  className="w-full bg-[#110d0a] border border-[#7a4823]/50 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#eedca8]/30 focus:outline-none focus:border-[#d48b14] transition-colors"
                />
              </div>
            </div>

            {passError && (
              <p className="text-xs text-[#e57373] bg-[#8b261b]/20 border border-[#8b261b]/40 rounded-sm p-2 text-center font-medium">
                {passError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#8b261b] hover:bg-[#a32d20] active:scale-[0.99] text-white font-serif text-xs font-bold py-3 uppercase tracking-widest transition-all rounded-sm shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Unlock className="size-4" />
                  Unlock Responses
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#7a4823]/30 text-center">
            <Link
              to="/hh-2026"
              className="text-xs text-[#eedca8]/60 hover:text-[#d48b14] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Back to Hudugata Hudakata
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // RESPONSES DASHBOARD & TABLE
  // ====================================================
  return (
    <div className="min-h-screen bg-[#110d0a] text-[#f7eed6] flex flex-col selection:bg-[#8b261b] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1c1510]/95 backdrop-blur border-b border-[#7a4823]/40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/hh-2026"
            className="p-2 rounded-sm bg-[#110d0a] border border-[#7a4823]/40 text-[#eedca8] hover:text-white hover:border-[#d48b14] transition-all"
            title="Back to Landing Page"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white flex items-center gap-2">
              <MessageSquare className="size-5 text-[#d48b14]" />
              Feedback Responses
            </h1>
            <p className="text-[11px] text-[#eedca8]/70">
              Hudugata Hudakata 2026 &bull; Participant Debrief Submissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchResponses()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#110d0a] border border-[#7a4823]/40 hover:border-[#d48b14] text-xs font-semibold rounded-sm transition-all text-[#eedca8] cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={exportToCSV}
            disabled={filteredResponses.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#204e1e] hover:bg-[#286326] border border-[#3d7a36] text-xs font-serif font-bold text-white uppercase tracking-wider rounded-sm transition-all cursor-pointer disabled:opacity-40"
          >
            <FileSpreadsheet className="size-3.5" />
            Export CSV
          </button>

          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8b261b]/20 hover:bg-[#8b261b]/40 border border-[#8b261b]/50 text-xs font-serif font-bold text-[#e57373] rounded-sm transition-all cursor-pointer"
            title="Lock screen"
          >
            <Lock className="size-3.5" />
            Lock
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#1c1510] border border-[#7a4823]/40 rounded-sm p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#eedca8]/70">
              Total Responses
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-white">
                {totalResponses}
              </span>
              <span className="text-xs text-[#eedca8]/50">submissions</span>
            </div>
          </div>

          <div className="bg-[#1c1510] border border-[#7a4823]/40 rounded-sm p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#eedca8]/70">
              Unique Squads
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#d48b14]">
                {uniqueSquads}
              </span>
              <span className="text-xs text-[#eedca8]/50">teams</span>
            </div>
          </div>

          <div className="bg-[#1c1510] border border-[#7a4823]/40 rounded-sm p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#eedca8]/70">
              Avg Event Rating
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
                ⭐ {avgEventRating}
              </span>
              <span className="text-xs text-[#eedca8]/50">/ 5.0</span>
            </div>
          </div>

          <div className="bg-[#1c1510] border border-[#7a4823]/40 rounded-sm p-4 flex flex-col justify-between shadow-md">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#eedca8]/70">
              Avg Clue Difficulty
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-amber-400">
                {avgDifficulty}
              </span>
              <span className="text-xs text-[#eedca8]/50">/ 5 (1=Hard, 5=Easy)</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#1c1510] border border-[#7a4823]/40 rounded-sm p-4 flex flex-col md:flex-row items-center gap-3 shadow-md">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#eedca8]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by squad, participant name, roll number, clue, or suggestions..."
              className="w-full bg-[#110d0a] border border-[#7a4823]/40 rounded-sm py-2 pl-9 pr-4 text-xs sm:text-sm text-white placeholder:text-[#eedca8]/30 focus:outline-none focus:border-[#d48b14] transition-colors"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-serif font-bold text-[#eedca8]/70 whitespace-nowrap">
              Rating:
            </span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-[#110d0a] border border-[#7a4823]/40 text-xs text-[#eedca8] rounded-sm py-2 px-3 focus:outline-none focus:border-[#d48b14]"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-serif font-bold text-[#eedca8]/70 whitespace-nowrap">
              Difficulty:
            </span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-[#110d0a] border border-[#7a4823]/40 text-xs text-[#eedca8] rounded-sm py-2 px-3 focus:outline-none focus:border-[#d48b14]"
            >
              <option value="all">All Difficulties</option>
              <option value="1">1 - Very Challenging</option>
              <option value="2">2 - Challenging</option>
              <option value="3">3 - Balanced</option>
              <option value="4">4 - Moderately Easy</option>
              <option value="5">5 - Easy</option>
            </select>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-[#1c1510] border border-[#7a4823]/40 rounded-sm shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#110d0a] border-b border-[#7a4823]/40 font-serif text-[11px] font-bold text-[#eedca8] tracking-wider uppercase">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Squad Name</th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4 text-center">Event Rating</th>
                  <th className="py-3 px-4 text-center">Difficulty</th>
                  <th className="py-3 px-4 min-w-[200px]">Favorite Moment / Clue</th>
                  <th className="py-3 px-4 min-w-[240px]">Suggestions & Feedback</th>
                  <th className="py-3 px-4 whitespace-nowrap">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7a4823]/20 font-sans">
                {loading && responses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#eedca8]/50">
                      <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-[#d48b14]" />
                      Loading feedback submissions...
                    </td>
                  </tr>
                ) : filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#eedca8]/50 font-serif">
                      No feedback responses match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-[#251c15]/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#eedca8]/60 font-mono text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-serif font-bold text-white whitespace-nowrap">
                        {item.team_name}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#f7eed6]">
                            {item.user_name || "Anonymous"}
                          </span>
                          <span className="text-[11px] text-[#eedca8]/60">
                            {item.user_roll_no} &bull;{" "}
                            <span className="text-[#d48b14]">
                              {item.user_role === "leader" ? "👑 Leader" : "⚔️ Member"}
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded text-xs">
                          ⭐ {item.event_rating} / 5
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-block font-semibold px-2 py-0.5 rounded text-xs bg-[#110d0a] border border-[#7a4823]/40 text-[#eedca8]">
                          {item.clue_difficulty} / 5
                          <span className="block text-[10px] text-[#eedca8]/60">
                            {item.clue_difficulty <= 2
                              ? "Challenging"
                              : item.clue_difficulty >= 4
                              ? "Easy"
                              : "Balanced"}
                          </span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-[#eedca8]/90 whitespace-pre-wrap leading-relaxed">
                        {item.favorite_moment}
                      </td>

                      <td className="py-3 px-4 text-xs text-[#eedca8]/90 whitespace-pre-wrap leading-relaxed">
                        {item.suggestions}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[#eedca8]/50 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#110d0a] border-t border-[#7a4823]/40 flex items-center justify-between text-xs text-[#eedca8]/60 font-serif">
            <span>
              Showing <strong>{filteredResponses.length}</strong> of{" "}
              <strong>{totalResponses}</strong> total response(s)
            </span>
            <span>Hudugata Hudakata 2026 Admin Portal</span>
          </div>
        </div>
      </main>
    </div>
  );
}
