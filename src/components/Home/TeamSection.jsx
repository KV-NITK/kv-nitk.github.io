import React from 'react';

export const teamMembers = [
  { id: 1, name: 'Abhijith Sogal V', role: 'Convener', img: '/team/2026-27/abhijith.jpg' },
  { id: 2, name: 'Anindith B L', role: 'Joint Convener', img: '/team/2026-27/anindith.jpg' },
  { id: 3, name: 'Chetan S Goudar', role: 'Core Committee', img: '/team/2026-27/chetan.jpg' },
  { id: 4, name: 'Chethana Ramesh', role: 'Core Committee', img: '/team/2026-27/chethana.jpg' },
  { id: 5, name: 'Karthik Thippeswamy', role: 'Core Committee', img: '/team/2026-27/karthik.jpg' },
  { id: 6, name: 'Naveenkumar', role: 'Core Committee', img: '/team/2026-27/naveenkumar.jpg' },
  { id: 7, name: 'Sahana Kapparad', role: 'Core Committee', img: '/team/2026-27/sahana.jpg' },
  { id: 8, name: 'Satwik B Gurav', role: 'Core Committee', img: '/team/2026-27/satwik.jpg' },
  { id: 9, name: 'Sinchana', role: 'Core Committee', img: '/team/2026-27/sinchana.jpg' },
  { id: 10, name: 'Varsha J P', role: 'Core Committee', img: '/team/2026-27/varsha.jpg' },
  { id: 11, name: 'Varun D H', role: 'Core Committee', img: '/team/2026-27/varun.jpg' },
  { id: 12, name: 'Yashas Gowda M', role: 'Core Committee', img: '/team/2026-27/yashas-gowda.jpg' },
  { id: 13, name: 'Yashas R', role: 'Core Committee', img: '/team/2026-27/yashas-r.jpg' },
];

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
            Our Team (2026-27)
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
              className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col"
            >
              {/* Image Box */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[#FFDA1D]/10 to-[#f21d2f]/10">
                <img
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                
                {/* Role Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-block px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f21d2f] to-[#e6a100] rounded-full shadow-sm">
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Name & Details */}
              <div className="p-4 bg-white text-center flex-1 flex flex-col justify-center border-t border-gray-100">
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#f21d2f] transition-colors line-clamp-1">
                  {member.name}
                </h3>
                <p className="text-[0.65rem] font-semibold tracking-wider text-gray-500 uppercase mt-0.5">
                  Kannada Vedike NITK
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
