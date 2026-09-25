import { En } from '@p26/lib/prefs'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

// The brass nameplate: engraved letters, darker than the brass, with a thin
// highlight on their lower edge. Blank until the guest is revealed.
export function Nameplate({ name, subtitles }) {
  return (
    <div
      className="relative mt-[0.6rem] flex min-h-[3.4rem] w-max min-w-[max(86%,9.5rem)] max-w-[15rem] flex-col justify-center rounded-[3px] px-4 py-1 text-center shadow-[0_2px_3px_rgba(50,24,6,.55),inset_0_1px_0_rgba(255,248,220,.6),inset_0_-1px_0_rgba(80,50,10,.5)]"
      style={brass}
    >
      <span aria-hidden className="absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#6b4a14] shadow-[inset_0_1px_1px_rgba(0,0,0,.6),0_1px_0_rgba(255,240,200,.5)]" />
      <span aria-hidden className="absolute right-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#6b4a14] shadow-[inset_0_1px_1px_rgba(0,0,0,.6),0_1px_0_rgba(255,240,200,.5)]" />
      {name && (
        <>
          <span lang="kn" className="block font-kn-serif text-[0.95rem] font-bold leading-tight text-[#3a2406] [text-shadow:0_1px_0_rgba(255,238,190,.65)]">
            {name.kn}
          </span>
          <span className={cn('block font-poster text-[0.95rem] leading-tight tracking-[0.12em] text-[#4a300c] [text-shadow:0_1px_0_rgba(255,238,190,.6)]', !subtitles && 'sr-only')}>
            {name.en}
          </span>
        </>
      )}
    </div>
  )
}

// A kumkuma ribbon under the nameplate with the guest's role.
export function RoleRibbon({ role, subtitles, blank }) {
  return (
    <p
      aria-hidden={blank || undefined}
      className={cn('mt-1.5 whitespace-nowrap px-5 py-0.5 text-center leading-snug text-[#fff4dc] [text-shadow:0_1px_0_rgba(60,0,10,.6)]', blank && 'invisible')}
      style={{ backgroundImage: 'linear-gradient(180deg, #d4243e, #9e0c24)', clipPath: 'polygon(0 0, 100% 0, 93% 50%, 100% 100%, 0 100%, 7% 50%)' }}
    >
      <span lang="kn" className="font-kn-display text-sm font-semibold">
        {role.kn}
      </span>
      {subtitles && (
        <span className="block font-poster text-sm tracking-wider lg:inline">
          <span className="hidden lg:inline"> · </span>
          {role.en}
        </span>
      )}
    </p>
  )
}

// A small paper card tucked into the corner of the frame (under it on a
// phone), with when and where, one line, and a link to the event.
export function InfoCard({ card, subtitles }) {
  return (
    <div
      className="relative z-20 mt-3 w-[min(100%,15rem)] rotate-[2deg] bg-paper px-3 pb-3 pt-2.5 text-pen shadow-[0_0.5rem_0.9rem_rgba(40,20,5,.5)] lg:absolute lg:left-[72%] lg:top-[42%] lg:mt-0 lg:w-[12.5rem] lg:rotate-[5deg]"
      style={paper}
    >
      <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rotate-[-4deg] bg-[#e8d9a8]/80 shadow-[0_1px_1px_rgba(0,0,0,.15)]" />
      <p lang="kn" className="font-kn-display text-base font-bold leading-snug">
        {card.when.kn}
      </p>
      <En as="p" className="text-base font-semibold leading-snug">{card.when.en}</En>
      {card.line && <p className="mt-1 text-[0.9rem] leading-snug text-pen/85">{card.line}</p>}
      {card.link && (
        <a
          href={card.link}
          className="mt-2 flex min-h-11 flex-col justify-center font-kn-display text-base font-bold leading-tight text-kumkuma underline decoration-kumkuma/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumkuma"
        >
          <span lang="kn">ಕಾರ್ಯಕ್ರಮ ನೋಡಿ →</span>
          <En className="font-kn-body text-[0.9rem] font-semibold">See the event</En>
        </a>
      )}
    </div>
  )
}
