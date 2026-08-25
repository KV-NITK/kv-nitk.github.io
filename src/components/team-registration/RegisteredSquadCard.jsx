import React from "react";
import { Link } from "react-router-dom";

export function WhatsAppGroupBanner() {
  return (
    <div className="border-2 border-emerald-700/60 bg-emerald-950/15 p-5 rounded-sm shadow-md text-center flex flex-col items-center gap-3 my-2">
      <div className="flex items-center justify-center gap-2 text-emerald-900 font-serif font-bold text-base sm:text-lg">
        <svg className="w-6 h-6 fill-current text-emerald-700 shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span>Join Official HH2026 WhatsApp Group</span>
      </div>
      <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed max-w-md">
        Mandatory for all registered hunters! Stay updated on event announcements, live clue drops, and Round 1 instructions.
      </p>
      <a
        href="https://chat.whatsapp.com/EqzxIHeU7Ol9AYZcfbFSUW?s=sw&p=a&ilr=1"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-serif text-xs sm:text-sm font-bold tracking-wider uppercase px-6 py-3 rounded shadow-md transition-all transform hover:scale-105"
      >
        <span>Join WhatsApp Group</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </div>
  );
}

export function RegisteredSquadCard({
  userTeam,
  user,
  handleLogout,
  handleDeleteTeam,
  deletingTeam,
}) {
  if (!userTeam) return null;

  const isLeader = userTeam.role === "leader";

  return (
    <div className="flex flex-col gap-6">
      {/* Header / Plaque */}
      <div className="border-b-2 border-[#8b5a2b]/30 pb-4 text-center">
        <span className="inline-block rounded-full bg-[#8b261b] px-4 py-1 font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#f7eed6] shadow-sm">
          {isLeader ? "Squad Leader" : "Squad Member"}
        </span>
        <h2 className="mt-3 font-serif text-2xl sm:text-4xl font-black uppercase text-[#2b1810] tracking-wide">
          {userTeam.teamName}
        </h2>
        <p className="mt-2 font-serif text-xs sm:text-sm tracking-wider text-[#7a4823]">
          STATUS:{" "}
          <span className="font-bold text-emerald-800 uppercase bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-800/30">
            {userTeam.status || "REGISTERED"}
          </span>
        </p>
      </div>

      {/* Notice */}
      <div className="border border-amber-900/30 bg-amber-900/10 p-4 text-center font-serif text-xs sm:text-sm text-[#4a2206] rounded-sm leading-relaxed">
        🏴‍☠️ <strong>Registration Confirmed!</strong> You are registered for{" "}
        <strong>Hudugata Hudakata 2026</strong>. Below are your official squad details.
      </div>

      {/* WhatsApp Group Join Banner (Always visible after registration / re-checking) */}
      <WhatsAppGroupBanner />

      {/* Squad Leader Info */}
      <div className="border-2 border-[#7a4823]/40 bg-[#fffdf9] p-5 rounded-sm shadow-sm">
        <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-[#7a4823] border-b border-[#7a4823]/20 pb-2 flex items-center justify-between">
          <span>Squad Leader</span>
          {isLeader && (
            <span className="font-mono text-xs font-bold text-[#8b261b] bg-[#8b261b]/10 px-2 py-0.5 rounded border border-[#8b261b]/30 uppercase">
              (You)
            </span>
          )}
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#2b1810]">
          <div>
            <span className="font-serif text-xs text-[#7a4823]/80 block uppercase tracking-wider">
              Leader Name
            </span>
            <strong className="font-serif text-base font-bold text-[#1a0a03]">
              {userTeam.leader?.name || (isLeader ? user?.name : "Squad Leader")}
            </strong>
          </div>

          <div>
            <span className="font-serif text-xs text-[#7a4823]/80 block uppercase tracking-wider">
              Roll No / IRIS ID
            </span>
            <strong className="font-mono text-base">
              {userTeam.leader?.rollNo || userTeam.leader?.irisId}
            </strong>
          </div>

          {(userTeam.leader?.email || (isLeader && user?.email)) && (
            <div className="sm:col-span-2">
              <span className="font-serif text-xs text-[#7a4823]/80 block uppercase tracking-wider">
                Leader Email
              </span>
              <span className="text-xs text-[#5c3418]">
                {userTeam.leader?.email || (isLeader ? user?.email : "")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Squad Members */}
      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-[#7a4823] border-b border-[#7a4823]/20 pb-2">
          Squad Members ({userTeam.members?.length + 1 || 1} Total Hunters)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {userTeam.members?.map((member, index) => {
            const isCurrentUser =
              user?.email?.toLowerCase() === member.email?.toLowerCase() ||
              (user?.rollNo &&
                user.rollNo.toUpperCase() === member.roll_no?.toUpperCase());

            return (
              <div
                key={member.id || index}
                className="border-2 border-[#7a4823]/30 bg-[#fffdf9] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 rounded-sm shadow-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-[0.65rem] font-bold tracking-[0.2em] text-[#8b261b] uppercase">
                      Hunter #{index + 2}
                    </span>
                    {isCurrentUser && (
                      <span className="font-mono text-[0.65rem] font-bold text-[#8b261b] bg-[#8b261b]/15 px-2 py-0.5 rounded border border-[#8b261b]/30 uppercase">
                        (You)
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-base font-bold text-[#1a0a03]">
                    {member.name}
                  </p>
                  {member.email && !member.email.endsWith("@noemail.local") && (
                    <p className="text-xs text-[#5c3418]">{member.email}</p>
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-[#4a2206] bg-[#eedca8] px-3 py-1 rounded border border-[#7a4823]/30">
                  {member.roll_no}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#8b5a2b]/30">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full border-2 border-[#7a4823] bg-[#7a4823] text-[#fffdf9] hover:bg-[#4a2206] px-6 py-3 font-serif text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all shadow-sm cursor-pointer"
        >
          Switch Account
        </button>

        {isLeader && (
          <button
            type="button"
            disabled={deletingTeam}
            onClick={handleDeleteTeam}
            className="w-full border-2 border-[#8b261b] bg-[#8b261b] text-[#f7eed6] hover:bg-[#6e1e15] px-6 py-3 font-serif text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {deletingTeam ? "Deleting..." : "Delete Squad"}
          </button>
        )}

        <Link
          to="/list-of-members"
          className="w-full text-center border-2 border-[#7a4823] bg-[#eedca8] text-[#4a2206] hover:bg-[#7a4823] hover:text-[#fffdf9] px-6 py-3 font-serif text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          View Registered Squads 📋
        </Link>

        <Link
          to="/hh-2026"
          className="w-full text-center border-2 border-[#4a2206] bg-[#4a2206] text-[#f7eed6] hover:bg-[#2b1810] px-6 py-3 font-serif text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          Back to Event Rules
        </Link>
      </div>
    </div>
  );
}
