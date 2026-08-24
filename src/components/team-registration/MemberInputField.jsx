import React from "react";

export function MemberInputField({
  member,
  index,
  totalMembers,
  minMembers,
  handleMemberChange,
  removeMember,
}) {
  return (
    <div className="relative border-2 border-[#7a4823]/40 bg-[#fffdf9] p-5 sm:p-6 shadow-md rounded-sm">
      <div className="flex items-center justify-between border-b border-[#7a4823]/20 pb-3">
        <h4 className="font-serif text-sm font-bold tracking-[0.16em] text-[#4a2206] uppercase">
          Hunter #{index + 2} (Squad Member)
        </h4>

        {totalMembers > minMembers && (
          <button
            type="button"
            onClick={() => removeMember(member.id)}
            className="font-serif text-xs font-bold tracking-wider text-[#8b261b] hover:text-[#52130c] uppercase cursor-pointer transition-colors"
          >
            Remove Member
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Full Name */}
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
            onChange={(e) => handleMemberChange(member.id, "name", e.target.value)}
            placeholder="Enter full name"
            required
            className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-2.5 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
          />
        </div>

        {/* Roll Number */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`member-rollNo-${member.id}`}
            className="font-serif text-xs font-bold tracking-[0.16em] text-[#3d1e0b] uppercase"
          >
            Roll Number <span className="text-[#8b261b]">*</span>
          </label>
          <input
            id={`member-rollNo-${member.id}`}
            type="text"
            value={member.rollNo}
            onChange={(e) => handleMemberChange(member.id, "rollNo", e.target.value)}
            placeholder="e.g. 261..."
            required
            className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-2.5 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
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
            onChange={(e) => handleMemberChange(member.id, "email", e.target.value)}
            placeholder="Enter email address"
            required
            className="w-full border-2 border-[#7a4823]/40 bg-[#fffdf9] px-4 py-2.5 text-base font-semibold text-[#1a0a03] placeholder:text-[#8a7260] transition-all focus:border-[#4a2206] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7a4823]/30 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
