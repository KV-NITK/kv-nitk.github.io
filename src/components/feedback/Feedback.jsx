import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MetaData from "../MetaData/MetaData.jsx";
import { SiteHeader } from "../HH2026/site-header";
import { Plaque, DiamondBand, Rivets } from "../HH2026/ornaments";
import {
  Revolver,
  TreasureChest,
  Coin,
  Key,
  CompassRose,
  Roam,
  TornEdgeDefs,
  Rope,
} from "../HH2026/roaming-assets";
import { IrisLoginNotice } from "../team-registration/IrisLoginNotice";
import { FeedbackForm } from "./FeedbackForm";
import API_URL from "../../api/api";
import { Users, UserX, ArrowRight, LogOut, CheckCircle2, Edit3, Star } from "lucide-react";

const Feedback = () => {
  const [user, setUser] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ==================================================
  // CHECK IRIS AUTHENTICATION, SQUAD & SUBMISSION STATUS
  // ==================================================
  useEffect(() => {
    const checkAuthenticationAndTeam = async () => {
      try {
        const authResponse = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!authResponse.ok) {
          setUser(null);
          setUserTeam(null);
          setExistingFeedback(null);
          return;
        }

        const authData = await authResponse.json();

        if (authData.success && authData.user) {
          setUser(authData.user);

          // 1. Check if user belongs to a team (leader or member)
          try {
            const teamRes = await fetch(`${API_URL}/teams/my-team`, {
              method: "GET",
              credentials: "include",
            });

            if (teamRes.ok) {
              const teamData = await teamRes.json();
              if (teamData.success && teamData.team) {
                setUserTeam(teamData.team);
              } else {
                setUserTeam(null);
              }
            } else {
              setUserTeam(null);
            }
          } catch (tErr) {
            console.error("Failed to check user team:", tErr);
            setUserTeam(null);
          }

          // 2. Check if this individual member has already submitted feedback
          try {
            const feedbackRes = await fetch(`${API_URL}/feedback/me`, {
              method: "GET",
              credentials: "include",
            });

            if (feedbackRes.ok) {
              const feedbackData = await feedbackRes.json();
              if (feedbackData.success && feedbackData.feedback) {
                setExistingFeedback(feedbackData.feedback);
              }
            }
          } catch (fErr) {
            console.error("Failed to check existing feedback:", fErr);
          }
        } else {
          setUser(null);
          setUserTeam(null);
          setExistingFeedback(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        setUserTeam(null);
        setExistingFeedback(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthenticationAndTeam();
  }, []);

  // ==================================================
  // IRIS LOGIN & LOGOUT
  // ==================================================
  const handleIrisLogin = () => {
    window.location.href = `${API_URL}/auth/iris?redirect=/feedback`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setUserTeam(null);
      setExistingFeedback(null);
      setIsSubmitted(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ==================================================
  // FEEDBACK SUBMISSION
  // ==================================================
  const handleSubmitFeedback = async (formData) => {
    setLoading(true);

    try {
      // 1. Post to backend API (persists in Supabase event_feedback)
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback.");
      }

      setExistingFeedback(data.feedback || formData);
      setIsSubmitted(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      // Fallback
      setExistingFeedback(formData);
      setIsSubmitted(true);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setIsEditing(true);
  };

  // ==================================================
  // RENDER FORM CONTENT
  // ==================================================
  let content;

  if (checkingAuth) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-full border-3 border-[#7a4823]/30 border-t-[#7a4823]"
        />
        <p className="font-serif text-sm font-bold tracking-[0.24em] text-[#4a2206] uppercase">
          Verifying IRIS & Squad Membership...
        </p>
      </div>
    );
  } else if (!user) {
    content = (
      <IrisLoginNotice
        handleIrisLogin={handleIrisLogin}
        message="Login with your NITK IRIS account to submit your event feedback and ratings."
      />
    );
  } else if (!userTeam) {
    content = (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="rounded-full bg-[#8b261b]/15 p-5 text-[#8b261b]">
          <UserX className="size-14 stroke-[1.75]" />
        </div>

        {/* User bar */}
        <div className="w-full border-2 border-[#7a4823]/30 bg-[#fffdf9] p-4 text-left shadow-sm rounded-sm">
          <p className="font-serif text-xs font-bold tracking-[0.16em] text-[#7a4823] uppercase">
            Logged In As
          </p>
          <p className="mt-0.5 font-serif text-base font-bold text-[#1a0a03]">
            {user.name} ({user.rollNo || user.irisId})
          </p>
          <p className="text-xs text-[#5c3418]">{user.email}</p>
        </div>

        <div className="max-w-md">
          <h3 className="font-serif text-2xl font-bold text-[#201007]">
            No Registered Squad Found
          </h3>
          <p className="mt-2 font-serif text-sm leading-relaxed text-[#5c3418]">
            Feedback submission is reserved for participants who are part of a registered squad (as a <strong>Squad Leader</strong> or <strong>Team Member</strong>).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
          <Link
            to="/team-registration"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-7 py-3.5 font-serif text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md cursor-pointer"
          >
            <Users className="size-4" />
            Register Your Squad
            <ArrowRight className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#7a4823]/60 bg-[#eedca8]/60 px-5 py-3.5 font-serif text-xs font-bold tracking-wider text-[#4a2206] uppercase hover:bg-[#7a4823] hover:text-[#fffdf9] transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="size-3.5" />
            Logout IRIS
          </button>
        </div>
      </div>
    );
  } else if (existingFeedback && !isEditing && !isSubmitted) {
    // Show already submitted response view with option to edit
    const isLeader = userTeam?.role === "leader";
    content = (
      <div className="flex flex-col gap-6">
        {/* User bar */}
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
              {userTeam?.teamName || userTeam?.team_name}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 py-4 text-center border-2 border-[#3d7a36]/30 bg-[#f4fbf3] p-6 rounded-sm">
          <CheckCircle2 className="size-12 text-[#2d6827]" />
          <h3 className="font-serif text-xl font-bold text-[#1a0a03]">
            You have already submitted your response
          </h3>
          <p className="max-w-md font-serif text-xs leading-relaxed text-[#3d5a36]">
            Each squad member can submit individual feedback. Your response has been safely stored in Supabase.
          </p>
        </div>

        {/* Existing response summary */}
        <div className="flex flex-col gap-4 bg-[#fffdf9] p-6 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
          <div className="border-b border-[#7a4823]/20 pb-3">
            <p className="font-serif text-xs font-bold tracking-[0.16em] text-[#7a4823] uppercase">
              How did you like the Hudukta Hudukata event?
            </p>
            <p className="mt-1 font-serif text-sm font-bold text-[#1a0a03]">
              ⭐ {existingFeedback.event_rating || existingFeedback.eventRating} / 5
            </p>
          </div>

          <div className="border-b border-[#7a4823]/20 pb-3">
            <p className="font-serif text-xs font-bold tracking-[0.16em] text-[#7a4823] uppercase">
              How did you find the clues?
            </p>
            <p className="mt-1 font-serif text-sm font-bold text-[#1a0a03]">
              {existingFeedback.clue_difficulty || existingFeedback.clueDifficulty} / 5{" "}
              <span className="text-xs text-[#5c3418]">
                ({(existingFeedback.clue_difficulty || existingFeedback.clueDifficulty) <= 2 ? "Challenging" : (existingFeedback.clue_difficulty || existingFeedback.clueDifficulty) >= 4 ? "Easy" : "Balanced"})
              </span>
            </p>
          </div>

          <div className="border-b border-[#7a4823]/20 pb-3">
            <p className="font-serif text-xs font-bold tracking-[0.16em] text-[#7a4823] uppercase">
              Favorite clue / event moment
            </p>
            <p className="mt-1 text-sm font-medium text-[#1a0a03] whitespace-pre-wrap">
              {existingFeedback.favorite_moment || existingFeedback.favoriteMoment}
            </p>
          </div>

          <div>
            <p className="font-serif text-xs font-bold tracking-[0.16em] text-[#7a4823] uppercase">
              Suggestions or feedback for next edition
            </p>
            <p className="mt-1 text-sm font-medium text-[#1a0a03] whitespace-pre-wrap">
              {existingFeedback.suggestions}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center justify-center gap-2 border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] py-3.5 px-6 font-serif text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md cursor-pointer"
        >
          <Edit3 className="size-4" />
          Edit Your Response
        </button>
      </div>
    );
  } else {
    content = (
      <FeedbackForm
        user={user}
        userTeam={userTeam}
        handleLogout={handleLogout}
        onSubmit={handleSubmitFeedback}
        loading={loading}
        isSubmitted={isSubmitted}
        resetForm={resetForm}
        initialFeedback={existingFeedback}
      />
    );
  }

  // ==================================================
  // PAGE RENDER
  // ==================================================
  return (
    <div className="hh2026-page relative min-h-screen bg-parchment text-foreground antialiased overflow-hidden">
      <MetaData title="Hudukta Hudukata - Event Feedback" />
      <TornEdgeDefs />
      <SiteHeader />

      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-144 w-xl -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />

      {/* Roaming Assets */}
      <Roam
        className="hidden w-72 md:block md:top-28 md:right-[2%] lg:w-96 lg:right-[4%] xl:w-[26rem]"
        motion="float"
        duration="8.5s"
      >
        <Revolver className="-rotate-[18deg] drop-shadow-[0_22px_20px_oklch(0_0_0/65%)]" />
      </Roam>

      <Roam
        className="hidden w-64 md:block md:bottom-28 md:left-[1%] lg:w-80 lg:left-[3%]"
        motion="sway"
        duration="7.5s"
        delay="1s"
      >
        <Revolver className="scale-x-[-1] rotate-[14deg] opacity-90 drop-shadow-[0_18px_16px_oklch(0_0_0/60%)]" />
      </Roam>

      <Roam
        className="hidden w-44 md:block md:top-24 md:left-[2%] lg:w-56 lg:left-[4%]"
        motion="float"
        duration="7s"
        delay="0.5s"
      >
        <TreasureChest className="rotate-[-6deg] drop-shadow-[0_20px_18px_oklch(0_0_0/60%)]" />
      </Roam>

      <Roam
        className="hidden md:block top-1/2 -right-6 w-20 lg:w-24 lg:right-[3%]"
        motion="sway"
        duration="5.5s"
        delay="1.2s"
      >
        <Coin className="drop-shadow-[0_10px_10px_oklch(0_0_0/50%)]" />
      </Roam>

      <Roam
        className="hidden md:block bottom-1/3 -left-4 w-16 lg:w-20 lg:left-[3%]"
        motion="float"
        duration="6s"
        delay="0.8s"
      >
        <Coin className="drop-shadow-[0_10px_10px_oklch(0_0_0/50%)]" />
      </Roam>

      <Roam
        className="hidden md:block bottom-16 right-[10%] w-28 lg:w-36"
        motion="float"
        duration="8s"
        delay="1.5s"
      >
        <Key className="rotate-[25deg] opacity-85 drop-shadow-[0_12px_12px_oklch(0_0_0/50%)]" />
      </Roam>

      <CompassRose className="pointer-events-none absolute top-1/2 left-1/2 w-[750px] max-w-none -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-15" />

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12 lg:py-20">
        <Plaque
          eyebrow="Participant Debrief"
          title="Hudukta Hudukata - Event Feedback"
          className="mx-auto items-center text-center"
        />

        <p className="mx-auto mt-4 max-w-xl text-center text-base sm:text-lg leading-relaxed text-muted-foreground text-pretty font-serif">
          Exclusively for registered hunters and squad leaders of Hudugata Hudakata 2026.
        </p>

        <DiamondBand className="my-8" />

        {/* ONE BIG PAPER CONTAINER */}
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="relative border-2 border-primary/50 bg-wood p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-sm">
            <Rope className="absolute -top-6 right-8 left-8 h-9 animate-sway" />
            <Rivets count={11} className="px-2 pb-3 pt-1" />

            <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-6 sm:p-10 shadow-inner text-[#2b1810]">
              {content}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
