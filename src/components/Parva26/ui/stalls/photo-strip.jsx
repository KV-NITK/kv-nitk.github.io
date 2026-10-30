import { En } from '@p26/lib/prefs'
import { PHOTO_BOOTH } from '@p26/content'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

const INK = '#2b0a0e'

// Who is in each frame, drawn on a 100 × 100 square: one smile, two friends,
// a peace sign, and the whole group squeezed in. A frame shows its middle
// 100 × 75, so the flag's halves are even and everyone is cut at the chest.
const POSES = [
  <g key="one">
    <circle cx="50" cy="44" r="15" />
    <path d="M22 100c0-20 12-32 28-32s28 12 28 32Z" />
  </g>,
  <g key="two">
    <circle cx="34" cy="46" r="13" />
    <path d="M10 100c0-18 10-28 24-28s24 10 24 28Z" />
    <circle cx="66" cy="42" r="14" />
    <path d="M40 100c0-19 11-30 26-30s26 11 26 30Z" />
  </g>,
  <g key="peace">
    <circle cx="46" cy="46" r="15" />
    <path d="M18 100c0-20 12-32 28-32s28 12 28 32Z" />
    <path d="M70 76 74 50l-5-14 4-1 6 13 3-15 4 1-3 18 2 24Z" />
  </g>,
  <g key="group">
    <circle cx="24" cy="52" r="11" />
    <path d="M4 100c0-16 9-26 20-26s20 10 20 26Z" />
    <circle cx="76" cy="52" r="11" />
    <path d="M56 100c0-16 9-26 20-26s20 10 20 26Z" />
    <circle cx="50" cy="40" r="13" />
    <path d="M26 100c0-19 11-31 24-31s24 12 24 31Z" />
  </g>,
]

// The photo booth's poster (/parva-26/photobooth): a strip of four photos on
// the Kannada flag's yellow and red, the flash going off over each frame in
// turn, and a ₹71 stamp for the 71st Rajyotsava pressed on its side. Plain
// divs, not figure / figcaption: Cards.css styles those site-wide.
export function PhotoStrip({ price, className }) {
  return (
    <div className={cn('relative mx-auto w-[min(100%,10rem)] pt-2 sm:w-[min(100%,13rem)]', className)}>
      <div className="relative rotate-[-3deg] bg-[#fbf6ea] p-3 pb-4 shadow-[0_1rem_1.6rem_rgba(0,0,0,.55)]">
        <span aria-hidden className="absolute -top-3 left-1/2 size-5 -translate-x-1/2 rounded-full bg-[#9aa0a4] shadow-[0_2px_3px_rgba(0,0,0,.5)] ring-2 ring-[#5f6468]" />
        <ul className="flex flex-col gap-2" aria-hidden>
          {POSES.map((pose, i) => (
            <li key={i} className="relative aspect-[4/3] overflow-hidden ring-1 ring-black/20">
              <svg viewBox="0 12.5 100 75" className="block size-full">
                <rect width="100" height="50" fill="#f2c12e" />
                <rect y="50" width="100" height="50" fill="#c8102e" />
                <g fill={INK} opacity="0.88">{pose}</g>
              </svg>
              <span className="absolute inset-0 bg-white opacity-0 motion-safe:animate-flash" style={{ animationDelay: `${0.5 + i * 0.55}s` }} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-[#3a2214]">
          <span lang="kn" className="block font-kn-display text-xl font-extrabold leading-none">{PHOTO_BOOTH.strip.kn}</span>
          <span lang="kn" className="mt-1 block font-kn-body text-xs font-bold leading-none text-kumkuma">{PHOTO_BOOTH.occasion.kn}</span>
        </p>
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply" style={paper} />
      </div>

      {/* The price stamp */}
      {price != null && (
        <div className="absolute -right-16 top-1/3 grid size-24 rotate-12 place-items-center rounded-full bg-kumkuma text-center shadow-[0_0.5rem_1rem_rgba(0,0,0,.5)] ring-4 ring-arishina sm:-right-10 sm:size-28">
          <span className="absolute inset-1.5 rounded-full border-2 border-dashed border-arishina/70" />
          <span className="relative">
            <span className="block font-poster text-4xl leading-none text-arishina">₹{price}</span>
            <span lang="kn" className="mt-0.5 block font-kn-body text-[0.65rem] font-bold leading-tight text-[#fff4dc]">
              {PHOTO_BOOTH.stamp.kn}
            </span>
            <En className="block font-poster text-xs leading-none tracking-wider text-[#fff4dc]/80">{PHOTO_BOOTH.stamp.en}</En>
          </span>
        </div>
      )}
    </div>
  )
}
