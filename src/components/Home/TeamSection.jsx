import React from 'react';
import { teamMembers } from '../../data/teamData';

function LinkedinIcon({ className = 'w-4 h-4' }) {
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
    <div id="team" className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-b from-[#ffffff] via-[#fffbf0] to-[#ffffff]">
      {/* Decorative background glows */}
      <div className="hidden md:block absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-[#FFDA1D]/15 to-transparent rounded-full blur-3xl -z-10" />
      <div className="hidden md:block absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-[#f21d2f]/10 to-transparent rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#f21d2f] via-[#FFDA1D] to-[#f21d2f] bg-clip-text text-transparent">
            Our Team
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFDA1D] to-[#f21d2f] mx-auto rounded-full"></div>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base font-medium text-gray-600">
            Meet the team behind Kannada Vedike NITK dedicated to celebrating Karnataka&apos;s language, culture, and heritage.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col"
            >
              {/* Clean Image Container (No dark gradient overlay) */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
                <img
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Name, Position & LinkedIn Details */}
              <div className="p-4 bg-white text-center flex-1 flex flex-col justify-center border-t border-gray-100">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#f21d2f] transition-colors">
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
                      <LinkedinIcon className="w-4 h-4 inline-block transform hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#f21d2f] uppercase mt-1">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamSection;
