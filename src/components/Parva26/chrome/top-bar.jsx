import { useEffect, useRef } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { toKannadaDigits } from '@p26/lib/text'
import { gsap } from '@p26/lib/gsap'
import { brass, sandalRings, speakerCloth } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// The objects that stay on screen through the whole show (spec §2): a carved
// sandalwood logo, a brass subtitles plate, a speaker grille and a ticket stub
// for booking. Each carries data-en, which the subtitle strip shows on hover.
// Fixed rather than sticky: the site sets overflow-x: hidden on html, body and
// #root, which stops position: sticky from working.
export function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/60 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl items-center gap-2.5 px-3 pt-2.5 sm:gap-3.5 sm:px-5 sm:pt-3">
        <LogoDisc />
        <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
          <SubtitlesPlate />
          <SpeakerGrille />
          <TicketStub />
        </div>
      </div>
    </header>
  )
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina'

// ಪರ್ವ carved into a sandalwood disc: the letters sit in a recess, so their
// top edge is in shadow and their bottom edge catches the light.
function LogoDisc() {
  return (
    <a
      href="#title"
      aria-label="Parva 2026, back to the top"
      data-en="Parva 2026 · back to the top"
      className={cn(
        'pointer-events-auto grid size-12 shrink-0 place-items-center rounded-full ring-1 ring-heartwood sm:size-14',
        'shadow-[inset_0_2px_2px_rgba(255,236,200,.5),inset_0_-3px_5px_rgba(60,30,10,.6),0_4px_10px_rgba(0,0,0,.6)]',
        focusRing
      )}
      style={sandalRings}
    >
      <span
        lang="kn"
        className="font-kn-display text-lg font-bold leading-none text-[#5a3318] [text-shadow:0_-1px_0_rgba(40,18,4,.75),0_1px_0_rgba(255,232,195,.6)] sm:text-xl"
      >
        ಪರ್ವ
      </span>
    </a>
  )
}

function Screw({ className }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-radial-[at_35%_35%] from-[#f6e2a8] to-[#8a6420] to-70% shadow-[0_0_0_.5px_rgba(40,25,0,.5)]',
        className
      )}
    >
      <span className="absolute inset-x-px top-1/2 h-px -translate-y-1/2 rotate-45 bg-[#3a2606]/70" />
    </span>
  )
}

// A brass plate engraved ಉಪಶೀರ್ಷಿಕೆ with a bat-handle toggle: the lever points
// up for on and flips down for off. Its label shows in the subtitle strip even
// when subtitles are off, so someone who can't read the plate can find it.
function SubtitlesPlate() {
  const { subtitles, setSubtitles } = usePrefs()

  return (
    <button
      type="button"
      aria-label="Subtitles"
      aria-pressed={subtitles}
      data-en={`Subtitles: ${subtitles ? 'on' : 'off'}`}
      data-en-always=""
      onClick={() => setSubtitles((on) => !on)}
      className={cn(
        'pointer-events-auto relative flex h-10 cursor-pointer items-center gap-2.5 rounded-[3px] px-4 sm:h-11 sm:px-5',
        'shadow-[inset_0_1px_0_rgba(255,248,220,.6),inset_0_-1px_0_rgba(60,35,5,.6),0_3px_8px_rgba(0,0,0,.55)]',
        focusRing
      )}
      style={brass}
    >
      <Screw className="left-1.5" />
      <span
        lang="kn"
        className="font-kn-serif text-[0.7rem] font-bold text-[#4a3208] [text-shadow:0_1px_0_rgba(255,240,200,.5),0_-1px_0_rgba(40,25,0,.35)] sm:text-xs"
      >
        ಉಪಶೀರ್ಷಿಕೆ
      </span>
      <span
        aria-hidden
        className="relative grid size-5 place-items-center rounded-full bg-radial-[at_40%_35%] from-[#e9cf8c] to-[#6f4d16] to-75% shadow-[0_1px_2px_rgba(0,0,0,.5)]"
      >
        <span
          className={cn(
            'absolute bottom-1/2 left-1/2 h-3.5 w-[5px] -translate-x-1/2 origin-bottom rounded-full bg-linear-to-r from-[#444] via-[#111] to-black shadow-[0_1px_1px_rgba(0,0,0,.6)] transition-transform duration-150',
            !subtitles && 'rotate-180'
          )}
        />
      </span>
      <Screw className="right-1.5" />
    </button>
  )
}

