import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Users, LogOut, Edit3 } from "lucide-react";

export function FeedbackForm({
  user,
  userTeam,
  handleLogout,
  onSubmit,
  loading,
  isSubmitted,
  resetForm,
  initialFeedback = null,
}) {
  const defaultTeamName = userTeam?.teamName || userTeam?.team_name || "";
  const [teamName, setTeamName] = useState(
    initialFeedback?.team_name || initialFeedback?.teamName || defaultTeamName
  );
  const [eventRating, setEventRating] = useState(
    initialFeedback?.event_rating || initialFeedback?.eventRating || null
  );
  const [clueDifficulty, setClueDifficulty] = useState(
    initialFeedback?.clue_difficulty || initialFeedback?.clueDifficulty || null
  );
  const [favoriteMoment, setFavoriteMoment] = useState(
    initialFeedback?.favorite_moment || initialFeedback?.favoriteMoment || ""
  );
  const [suggestions, setSuggestions] = useState(
    initialFeedback?.suggestions || ""
  );
  const [errorMsg, setErrorMsg] = useState("");

  const isLeader = userTeam?.role === "leader";

  useEffect(() => {
    if (initialFeedback) {
      setTeamName(initialFeedback.team_name || initialFeedback.teamName || defaultTeamName);
      setEventRating(initialFeedback.event_rating || initialFeedback.eventRating || null);
      setClueDifficulty(initialFeedback.clue_difficulty || initialFeedback.clueDifficulty || null);
      setFavoriteMoment(initialFeedback.favorite_moment || initialFeedback.favoriteMoment || "");
      setSuggestions(initialFeedback.suggestions || "");
    }
  }, [initialFeedback, defaultTeamName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setErrorMsg("Team Name is required.");
      return;
    }
    if (!eventRating) {
      setErrorMsg("Please rate how you liked the Hudukta Hudukata event.");
      return;
    }
    if (!clueDifficulty) {
      setErrorMsg("Please rate how you found the clues.");
      return;
    }
    if (!favoriteMoment.trim()) {
      setErrorMsg("Please tell us which clue/event moment you enjoyed the most.");
      return;
    }
    if (!suggestions.trim()) {
      setErrorMsg("Please provide suggestions or feedback for the next edition.");
      return;
    }

    setErrorMsg("");
    onSubmit({
      teamName: teamName.trim(),
      teamId: userTeam?.id,
      role: userTeam?.role || "member",
      eventRating: Number(eventRating),
      clueDifficulty: Number(clueDifficulty),
      favoriteMoment: favoriteMoment.trim(),
      suggestions: suggestions.trim(),
      user: {
        name: user.name,
        email: user.email,
        rollNo: user.rollNo || user.irisId,
      },
      submittedAt: new Date().toISOString(),
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="rounded-full bg-[#3d7a36]/15 p-4 text-[#2d6827]">
          <CheckCircle2 className="size-16 stroke-[1.75]" />
        </div>

        <div className="max-w-md">
          <h3 className="font-serif text-2xl font-bold text-[#201007]">
            Feedback Recorded!
          </h3>
          <p className="mt-2 font-serif text-sm leading-relaxed text-[#5c3418]">
            Your response has been saved for squad{" "}
            <strong>{teamName || defaultTeamName}</strong>. Thank you for making
            Hudukta Hudukata 2026 unforgettable!
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="mt-4 inline-flex items-center gap-2 border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-6 py-3 font-serif text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md cursor-pointer"
        >
          <Edit3 className="size-4" />
          Edit Your Response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Account Info Header (Google Forms style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-[#7a4823]/40 bg-[#fffdf9] p-4 shadow-sm rounded-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-bold text-[#1a0a03]">
              {user.email || user.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-[#8b261b] hover:underline cursor-pointer flex items-center gap-1"
            >
              <LogOut className="size-3" />
              Switch account
            </button>
          </div>
          <p className="text-[11px] text-[#5c3418] mt-0.5">
            Logged in as <strong>{user.name}</strong> ({user.rollNo || user.irisId}) &bull;{" "}
            <span className="font-bold text-[#7a4823]">
              {isLeader ? "👑 Squad Leader" : "⚔️ Squad Member"}
            </span>
          </p>
        </div>

        <div className="text-right sm:text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eedca8]/70 border border-[#7a4823]/40 text-[#4a2206] font-serif text-xs font-bold rounded-sm">
            <Users className="size-3.5" />
            {defaultTeamName}
          </span>
        </div>
      </div>

      <div className="text-xs font-serif font-semibold text-[#8b261b]">
        * Indicates required question
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 border-2 border-[#8b261b]/60 bg-[#fbf2ef] p-4 text-xs font-bold text-[#8b261b] shadow-sm rounded-sm">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Question 1: Team Name */}
      <div className="flex flex-col gap-2.5 bg-[#fffdf9] p-5 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
        <label
          htmlFor="teamName"
          className="font-serif text-sm font-bold text-[#201007]"
        >
          Team Name <span className="text-[#8b261b]">*</span>
        </label>
        <input
          id="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Your squad name"
          required
          className="w-full border-2 border-[#7a4823]/40 bg-white px-4 py-3 text-sm font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 rounded-sm"
        />
      </div>

      {/* Question 2: How did you like the Hudukta Hudukata event? (1 to 5) */}
      <div className="flex flex-col gap-3 bg-[#fffdf9] p-5 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
        <label className="font-serif text-sm font-bold text-[#201007]">
          How did you like the Hudukta Hudukata event? <span className="text-[#8b261b]">*</span>
        </label>

        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2">
          <span className="font-serif text-xs font-bold text-[#7a4823] hidden sm:inline">
            1 (Poor)
          </span>

          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <label
                key={val}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none"
              >
                <span className="font-serif text-xs font-bold text-[#4a2206] group-hover:text-[#8b261b]">
                  {val}
                </span>
                <input
                  type="radio"
                  name="eventRating"
                  value={val}
                  checked={eventRating === val}
                  onChange={() => setEventRating(val)}
                  className="size-5 accent-[#7a4823] cursor-pointer"
                />
              </label>
            ))}
          </div>

          <span className="font-serif text-xs font-bold text-[#7a4823] hidden sm:inline">
            5 (Loved it!)
          </span>
        </div>
      </div>

      {/* Question 3: How did you find the clues? (1 = Challenging to 5 = Easy) */}
      <div className="flex flex-col gap-3 bg-[#fffdf9] p-5 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
        <label className="font-serif text-sm font-bold text-[#201007]">
          How did you find the clues? <span className="text-[#8b261b]">*</span>
        </label>

        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2">
          <span className="font-serif text-xs font-bold text-[#7a4823]">
            Challenging
          </span>

          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <label
                key={val}
                className="flex flex-col items-center gap-2 cursor-pointer group select-none"
              >
                <span className="font-serif text-xs font-bold text-[#4a2206] group-hover:text-[#8b261b]">
                  {val}
                </span>
                <input
                  type="radio"
                  name="clueDifficulty"
                  value={val}
                  checked={clueDifficulty === val}
                  onChange={() => setClueDifficulty(val)}
                  className="size-5 accent-[#7a4823] cursor-pointer"
                />
              </label>
            ))}
          </div>

          <span className="font-serif text-xs font-bold text-[#7a4823]">
            Easy
          </span>
        </div>
      </div>

      {/* Question 4: Which clue/event moment did you enjoy the most? */}
      <div className="flex flex-col gap-2.5 bg-[#fffdf9] p-5 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
        <label
          htmlFor="favoriteMoment"
          className="font-serif text-sm font-bold text-[#201007]"
        >
          Which clue/event moment did you enjoy the most? <span className="text-[#8b261b]">*</span>
        </label>
        <textarea
          id="favoriteMoment"
          rows={3}
          value={favoriteMoment}
          onChange={(e) => setFavoriteMoment(e.target.value)}
          placeholder="Your answer"
          required
          className="w-full border-2 border-[#7a4823]/40 bg-white px-4 py-3 text-sm font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 rounded-sm"
        />
      </div>

      {/* Question 5: Any suggestions or feedback for the next Hudukta Hudukaa? */}
      <div className="flex flex-col gap-2.5 bg-[#fffdf9] p-5 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
        <label
          htmlFor="suggestions"
          className="font-serif text-sm font-bold text-[#201007]"
        >
          Any suggestions or feedback for the next Hudukta Hudukaa? <span className="text-[#8b261b]">*</span>
        </label>
        <textarea
          id="suggestions"
          rows={3}
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          placeholder="Your answer"
          required
          className="w-full border-2 border-[#7a4823]/40 bg-white px-4 py-3 text-sm font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 rounded-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] active:translate-y-0.5 text-[#f7eed6] py-4 px-6 font-serif text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-lg shadow-[#8b261b]/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-[#f7eed6]/40 border-t-[#f7eed6]"
            />
            Saving Response...
          </>
        ) : (
          <>
            <Send className="size-4" />
            {initialFeedback ? "Update Feedback" : "Submit Feedback"}
          </>
        )}
      </button>
    </form>
  );
}
