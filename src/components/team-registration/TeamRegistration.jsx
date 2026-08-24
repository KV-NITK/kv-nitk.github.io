import { useEffect, useState } from "react";
import MetaData from "../MetaData/MetaData";
import {
  TornEdgeDefs,
  Rope,
  Revolver,
  TreasureChest,
  Coin,
  CompassRose,
  Key,
  Roam,
} from "../HH2026/roaming-assets";
import { SiteHeader } from "../HH2026/site-header";
import { SiteFooter } from "../HH2026/site-footer";
import { Plaque, DiamondBand, Rivets, CrossedFlintlocks } from "../HH2026/ornaments";
import { cn } from "../../lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Total team size, INCLUDING the leader
const MIN_TEAM_SIZE = 3;
const MAX_TEAM_SIZE = 4;

// Therefore, other members = 2 to 3
const MIN_MEMBERS = MIN_TEAM_SIZE - 1;
const MAX_MEMBERS = MAX_TEAM_SIZE - 1;

let memberIdCounter = 0;
const createEmptyMember = () => ({
  id: `member-${Date.now()}-${memberIdCounter++}`,
  name: "",
  email: "",
});

const TeamRegistration = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");

  // Start with minimum team size:
  // 1 leader + 2 members = 3 total
  const [members, setMembers] = useState([
    createEmptyMember(),
    createEmptyMember(),
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // --------------------------------------------------
  // Check IRIS authentication
  // --------------------------------------------------

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  // --------------------------------------------------
  // IRIS Login
  // --------------------------------------------------

  const handleIrisLogin = () => {
    window.location.href = `${API_URL}/auth/iris`;
  };

  // --------------------------------------------------
  // IRIS Logout
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setMessage("");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --------------------------------------------------
  // Member changes
  // --------------------------------------------------

  const handleMemberChange = (id, field, value) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === id
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    );
  };

  // --------------------------------------------------
  // Add member
  // --------------------------------------------------

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) {
      return;
    }

    setMembers((currentMembers) => [
      ...currentMembers,
      createEmptyMember(),
    ]);
  };

  // --------------------------------------------------
  // Remove member
  // --------------------------------------------------

  const removeMember = (id) => {
    if (members.length <= MIN_MEMBERS) {
      return;
    }

    setMembers((currentMembers) =>
      currentMembers.filter(
        (member) => member.id !== id
      )
    );
  };

  // --------------------------------------------------
  // Team registration
  // --------------------------------------------------

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    // Frontend validation
    if (members.length < MIN_MEMBERS) {
      setMessage(
        `A minimum of ${MIN_TEAM_SIZE} members including the leader is required.`
      );
      return;
    }

    if (members.length > MAX_MEMBERS) {
      setMessage(
        `A maximum of ${MAX_TEAM_SIZE} members including the leader is allowed.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/teams/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          password,
          members: members.map((member) => ({
            name: member.name.trim(),
            email: member.email.trim().toLowerCase(),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.message || "Team registration failed.";
        if (data.errors && typeof data.errors === "object") {
          const fieldErrors = Object.values(data.errors)
            .flat()
            .filter(Boolean)
            .join(". ");
          if (fieldErrors) {
            errorMsg += `: ${fieldErrors}`;
          }
        } else if (data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
          errorMsg += `: ${data.emails.join(", ")}`;
        }
        setMessage(errorMsg);
        return;
      }

      setIsSuccess(true);
      setMessage(
        data.message || "Team registered successfully."
      );
    } catch (error) {
      console.error("Team registration error:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Render Form Content
  // --------------------------------------------------

  let content;

  if (checkingAuth) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-full border-3 border-[#7a4823]/30 border-t-[#7a4823]"
        />
        <p className="font-serif text-sm font-bold tracking-[0.24em] text-[#4a2206] uppercase">
          Verifying IRIS Credentials...
        </p>
      </div>
    );
  } else if (!user) {
    content = (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <CrossedFlintlocks className="w-16 text-[#7a4823]" />
        <p className="max-w-md font-serif text-lg font-semibold leading-relaxed text-[#3d1e0b]">
          Login with your NITK IRIS account to claim your squad&apos;s spot in the hunt.
        </p>
        <button
          type="button"
          onClick={handleIrisLogin}
          className="border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-9 py-4 font-serif text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-lg shadow-[#8b261b]/30 cursor-pointer"
        >
          Login with IRIS
        </button>
      </div>
    );
  } else {
    content = (
      <form onSubmit={handleRegister} className="flex flex-col gap-8">
        {/* Squad Leader information box (from IRIS) */}
        <div className="relative border-2 border-[#7a4823]/40 bg-[#ebd9b2]/70 p-5 sm:p-6 rounded-sm shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#7a4823]/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#8b261b] shadow-[0_0_8px_rgba(139,38,27,0.6)]" />
              <h3 className="font-serif text-sm sm:text-base font-bold tracking-[0.18em] text-[#3d1e0b] uppercase">
                Squad Leader (IRIS Account)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="font-serif text-xs font-bold tracking-[0.18em] text-[#8b261b] hover:text-[#5a160f] uppercase underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              Change Account
            </button>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="font-serif text-[0.65rem] font-bold tracking-[0.2em] text-[#6e3c1b] uppercase">
                Leader Name
              </dt>
              <dd className="font-serif text-base font-bold text-[#1a0a03]">
                {user.name}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-serif text-[0.65rem] font-bold tracking-[0.2em] text-[#6e3c1b] uppercase">
                Roll Number
              </dt>
              <dd className="font-serif text-base font-bold text-[#1a0a03]">
                {user.rollNo}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-serif text-[0.65rem] font-bold tracking-[0.2em] text-[#6e3c1b] uppercase">
                IRIS Email
              </dt>
              <dd className="font-serif text-base font-bold text-[#1a0a03] break-all">
                {user.email}
              </dd>
            </div>
          </dl>
        </div>

        {/* Team Details Section */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Team Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="team-name" className="font-serif text-xs sm:text-sm font-bold tracking-[0.16em] text-[#3d1e0b] uppercase">
              Team Name <span className="text-[#8b261b]">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g. Amaravathi Hunters"
              required
              className="w-full border-2 border-[#7a4823]/50 bg-[#fffdf9] px-4 py-3 text-base sm:text-lg font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
            />
          </div>

          {/* Team Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="team-password" className="font-serif text-xs sm:text-sm font-bold tracking-[0.16em] text-[#3d1e0b] uppercase">
              Team Password <span className="text-[#8b261b]">*</span>
            </label>
            <input
              id="team-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create team password"
              required
              className="w-full border-2 border-[#7a4823]/50 bg-[#fffdf9] px-4 py-3 text-base sm:text-lg font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
            />
          </div>
        </div>

        {/* Squad Members Section (inside the single big paper) */}
        <div className="flex flex-col gap-5 border-t-2 border-dashed border-[#7a4823]/30 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-[0.06em] text-[#2b1810] uppercase">
                Squad Members
              </h3>
              <p className="font-serif text-xs text-[#6e3c1b] font-medium mt-1">
                Add {MIN_MEMBERS} to {MAX_MEMBERS} other hunters. Total squad size must be 3–4.
              </p>
            </div>
            <span className="border border-[#7a4823]/40 bg-[#ebd9b2] px-3.5 py-1.5 font-serif text-xs font-bold tracking-[0.18em] text-[#3d1e0b] uppercase rounded-sm">
              {members.length + 1} / {MAX_TEAM_SIZE} Hunters
            </span>
          </div>

          {/* List of Member Fields stacked on the paper */}
          <div className="flex flex-col gap-6 mt-2">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="relative border border-[#7a4823]/30 bg-[#f9f3e5]/90 p-5 sm:p-6 rounded-sm shadow-sm transition-all hover:border-[#7a4823]/60"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#7a4823]/20 pb-3 mb-4">
                  <span className="font-serif text-xs sm:text-sm font-bold tracking-[0.2em] text-[#8b261b] uppercase flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#7a4823]" />
                    Member {index + 1}
                  </span>
                  {members.length > MIN_MEMBERS && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="font-serif text-xs font-bold tracking-[0.18em] text-[#8b261b] hover:text-[#5a160f] uppercase underline decoration-dotted underline-offset-4 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`member-name-${member.id}`}
                      className="font-serif text-xs font-bold tracking-[0.16em] text-[#3d1e0b] uppercase"
                    >
                      Full Name <span className="text-[#8b261b]">*</span>
                    </label>
                    <input
                      id={`member-name-${member.id}`}
                      type="text"
                      value={member.name}
                      onChange={(event) =>
                        handleMemberChange(member.id, "name", event.target.value)
                      }
                      placeholder="Enter hunter's full name"
                      required
                      className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-2.5 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`member-email-${member.id}`}
                      className="font-serif text-xs font-bold tracking-[0.16em] text-[#3d1e0b] uppercase"
                    >
                      Email Address <span className="text-[#8b261b]">*</span>
                    </label>
                    <input
                      id={`member-email-${member.id}`}
                      type="email"
                      value={member.email}
                      onChange={(event) =>
                        handleMemberChange(member.id, "email", event.target.value)
                      }
                      placeholder="Enter email address"
                      required
                      className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-2.5 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {members.length < MAX_MEMBERS && (
            <button
              type="button"
              onClick={addMember}
              className="mt-2 w-full sm:w-auto border-2 border-dashed border-[#7a4823] bg-[#eedca8]/70 px-6 py-3.5 font-serif text-xs sm:text-sm font-bold tracking-[0.2em] text-[#4a2206] uppercase transition-all hover:bg-[#7a4823] hover:text-[#fffdf9] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              + Add Squad Member ({members.length + 1}/{MAX_TEAM_SIZE})
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="clip-torn relative mt-4 w-full border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-9 py-5 font-serif text-base sm:text-lg font-black tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#8b261b]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registering Squad..." : "REGISTER SQUAD NOW"}
        </button>

        {message && (
          <div
            className={cn(
              'border-2 p-5 font-serif text-sm font-bold leading-relaxed text-center rounded-sm',
              isSuccess
                ? 'border-emerald-700/60 bg-emerald-950/20 text-emerald-900'
                : 'border-[#8b261b] bg-[#8b261b]/15 text-[#6e1e15]',
            )}
          >
            {message}
          </div>
        )}
      </form>
    );
  }

  return (
    <div className="hh2026-page relative min-h-screen bg-parchment text-foreground antialiased overflow-hidden">
      <MetaData title="Register Your Squad — Hudugata Hudakata 2026" />
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

      {/* Roaming treasure hunt props (gun, treasure chest, coins, compass, key) */}
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

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12 lg:py-20">
        <Plaque
          eyebrow="Squad Registration"
          title="Claim Your Squad's Place in the Hunt"
          className="mx-auto items-center text-center"
        />
        <p className="mx-auto mt-4 max-w-xl text-center text-base sm:text-lg leading-relaxed text-muted-foreground text-pretty font-serif">
          Squads of 3 to 4. One entry. No second attempt.
        </p>

        <DiamondBand className="my-8" />

        {/* ONE BIG PAPER CONTAINER FOR THE ENTIRE FORM */}
        <div className="relative mx-auto w-full max-w-3xl">
          {/* Wood board outer frame */}
          <div className="relative border-2 border-primary/50 bg-wood p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-sm">
            <Rope className="absolute -top-6 right-8 left-8 h-9 animate-sway" />
            <Rivets count={11} className="px-2 pb-3 pt-1" />

            {/* The grand parchment paper sheet */}
            <div className="relative border-2 border-[#8b5a2b]/40 bg-[#f7eed6] p-6 sm:p-10 shadow-inner text-[#2b1810]">
              {content}
            </div>

            <Rivets count={11} className="px-2 pt-3 pb-1" />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default TeamRegistration;

