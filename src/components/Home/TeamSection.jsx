import React from 'react';
import { teamMembers } from '../../data/teamData';

function LinkedinIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.77a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
    </svg>
  );
}

export const TeamSection = () => {
  return (
    <section
      id="team"
      className="relative py-14 md:py-20 px-4 overflow-hidden bg-gradient-to-b from-white via-[#fffbf0] to-white"
    >
      {/* Decorative background glows */}
      <div className="hidden md:block absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-[#FFDA1D]/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="hidden md:block absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-[#c8102e]/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
          <p className="mb-2 text-xs font-semibold tracking-[0.25em] uppercase text-[#c8102e]">
            Our Team · ೨೦೨೬–೨೭
          </p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-[#1a1410] mb-3">
            The people behind Kannada Vedike
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#FFDA1D] to-[#c8102e] mx-auto rounded-full"></div>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#5b5147]">
            Meet the 2026–27 core team dedicated to celebrating Karnataka&apos;s language, culture, and heritage.
          </p>
        </div>

        {/* Team Grid: 4 in a row on md+ screens, 2 in a row on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group rounded-2xl overflow-hidden bg-white border border-[#e8dfd1] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            >
              {/* Image Container (Aspect Square for compact, cleaner display) */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#f5efe4]">
                <img
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Name, Team Tag & Position */}
              <div className="p-3 sm:p-3.5 bg-white text-center flex-1 flex flex-col justify-between items-center border-t border-[#e8dfd1]/70">
                {member.teamKn && (
                  <span className="noto-serif-kannada-600 text-[11px] font-semibold text-[#8b261b] bg-[#8b261b]/10 px-2.5 py-0.5 rounded-full mb-1.5 tracking-wide">
                    {member.teamKn}
                  </span>
                )}

                <div className="w-full">
                  <div className="flex items-center justify-center gap-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#1a1410] group-hover:text-[#c8102e] transition-colors truncate">
                      {member.name}
                    </h3>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Connect with ${member.name} on LinkedIn`}
                        className="text-[#0a66c2] hover:text-[#004182] transition-colors p-0.5 shrink-0"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5 inline-block transform hover:scale-110 transition-transform" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-[#c8102e] uppercase mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
