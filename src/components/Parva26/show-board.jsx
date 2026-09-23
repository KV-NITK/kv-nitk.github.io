import { useRef, useState } from 'react'
import { usePrefs } from './prefs'
import { EVENT } from './data'
import { toKannadaDigits } from './text'
import { useCountdown } from './use-countdown'
import { gsap, useGSAP } from './fx/gsap'
import { brass } from './fx/materials'
import { wood } from './fx/textures'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

const [DATE_KN, DATE_EN] = EVENT.dateLabel.split(' · ')

// The show-timing board (brief, Scene 2): a black board in a wooden frame
// under a small brass lamp, with the time left to Parva on split-flap tiles
// that flip every minute. The headings are painted on. On the pillar (lg) it
// is tall and narrow; below the screen on phones it lies wide and low.
export function ShowBoard({ className }) {
  const { days, hours, minutes } = useCountdown(EVENT.date)
  const { subtitles } = usePrefs()
  const en = `${days} days, ${hours} hours and ${minutes} minutes to go · ${DATE_EN}`

  return (
    <div className={cn('relative pt-7', className)} data-en={`Parva releases in ${en} · ${EVENT.venue}`}>
      <BoardLamp />
      <div className="rounded-[3px] p-[7px] shadow-[inset_0_1px_0_rgba(255,220,170,.35),0_12px_24px_rgba(0,0,0,.6)]" style={wood}>
        <div className="relative overflow-hidden rounded-[2px] bg-[#15120f] px-3 pb-2.5 pt-2.5 text-center shadow-[inset_0_2px_10px_rgba(0,0,0,.9)] sm:px-4">
          <div className="flex items-center justify-center gap-4 lg:flex-col lg:gap-2">
            <p
              lang="kn"
              className="w-[6.5rem] -rotate-[0.6deg] text-left font-kn-display text-base font-bold leading-tight text-[#f2d68f] [text-shadow:0_1px_0_rgba(0,0,0,.7),0_0_1px_rgba(242,214,143,.6)] lg:w-auto lg:text-center lg:text-lg"
            >
              ಪರ್ವ ಬಿಡುಗಡೆಗೆ ಇನ್ನು
            </p>
            <div className="flex items-start justify-center gap-2.5 sm:gap-3">
              <TileGroup value={days} minDigits={2} label="ದಿನ" />
              <TileGroup value={hours} minDigits={2} label="ಗಂಟೆ" />
              <TileGroup value={minutes} minDigits={2} label="ನಿಮಿಷ" />
            </div>
          </div>
          <p className={cn('mt-1.5 font-typewriter text-[0.62rem] leading-snug text-[#e9dcc0]/65', !subtitles && 'sr-only')}>{en}</p>

          <div aria-hidden className="mx-auto my-1.5 h-px w-4/5 bg-linear-to-r from-transparent via-[#c9a45a]/50 to-transparent lg:my-2" />
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 lg:flex-col lg:items-center">
            <span lang="kn" className="rotate-[0.4deg] font-kn-display text-sm font-semibold text-[#efe2c4] [text-shadow:0_1px_0_rgba(0,0,0,.7)]">
              {DATE_KN}
            </span>
            <span className="font-poster text-sm leading-tight tracking-wider text-[#e3c98f]">{EVENT.venueShort}</span>
          </p>

          {/* The lamp above lights the top of the board */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-[ellipse_at_50%_-10%] from-[#ffd79a]/22 via-transparent via-60% to-black/35" />
        </div>
      </div>
    </div>
  )
}

// A brass picture-light on a bent arm, throwing a soft cone onto the board.
function BoardLamp() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
      <div className="absolute top-0 h-3 w-1 rounded-full" style={brass} />
      <div className="absolute top-2 h-3 w-14 rounded-t-full shadow-[0_2px_3px_rgba(0,0,0,.6)]" style={brass} />
      <div className="absolute top-[1.2rem] h-1 w-10 rounded-full bg-[#fff3cf] shadow-[0_0_10px_3px_rgba(255,205,130,.8)]" />
      <div className="absolute top-[1.35rem] h-16 w-[140%] bg-linear-to-b from-[#ffd79a]/25 to-transparent [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" />
    </div>
  )
}

function TileGroup({ value, minDigits, label }) {
  const digits = Array.from(toKannadaDigits(String(value).padStart(minDigits, '0')))

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-[3px] font-kn-body text-2xl font-semibold text-[#f3e6c8] sm:text-[1.75rem]">
        {digits.map((digit, i) => (
          // Keyed from the right, so the units tile keeps its place when the count loses a digit.
          <FlipTile key={digits.length - i} digit={digit} />
        ))}
      </div>
      <span lang="kn" className="font-kn-display text-xs font-semibold text-[#e3c98f]">{label}</span>
    </div>
  )
}

// A split-flap tile. When the digit changes, the top flap (old digit) falls
// forward, and the bottom flap (new digit) swings down to cover the old one.
function FlipTile({ digit }) {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState({ digit, from: null })
  const tileRef = useRef(null)

  if (digit !== state.digit) setState({ digit, from: reduced ? null : state.digit })

  useGSAP(
    () => {
      if (state.from === null) return
      gsap
        .timeline({ onComplete: () => setState((s) => ({ ...s, from: null })) })
        .fromTo('[data-flap=top]', { rotateX: 0 }, { rotateX: -90, duration: 0.13, ease: 'power1.in' })
        .fromTo('[data-flap=bottom]', { rotateX: 90 }, { rotateX: 0, duration: 0.13, ease: 'power1.out' })
    },
    { scope: tileRef, dependencies: [state.from, state.digit] }
  )

  const flipping = state.from !== null

  return (
    <span ref={tileRef} className="relative inline-block h-[1.3em] w-[0.95em] rounded-[3px] shadow-[0_2px_3px_rgba(0,0,0,.7)] [perspective:240px]">
      <Half at="top" char={state.digit} />
      <Half at="bottom" char={flipping ? state.from : state.digit} />
      {flipping && <Half at="top" char={state.from} flap />}
      {flipping && <Half at="bottom" char={state.digit} flap />}
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/80" />
    </span>
  )
}

function Half({ at, char, flap }) {
  const top = at === 'top'

  return (
    <span
      data-flap={flap ? at : undefined}
      className={cn(
        'absolute inset-x-0 h-1/2 overflow-hidden backface-hidden',
        top
          ? 'top-0 origin-bottom rounded-t-[3px] bg-linear-to-b from-[#2e2a25] to-[#211e1a] shadow-[inset_0_1px_0_rgba(255,240,210,.12)]'
          : 'bottom-0 origin-top rounded-b-[3px] bg-linear-to-b from-[#1a1714] to-[#221f1b]',
        flap && !top && '[transform:rotateX(90deg)]'
      )}
    >
      <span className={cn('absolute inset-x-0 grid h-[200%] place-items-center leading-none', top ? 'top-0' : 'bottom-0')}>
        {char}
      </span>
    </span>
  )
}
