import React from "react";
import { cn } from "../../lib/utils";
import { MemberInputField } from "./MemberInputField";

export function TeamRegistrationForm({
  user,
  handleLogout,
  teamName,
  setTeamName,
  password,
  setPassword,
  members,
  handleMemberChange,
  addMember,
  removeMember,
  handleRegister,
  loading,
  message,
  isSuccess,
  maxMembers,
  minMembers,
  maxTeamSize,
}) {
  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-8">
      {/* Logged in Leader Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[#7a4823]/40 bg-[#fffdf9] p-5 shadow-sm rounded-sm">
        <div>
          <p className="font-serif text-xs font-bold tracking-[0.2em] text-[#7a4823] uppercase">
            Logged in as Squad Leader
          </p>
          <p className="mt-1 font-serif text-lg font-bold text-[#1a0a03]">
            {user.name}
          </p>
          <p className="text-xs font-medium text-[#5c3418]">
            {user.email} &bull; Roll: {user.rollNo || user.irisId}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="self-start sm:self-center border border-[#7a4823]/60 bg-[#eedca8]/60 px-4 py-2 font-serif text-xs font-bold tracking-wider text-[#4a2206] uppercase hover:bg-[#7a4823] hover:text-[#fffdf9] transition-all cursor-pointer shadow-sm"
        >
          Logout IRIS
        </button>
      </div>

      {/* Rules Banner */}
      <div className="border border-[#7a4823]/30 bg-[#fffdf9]/70 p-4 text-xs sm:text-sm font-medium leading-relaxed text-[#3d1e0b] shadow-sm rounded-sm">
        Notice: Roll numbers must start with <strong>26</strong>. Each squad consists of 3 to 4 hunters (Leader + 2 to 3 members).
      </div>

      {/* Squad Name & Password */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="teamName"
            className="font-serif text-xs font-bold tracking-[0.16em] text-[#3d1e0b] uppercase"
          >
            Squad Name <span className="text-[#8b261b]">*</span>
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter your squad's name"
            required
            className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-3 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="font-serif text-xs font-bold tracking-[0.16em] text-[#3d1e0b] uppercase"
          >
            Squad Password <span className="text-[#8b261b]">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password for squad login"
            required
            className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-3 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
          />
        </div>
      </div>

      {/* Squad Members Section */}
      <div className="flex flex-col gap-6">
        <div className="border-b-2 border-[#7a4823]/30 pb-2">
          <h3 className="font-serif text-base font-bold tracking-[0.16em] text-[#2b1810] uppercase">
            Squad Members ({members.length + 1} Hunters Total)
          </h3>
          <p className="mt-1 text-xs text-[#5c3418]">
            Minimum 2 additional members required (Total squad size: 3 to 4).
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {members.map((member, index) => (
            <MemberInputField
              key={member.id}
              member={member}
              index={index}
              totalMembers={members.length}
              minMembers={minMembers}
              handleMemberChange={handleMemberChange}
              removeMember={removeMember}
            />
          ))}
        </div>

        {members.length < maxMembers && (
          <button
            type="button"
            onClick={addMember}
            className="mt-2 w-full sm:w-auto border-2 border-dashed border-[#7a4823] bg-[#eedca8]/70 px-6 py-3.5 font-serif text-xs sm:text-sm font-bold tracking-[0.2em] text-[#4a2206] uppercase transition-all hover:bg-[#7a4823] hover:text-[#fffdf9] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            + Add Squad Member ({members.length + 1}/{maxTeamSize})
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

      {/* Message Output */}
      {message && (
        <div
          className={cn(
            "border-2 p-5 font-serif text-sm font-bold leading-relaxed text-center rounded-sm",
            isSuccess
              ? "border-emerald-700/60 bg-emerald-950/20 text-emerald-900"
              : "border-[#8b261b] bg-[#8b261b]/15 text-[#6e1e15]"
          )}
        >
          {message}
        </div>
      )}
    </form>
  );
}
