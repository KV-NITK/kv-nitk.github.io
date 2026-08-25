import React, { useState, useEffect } from "react";
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
import { RegisteredSquadCard } from "./RegisteredSquadCard";
import { IrisLoginNotice } from "./IrisLoginNotice";
import { TeamRegistrationForm } from "./TeamRegistrationForm";
import API_URL from "../../api/api";

// Maximum: Leader + Member 1 + Member 2 + Member 3 = 4 total
const MIN_TEAM_SIZE = 3;
const MAX_TEAM_SIZE = 4;
const MIN_MEMBERS = MIN_TEAM_SIZE - 1; // 2
const MAX_MEMBERS = MAX_TEAM_SIZE - 1; // 3

const createEmptyMember = () => ({
  id: Date.now() + Math.random(),
  name: "",
  rollNo: "",
  email: "",
});

const TeamRegistration = () => {
  const [user, setUser] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [members, setMembers] = useState([
    createEmptyMember(),
    createEmptyMember(),
  ]);

  const [loading, setLoading] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDeleteTeam = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your squad? All members will be unregistered and this action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingTeam(true);

    try {
      const response = await fetch(`${API_URL}/teams/my-team`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserTeam(null);
        setMessage(data.message || "Squad deleted successfully.");
        setIsSuccess(true);
      } else {
        alert(data.message || "Failed to delete team.");
      }
    } catch (error) {
      console.error("Delete team error:", error);
      alert("Failed to connect to server to delete team.");
    } finally {
      setDeletingTeam(false);
    }
  };

  // ==================================================
  // CHECK IRIS AUTHENTICATION
  // ==================================================
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          setUserTeam(null);
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);

          // Check if user belongs to a team (as leader or member)
          try {
            const teamRes = await fetch(`${API_URL}/teams/my-team`, {
              method: "GET",
              credentials: "include",
            });

            if (teamRes.ok) {
              const teamData = await teamRes.json();
              if (teamData.success && teamData.team) {
                setUserTeam(teamData.team);
              }
            }
          } catch (tErr) {
            console.error("Failed to check user team:", tErr);
          }
        } else {
          setUser(null);
          setUserTeam(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        setUserTeam(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  // ==================================================
  // IRIS LOGIN & LOGOUT
  // ==================================================
  const handleIrisLogin = () => {
    window.location.href = `${API_URL}/auth/iris`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setUserTeam(null);
      setMessage("");
      setIsSuccess(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ==================================================
  // MEMBER MANAGEMENT
  // ==================================================
  const handleMemberChange = (id, field, value) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((currentMembers) => [...currentMembers, createEmptyMember()]);
  };

  const removeMember = (id) => {
    if (members.length <= MIN_MEMBERS) return;
    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== id)
    );
  };

  // ==================================================
  // TEAM REGISTRATION SUBMISSION
  // ==================================================
  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (members.length < MIN_MEMBERS) {
      setMessage(`A minimum of ${MIN_TEAM_SIZE} members including the leader is required.`);
      return;
    }

    if (members.length > MAX_MEMBERS) {
      setMessage(`A maximum of ${MAX_TEAM_SIZE} members including the leader is allowed.`);
      return;
    }


    const invalidRollNo = members.find(
      (member) => !/^26/.test(member.rollNo.trim().toUpperCase())
    );

    if (invalidRollNo) {
      setMessage("Roll numbers must start with 26.");
      return;
    }

    const rollNumbers = members.map((member) => member.rollNo.trim().toUpperCase());
    if (new Set(rollNumbers).size !== rollNumbers.length) {
      setMessage("Duplicate roll numbers are not allowed.");
      return;
    }

    const emails = members
      .map((member) => (member.email ? member.email.trim().toLowerCase() : ""))
      .filter((e) => e.length > 0);

    if (new Set(emails).size !== emails.length) {
      setMessage("Duplicate member email addresses are not allowed.");
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
            rollNo: member.rollNo.trim().toUpperCase(),
            email: member.email ? member.email.trim().toLowerCase() : "",
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.message || "Registration failed.";
        if (data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
          errorMsg += ` Email(s): ${data.emails.join(", ")}`;
        }
        if (data.rollNumbers && Array.isArray(data.rollNumbers) && data.rollNumbers.length > 0) {
          errorMsg += ` Roll number(s): ${data.rollNumbers.join(", ")}`;
        }
        setMessage(errorMsg);
        return;
      }

      setIsSuccess(true);
      setMessage(data.message || "Team registered successfully.");

      // Refresh team data right after registration
      try {
        const teamRes = await fetch(`${API_URL}/teams/my-team`, {
          method: "GET",
          credentials: "include",
        });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          if (teamData.success && teamData.team) {
            setUserTeam(teamData.team);
          }
        }
      } catch (tErr) {
        console.error("Failed to refresh team data:", tErr);
      }
    } catch (error) {
      console.error("Team registration error:", error);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
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
          Verifying IRIS Credentials...
        </p>
      </div>
    );
  } else if (!user) {
    content = <IrisLoginNotice handleIrisLogin={handleIrisLogin} />;
  } else if (userTeam) {
    content = (
      <RegisteredSquadCard
        userTeam={userTeam}
        user={user}
        handleLogout={handleLogout}
        handleDeleteTeam={handleDeleteTeam}
        deletingTeam={deletingTeam}
      />
    );
  } else {
    content = (
      <TeamRegistrationForm
        user={user}
        handleLogout={handleLogout}
        teamName={teamName}
        setTeamName={setTeamName}
        password={password}
        setPassword={setPassword}
        members={members}
        handleMemberChange={handleMemberChange}
        addMember={addMember}
        removeMember={removeMember}
        handleRegister={handleRegister}
        loading={loading}
        message={message}
        isSuccess={isSuccess}
        maxMembers={MAX_MEMBERS}
        minMembers={MIN_MEMBERS}
        maxTeamSize={MAX_TEAM_SIZE}
      />
    );
  }

  // ==================================================
  // PAGE RENDER
  // ==================================================
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

      {/* Treasure hunt props */}
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

      {/* Main */}
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

export default TeamRegistration;