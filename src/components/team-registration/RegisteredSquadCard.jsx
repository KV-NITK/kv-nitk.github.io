import React from "react";
import { Link } from "react-router-dom";

export function RegisteredSquadCard({ userTeam, user, handleLogout, handleDeleteTeam, deletingTeam }) {
  if (!userTeam) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header / Plaque */}
      <div className="border-b-2 border-[#8b5a2b]/30 pb-4 text-center">
        <span className="inline-block rounded-full bg-[#8b261b] px-4 py-1 font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#f7eed6] shadow-sm">
          {userTeam.role === "leader" ? "👑 Squad Leader" : "⚔️ Squad Member"}
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

      {/* Squad Leader Info */}
      <div className="border-2 border-[#7a4823]/40 bg-[#fffdf9] p-5 rounded-sm shadow-sm">
        <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-[#7a4823] border-b border-[#7a4823]/20 pb-2">
          Squad Leader Details
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#2b1810]">
          <div>
            <span className="font-serif text-xs text-[#7a4823]/80 block uppercase tracking-wider">
              IRIS ID / Roll No
            </span>
            <strong className="font-mono text-base">
              {userTeam.leader?.rollNo || userTeam.leader?.irisId}
            </strong>
          </div>
          <div>
            <span className="font-serif text-xs text-[#7a4823]/80 block uppercase tracking-wider">
              Current Account
            </span>
            <strong className="font-sans text-base">
              {user?.name || "IRIS Leader"} ({user?.email})
            </strong>
          </div>
        </div>
      </div>

      {/* Squad Members */}
      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-[#7a4823] border-b border-[#7a4823]/20 pb-2">
          Squad Members ({userTeam.members?.length + 1 || 1} Total Hunters)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {userTeam.members?.map((member, index) => (
            <div
              key={member.id || index}
              className="border-2 border-[#7a4823]/30 bg-[#fffdf9] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 rounded-sm shadow-sm"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-serif text-[0.65rem] font-bold tracking-[0.2em] text-[#8b261b] uppercase">
                  Hunter #{index + 2}
                </span>
                <p className="font-serif text-base font-bold text-[#1a0a03]">
                  {member.name}
                </p>
                <p className="text-xs text-[#5c3418]">{member.email}</p>
              </div>
              <div className="font-mono text-xs font-bold text-[#4a2206] bg-[#eedca8] px-3 py-1 rounded border border-[#7a4823]/30">
                {member.roll_no}
              </div>
            </div>
          ))}
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

        {userTeam.role === "leader" && (
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
          to="/hh-2026"
          className="w-full text-center border-2 border-[#4a2206] bg-[#4a2206] text-[#f7eed6] hover:bg-[#2b1810] px-6 py-3 font-serif text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          Back to Event Rules
        </Link>
      </div>
    </div>
  );
}
