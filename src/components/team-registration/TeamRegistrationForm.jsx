import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { MemberInputField } from "./MemberInputField";
import { WhatsAppGroupBanner } from "./RegisteredSquadCard";

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
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesError, setRulesError] = useState("");

  const onSubmitForm = (e) => {
    e.preventDefault();
    if (!rulesAgreed) {
      setRulesError("Please confirm that you have read and agree to the Event Rules before registering.");
      return;
    }
    setRulesError("");
    handleRegister(e);
  };

  return (
    <>
      <form onSubmit={onSubmitForm} className="flex flex-col gap-8">
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

        {/* Rules Agreement Checkbox & Popup Link */}
        <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#7a4823]/30">
          <div className="flex items-start gap-3 bg-[#fffdf9] p-4 border-2 border-[#7a4823]/40 rounded-sm shadow-sm">
            <input
              type="checkbox"
              id="agreeRules"
              checked={rulesAgreed}
              onChange={(e) => {
                setRulesAgreed(e.target.checked);
                if (e.target.checked) setRulesError("");
              }}
              className="mt-1 size-5 accent-[#8b261b] cursor-pointer shrink-0"
              required
            />
            <label htmlFor="agreeRules" className="text-xs sm:text-sm font-semibold text-[#2b1810] leading-relaxed cursor-pointer">
              I have read, understood, and agree to all the{" "}
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="font-bold text-[#8b261b] underline hover:text-[#4a2206] transition-colors cursor-pointer inline-flex items-center gap-1 ml-0.5"
              >
                Event Rules & Regulations 📜
              </button>
            </label>
          </div>

          {rulesError && (
            <p className="text-xs font-bold text-[#8b261b] bg-[#8b261b]/15 p-3 rounded border border-[#8b261b]/30 text-center font-serif">
              {rulesError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="clip-torn relative mt-2 w-full border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-9 py-5 font-serif text-base sm:text-lg font-black tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#8b261b]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registering Squad..." : "REGISTER SQUAD NOW"}
        </button>

        {/* Message Output & WhatsApp Join Link */}
        {message && (
          <div className="flex flex-col gap-4">
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
            {isSuccess && <WhatsAppGroupBanner />}
          </div>
        )}
      </form>

      {/* Rules Modal Popup */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto border-2 border-[#7a4823] bg-[#f7eed6] p-6 sm:p-8 shadow-2xl text-[#2b1810] rounded-sm flex flex-col gap-4">
            <div className="sticky top-0 flex items-center justify-between border-b-2 border-[#7a4823]/40 bg-[#f7eed6] pb-3 z-10">
              <h2 className="font-serif text-lg sm:text-2xl font-black text-[#8b261b] uppercase">
                📜 Event Rules & Regulations
              </h2>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-[#8b261b] hover:text-black font-bold text-2xl px-2 cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-5 text-xs sm:text-sm font-medium leading-relaxed">
              {/* Section 1: Team Eligibility */}
              <div className="border-b border-[#7a4823]/20 pb-3">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#4a2206] uppercase mb-1.5">
                  1. Team Eligibility
                </h3>
                <ul className="list-disc list-inside space-y-1 font-semibold text-[#2b1810]">
                  <li>TEAM SIZE: MIN 3 & MAX 4 MEMBERS</li>
                  <li>WHO CAN READ AND UNDERSTAND KANNADA IS A MUST (MOST OF THE CLUES ARE RELATED TO KANNADA).</li>
                  <li>EACH TEAM MUST HAVE AT LEAST ONE NON-KANNADIGA.</li>
                </ul>
              </div>

              {/* Section 2: Event Structure */}
              <div className="border-b border-[#7a4823]/20 pb-3">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#4a2206] uppercase mb-1.5">
                  2. Event Structure
                </h3>
                <div className="space-y-1.5">
                  <p><strong>Round 1 (East Campus Trail):</strong> Every registered team meeting eligibility criteria is eligible for Round 1. Each clue refers to a place in NITK East Campus. Participants decipher clues to find the location of the next clue.</p>
                  <p className="font-bold text-[#8b261b]">🏆 TOP 10 TEAMS WILL BE SELECTED TO ROUND 2.</p>
                  <p><strong>Round 2:</strong> Further instructions will be provided after you qualify Round 1.</p>
                </div>
              </div>

              {/* Section 3: General Rules */}
              <div className="border-b border-[#7a4823]/20 pb-3">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#4a2206] uppercase mb-1.5">
                  3. General Rules
                </h3>
                <ul className="list-disc list-inside space-y-1 font-semibold text-[#2b1810]">
                  <li>BE THERE ON TIME, SO THAT YOU CAN HAVE FUN FINDING THE TREASURE.</li>
                  <li>THE CLUES ARE TO BE FOUND IN PARTICULAR ORDER AS PROVIDED. NO CLUE CAN BE SKIPPED.</li>
                  <li>ENTIRE TEAM MUST STAY TOGETHER THROUGHOUT THE GAME TO GET THE NEXT CLUE AT EVERY LOCATION.</li>
                  <li>ALL ELIGIBLE ENTRIES WILL BE JUDGED AND DISREGARDING THE RULES MAY RESULT IN DISQUALIFICATION OF THE ENTIRE TEAM.</li>
                  <li>BICYCLES OR ANY VEHICLES CANNOT BE USED.</li>
                  <li>DECISION OF THE ORGANIZERS WILL BE FINAL.</li>
                </ul>
              </div>

              {/* Section 4: Things to Bring */}
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#4a2206] uppercase mb-1.5">
                  4. Things to Bring – Be Prepared, Be Awesome!
                </h3>
                <ul className="list-disc list-inside space-y-1 font-semibold text-[#2b1810]">
                  <li>FULLY CHARGED MOBILE PHONES</li>
                  <li>WATER BOTTLES</li>
                  <li>POWER BANK</li>
                  <li>UMBRELLA</li>
                  <li>GET A PEN ALONG WITH YOU (MIGHT HELP TO DECODE THE CLUE).</li>
                  <li>ENTHUSIASM TO HAVE FUN AND WIN TREASURE!</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#7a4823]/40 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setRulesAgreed(true);
                  setRulesError("");
                  setShowRulesModal(false);
                }}
                className="w-full bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-6 py-3 font-serif text-xs sm:text-sm font-bold uppercase tracking-wider rounded shadow cursor-pointer"
              >
                I Agree & Accept Rules
              </button>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="w-full bg-[#7a4823] hover:bg-[#4a2206] text-white px-6 py-3 font-serif text-xs sm:text-sm font-bold uppercase tracking-wider rounded shadow cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
