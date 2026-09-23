import { useState } from 'react'
import { usePrefs } from './prefs'
import { toKannadaDigits } from './text'
import { gsap } from './fx/gsap'
import { brass, velvet } from './fx/materials'
import { paper, wood } from './fx/textures'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

// The row in front of you (brief, Scene 2). The three main actions are
// tickets tucked behind the top rail of the seat straight ahead: hovering one
// lifts it and dips the others, and clicking pulls it out and flies it at the
// camera before cutting to its section. The golden fan pass sits in the middle
// because it's the main promotion.
const TICKETS = [
  { id: 'bhojana', href: '#bhoori-bhojana', kn: 'ಭೂರಿ ಭೋಜನ', en: 'Get food coupon', tilt: -7, Face: LeafTicket },
  { id: 'pass', href: '#fan-pass', kn: 'ನಿಮ್ಮ ಪಾಸ್', en: 'Get your fan pass', tilt: 2, Face: GoldenTicket },
  { id: 'angadi', href: '#angadi', kn: 'ಪರ್ವ ಅಂಗಡಿ', en: 'Merch', tilt: 8, Face: PriceTag },
]

// --seat is how much of the seat shows below its rail, --peek how far the
// tickets stand above it.
export function SeatRow({ className }) {
  return (
    <div
      className={cn(
        'relative h-[calc(var(--seat)+var(--peek))] [--peek:5.25rem] [--seat:5.25rem] sm:[--peek:6.75rem] sm:[--seat:clamp(8rem,24svh,13rem)]',
        className
      )}
    >
      <SeatBack className="left-[calc(50%-min(94vw,40rem)*1.5-1.5rem)]" plate="೧೫" />
      <SeatBack className="left-[calc(50%+min(94vw,40rem)*0.5+0.75rem)]" plate="೧೭" />
      <SeatBack className="left-1/2 -translate-x-1/2" plate="೧೬">
        <Tickets />
      </SeatBack>
    </div>
  )
}

// Velvet back under a wooden top rail, running off the bottom of the view.
// The screen above lights the rail's top edge and the upper cushion gold.
function SeatBack({ className, plate, children }) {
  return (
    <div className={cn('absolute -bottom-4 h-[calc(var(--seat)+1rem)] w-[min(94vw,40rem)]', className)}>
      {children}
      <div
        className="absolute inset-x-[3%] -bottom-2 top-8 rounded-t-[1.75rem] shadow-[inset_0_14px_18px_-8px_rgba(255,190,110,.28),inset_0_-40px_40px_rgba(0,0,0,.55)] sm:top-10"
        style={velvet}
      />
      <div
        className="absolute inset-x-0 top-0 h-10 rounded-[1rem] shadow-[inset_0_2px_0_rgba(255,214,150,.55),inset_0_-3px_4px_rgba(0,0,0,.6),0_10px_14px_rgba(0,0,0,.6)] sm:h-12"
        style={wood}
      >
        <span
          lang="kn"
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] px-2 font-kn-serif text-[0.65rem] font-bold leading-4 text-[#4a3208] shadow-[0_1px_2px_rgba(0,0,0,.6)]"
          style={brass}
        >
          {plate}
        </span>
      </div>
    </div>
  )
}