// Cloth mesh in a brass ring, with a pilot lamp like an old radio's.
function SpeakerGrille() {
  const { sound, setSound } = usePrefs()

  return (
    <button
      type="button"
      aria-label="Sound"
      aria-pressed={sound}
      data-en={`Sound: ${sound ? 'on' : 'off'}`}
      onClick={() => setSound((on) => !on)}
      className={cn(
        'pointer-events-auto relative size-10 shrink-0 cursor-pointer rounded-full p-1 sm:size-11',
        'shadow-[inset_0_1px_0_rgba(255,248,220,.6),0_3px_8px_rgba(0,0,0,.55)]',
        focusRing
      )}
      style={brass}
    >
      <span
        aria-hidden
        className={cn('block size-full rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,.7)]', !sound && 'brightness-50')}
        style={speakerCloth}
      />
      <span
        aria-hidden
        className={cn(
          'absolute bottom-px left-1/2 size-1.5 -translate-x-1/2 rounded-full ring-1 ring-[#5a3d10]',
          sound ? 'bg-[#ffcf5a] shadow-[0_0_6px_2px_rgba(255,190,60,.75)]' : 'bg-[#3b2a12]'
        )}
      />
    </button>
  )
}

// Right edge torn along the perforation: a row of small bites.
const TORN_EDGE = (() => {
  const bites = 6
  const points = ['0 0']
  for (let i = 0; i < bites; i++) {
    points.push(`100% ${(i / bites) * 100}%`, `calc(100% - 4px) ${((i + 0.5) / bites) * 100}%`)
  }
  points.push('100% 100%', '0 100%')
  return `polygon(${points.join(', ')})`
})()

// A torn arishina ticket stub on a brass clip. It swings when the page
// scrolls and settles when it stops, so it only moves when you do.
function TicketStub() {
  const swingRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = swingRef.current
    let lastY = window.scrollY
    let settle = 0
    let raf = 0

    const update = () => {
      raf = 0
      const velocity = window.scrollY - lastY
      lastY = window.scrollY
      gsap.to(el, { rotation: Math.max(-9, Math.min(9, -velocity * 0.35)), duration: 0.25, overwrite: true })
      clearTimeout(settle)
      settle = setTimeout(() => gsap.to(el, { rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.25)', overwrite: true }), 120)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      gsap.killTweensOf(el)
    }
  }, [reduced])

  return (
    <a
      href="#interval"
      aria-label="Book food coupons and merch"
      data-en="Book · food coupons and merch"
      className={cn('group pointer-events-auto relative block shrink-0 rounded-sm', focusRing)}
    >
      <span ref={swingRef} className="relative block origin-top pt-2.5">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 z-10 h-3.5 w-6 -translate-x-1/2 rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,.6)]"
          style={brass}
        >
          <span className="absolute inset-x-1 top-1 h-px bg-[#4a3208]/60" />
        </span>
        <span className="block drop-shadow-[0_3px_4px_rgba(0,0,0,.55)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-2">
          <span
            className="flex h-10 items-center gap-1.5 bg-arishina pl-3 pr-4 text-theatre bg-blend-multiply sm:h-11"
            style={{ ...paper, clipPath: TORN_EDGE }}
          >
            <span className="font-poster text-xl leading-none tracking-wider sm:text-2xl">Book</span>
            <span className="hidden font-typewriter text-[0.6rem] text-theatre/70 sm:inline">No. {toKannadaDigits('017')}</span>
          </span>
        </span>
      </span>
    </a>
  )
}