function Tickets() {
  const [active, setActive] = useState(null)
  const reduced = usePrefersReducedMotion()

  // Pull the ticket out of the seat, fly it at the camera, then cut to its
  // section. Modified clicks and reduced motion just follow the link.
  const onClick = (e, href) => {
    if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const el = e.currentTarget
    gsap
      .timeline({
        onComplete: () => {
          if (window.location.hash === href) document.querySelector(href)?.scrollIntoView()
          else window.location.hash = href
          gsap.set(el, { clearProps: 'all' })
          setActive(null)
        },
      })
      .set(el, { zIndex: 30 })
      .to(el, { yPercent: -60, duration: 0.2, ease: 'power2.out' })
      .to(el, { yPercent: -120, scale: 5, rotation: 0, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
  }

  return (
    // Behind the rail and cushion (later siblings), with each ticket's lower
    // end tucked 1.5rem down inside the seat.
    <div className="absolute inset-x-[4%] bottom-[calc(100%-1.5rem)] flex items-end justify-center gap-[3%]" onPointerLeave={() => setActive(null)}>
      {TICKETS.map(({ id, href, kn, en, tilt, Face }) => (
        <a
          key={id}
          href={href}
          data-en={en}
          onPointerEnter={() => setActive(id)}
          onFocus={() => setActive(id)}
          onBlur={() => setActive(null)}
          onClick={(e) => onClick(e, href)}
          className={cn(
            'relative block origin-bottom drop-shadow-[0_6px_6px_rgba(0,0,0,.55)] transition-[translate,rotate] duration-300 ease-out',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina',
            active === id && '-translate-y-2.5',
            active && active !== id && 'translate-y-2.5'
          )}
          style={{ rotate: `${active === id ? tilt * 0.4 - 2 : tilt}deg` }}
        >
          <Face kn={kn} en={en} lit={active === id} />
        </a>
      ))}
    </div>
  )
}

// A light sweep across the ticket while it's lifted.
function Sheen({ lit }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span
        className={cn(
          'absolute inset-y-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-[#fff8e0]/55 to-transparent',
          lit ? 'left-[120%] transition-[left] duration-700 ease-out' : '-left-3/4'
        )}
      />
    </span>
  )
}

// Round bites out of both long edges, where a ticket tears from its stub.
const notched = {
  maskImage:
    'radial-gradient(circle at 0 50%, transparent 7px, #000 7.5px), radial-gradient(circle at 100% 50%, transparent 7px, #000 7.5px)',
  maskSize: '51% 100%',
  maskPosition: 'left, right',
  maskRepeat: 'no-repeat',
}

function Caption({ en, className }) {
  const { subtitles } = usePrefs()
  return <span className={cn('block font-poster text-[0.7rem] leading-none tracking-[0.12em] sm:text-xs', !subtitles && 'sr-only', className)}>{en}</span>
}

// Banana-leaf green, with the leaf's side veins showing through the print.
function LeafTicket({ kn, en, lit }) {
  return (
    <span
      className="relative flex h-[5.2rem] w-[6.6rem] flex-col justify-between rounded-[4px] bg-[#4f8a36] px-3 pb-2.5 pt-2 text-[#f6efd6] bg-blend-multiply sm:h-[6.4rem] sm:w-[8.6rem]"
      style={{
        ...paper,
        ...notched,
        backgroundImage: `repeating-linear-gradient(62deg, rgba(220,245,190,.14) 0 1px, transparent 1px 7px), linear-gradient(160deg, #6fae4c, #3c7429), ${paper.backgroundImage}`,
        backgroundSize: `auto, auto, ${paper.backgroundSize}`,
      }}
    >
      <span className="flex items-center justify-between">
        <LeafMark className="h-4 w-7 text-[#f6efd6]/90" />
        <span aria-hidden className="font-typewriter text-[0.55rem] text-[#f6efd6]/70">No. {toKannadaDigits('042')}</span>
      </span>
      <span>
        <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight sm:text-xl">{kn}</span>
        <Caption en={en} className="text-[#f6efd6]/80" />
      </span>
      <span aria-hidden className="absolute inset-y-2 right-6 border-r border-dashed border-[#f6efd6]/35 sm:right-8" />
      <Sheen lit={lit} />
    </span>
  )
}

function LeafMark({ className }) {
  return (
    <svg viewBox="0 0 40 20" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 16 C10 2 30 0 38 4 C32 14 14 20 2 16 Z" fill="currentColor" fillOpacity=".25" />
      <path d="M2 16 C14 11 26 7 38 4" />
      {[10, 16, 22, 28].map((x) => (
        <path key={x} d={`M${x} ${13 - (x - 10) * 0.28} l3 -5 M${x} ${13 - (x - 10) * 0.28} l-1 5`} strokeWidth=".8" />
      ))}
    </svg>
  )
}

// Gold foil inside a sandalwood border. It glows faintly: it's the main promotion.
function GoldenTicket({ kn, en, lit }) {
  return (
    <span
      className="relative block rounded-[5px] p-[5px] shadow-[0_0_22px_rgba(242,193,46,.45)]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, rgba(90,50,20,.18) 0 1px, transparent 1px 4px), linear-gradient(180deg, #d8a870, #b98450)',
      }}
    >
      <span
        className="relative flex h-[5.8rem] w-[7.2rem] flex-col items-center justify-center gap-0.5 rounded-[3px] text-center text-[#5a1c0a] outline-1 -outline-offset-4 outline-dotted outline-[#7a4a1c]/50 sm:h-[7rem] sm:w-[9.4rem]"
        style={{
          backgroundImage:
            'linear-gradient(125deg, #f9e39a 0%, #e0b24a 30%, #f6d67e 48%, #c99532 70%, #f2d27c 100%)',
        }}
      >
        <span aria-hidden className="font-poster text-[0.6rem] tracking-[0.3em] text-[#7a3a12]/80">★ ಪರ್ವ ★</span>
        <span lang="kn" className="block font-kn-display text-lg font-extrabold leading-tight [text-shadow:0_1px_0_rgba(255,240,190,.6)] sm:text-2xl">{kn}</span>
        <Caption en={en} className="text-[#6b2a0e]/85" />
        <Sheen lit={lit} />
      </span>
    </span>
  )
}

// A kraft cardboard price tag with a brass eyelet and a loop of twine.
function PriceTag({ kn, en, lit }) {
  return (
    <span className="relative block pt-5">
      <svg viewBox="0 0 40 32" aria-hidden className="absolute left-1/2 top-0 h-8 w-10 -translate-x-1/2 overflow-visible">
        <path d="M20 26 C10 18 8 4 18 2 C28 0 30 14 20 26" fill="none" stroke="#e9dcbc" strokeWidth="1.3" />
      </svg>
      <span
        className="relative flex h-[5rem] w-[5.8rem] flex-col items-center justify-end rounded-b-[4px] bg-[#c49a66] px-2 pb-2.5 text-center text-[#3d2410] bg-blend-multiply [clip-path:polygon(22%_0,78%_0,100%_24%,100%_100%,0_100%,0_24%)] sm:h-[6.2rem] sm:w-[7.4rem]"
        style={paper}
      >
        <span aria-hidden className="absolute left-1/2 top-2 size-3.5 -translate-x-1/2 rounded-full shadow-[0_1px_1px_rgba(0,0,0,.5)]" style={brass}>
          <span className="absolute inset-[3px] rounded-full bg-[#2a1a0e]" />
        </span>
        <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight [filter:url(#p26-ink)] sm:text-xl">{kn}</span>
        <Caption en={en} className="text-[#3d2410]/80" />
        <Sheen lit={lit} />
      </span>
    </span>
  )
}
