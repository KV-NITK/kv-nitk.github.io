import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePrefs } from './prefs'
import { sayLine } from './subtitle-strip'
import { FeastPoster } from './feast-poster'
import { BookingCounter, Coupon } from './booking-counter'
import { MEAL } from './data'
import { TeeShowcase } from './tee-showcase'
import { FilmFrame } from './fx/film-frame'
import { useFilmScreen } from './fx/film-layer'
import { gsap, useGSAP } from './fx/gsap'
import { brass } from './fx/materials'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'
import paperMottle from './assets/paper-mottle.webp'
import doorQuilt from './assets/door-quilt.webp'

// Scene 8, ವಿರಾಮ · Interval (allscenes.md, with the 24 Sep 2026 changes:
// no canteen, one meal coupon, one tee). The screen shows a worn ವಿರಾಮ card
// and the interval bell rings; the house lights come up; the camera turns to
// the padded swing doors at the back of the hall and goes through them into
// the lobby, under a cool tube light: the Bhoori Bhojana poster, the advance
// booking window where the coupon is sold, and the showcase with the tee.
// The move is scrubbed by the scroll (the section holds for 1.4 screens);
// the Book links in the top bar and the seat tickets skip straight past it.

const LOBBY = {
  backgroundImage: `radial-gradient(ellipse 55% 40% at 50% 0%, rgba(238,246,236,.6), transparent 70%), url(${paperMottle}), linear-gradient(180deg, #d5dbc4, #c4cdb1 65%, #b3bd9f)`,
  backgroundSize: 'auto, 600px, auto',
}

// Links that mean "take me to the counter".
const BOOK_LINKS = 'a[href="#interval"], a[href="#bhoori-bhojana"], a[href="#angadi"]'

export function IntervalScene() {
  const sectionRef = useRef(null)
  const lobbyRef = useRef(null)
  const move = useRef({})
  const triggerRef = useRef(null)
  // Until when a Book-link jump is flying past the move (no bell caption).
  const jumpingRef = useRef(0)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const { overlay, screen, card, dim, house, doors, left, right } = move.current
      const lobby = lobbyRef.current
      let lit = true
      const light = (on) => {
        if (on === lit) return
        lit = on
        lobby.toggleAttribute('data-lit', on)
      }
      light(false)
      // The doors, card and light layers are screen-sized, so they get their
      // own layers while the move plays and give them up after.
      const promote = (on) => {
        for (const el of [screen, doors, left, right]) el.style.willChange = on ? 'transform' : ''
        for (const el of [dim, house]) el.style.willChange = on ? 'opacity' : ''
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onToggle: (self) => promote(self.isActive),
          onUpdate: (self) => light(self.progress > 0.72),
        },
      })
      triggerRef.current = tl.scrollTrigger

      tl.to({}, { duration: 0.1 })
        // The worn reel jumps once
        .to(card, { yPercent: -2.5, duration: 0.015, ease: 'none' }, 0.12)
        .to(card, { yPercent: 0, duration: 0.015, ease: 'none' }, 0.135)
        // The bell only for someone scrolling through, not for a page flying past
        .call(() => performance.now() > jumpingRef.current && Math.abs(tl.scrollTrigger?.getVelocity() ?? 0) < 2500 && sayLine('[Interval bell rings]', 3500), null, 0.16)
        // House lights up, the screen dims
        .to(house, { opacity: 1, duration: 0.22, ease: 'power1.inOut' }, 0.18)
        .to(dim, { opacity: 0.55, duration: 0.22, ease: 'power1.inOut' }, 0.18)
        // The camera turns to the doors at the back
        .fromTo(left, { xPercent: -102 }, { xPercent: 0, duration: 0.22, ease: 'power2.inOut' }, 0.42)
        .fromTo(right, { xPercent: 102 }, { xPercent: 0, duration: 0.22, ease: 'power2.inOut' }, 0.42)
        .set(screen, { autoAlpha: 0 }, 0.66)
        // ...and goes through
        .to(left, { rotateY: 100, duration: 0.26, ease: 'power2.in' }, 0.7)
        .to(right, { rotateY: -100, duration: 0.26, ease: 'power2.in' }, 0.7)
        .to(doors, { scale: 1.2, duration: 0.26, ease: 'power1.in' }, 0.7)
        .set(overlay, { autoAlpha: 0 }, 0.97)
        .to({}, { duration: 0.03 }, 0.97)

      return () => {
        promote(false)
        lobby.setAttribute('data-lit', '')
        triggerRef.current = null
      }
    },
    { scope: sectionRef, dependencies: [reduced] }
  )

  // Book links land on the counter with the move already done: a jump to
  // the section itself would stop at the ವಿರಾಮ card.
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest?.(BOOK_LINKS)
      const st = triggerRef.current
      if (!link || !st) return
      const id = link.getAttribute('href') === '#angadi' ? 'angadi' : 'bhoori-bhojana'
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      jumpingRef.current = performance.now() + 1500
      const offset = target.getBoundingClientRect().top - sectionRef.current.getBoundingClientRect().top
      // On a laptop the three stations stand side by side: show the lobby.
      const lobbyTop = window.innerWidth >= 1024 ? 0 : offset - 72
      window.scrollTo({ top: st.end + Math.max(0, lobbyTop), behavior: 'instant' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <section ref={sectionRef} id="interval" aria-labelledby="interval-title" className="relative scroll-mt-14 bg-theatre">
      <h2 id="interval-title" className="sr-only">
        <span lang="kn">ವಿರಾಮ</span> · Interval: Bhoori Bhojana meal coupons and the Parva tee
      </h2>
      {reduced && (
        <FilmFrame>
          <div className="relative h-[55svh]">
            <IntervalCard />
          </div>
        </FilmFrame>
      )}

      <div ref={lobbyRef} data-lobby data-lit="" className="group/lobby relative overflow-hidden px-4 pb-24 pt-[7.5rem] sm:px-8" style={LOBBY}>
        <TubeLight />
        <Dado />
        <div className="relative z-10 mx-auto grid max-w-[80rem] justify-items-center gap-14 lg:grid-cols-[1fr_1.1fr_1.15fr] lg:items-end lg:gap-6">
          <FeastPoster className="w-full max-w-[21rem]" />
          <BookingCounter className="w-full" />
          <TeeShowcase className="w-full" />
        </div>
      </div>

      {!reduced && <IntervalMove parts={move.current} />}
      <StickyBook lobbyRef={lobbyRef} />
    </section>
  )
}

// Everything the move animates: the screen with the card, the house lights
// and the doors. It covers the first screen of the lobby and is gone once the
// doors have opened.
function IntervalMove({ parts }) {
  const frameRef = useRef(null)
  useFilmScreen(frameRef)
  const set = (key) => (el) => {
    parts[key] = el
  }
  return (
    <div ref={set('overlay')} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[100svh] overflow-hidden">
      <div ref={set('screen')} className="absolute inset-0 bg-black p-1.5 sm:p-3">
        <div ref={frameRef} className="relative isolate size-full overflow-hidden rounded-[14px] sm:rounded-[24px]">
          <div ref={set('card')} className="absolute inset-0">
            <IntervalCard />
          </div>
          {/* A worn reel: two scratches that wander */}
          <span className="absolute inset-y-0 left-[31%] w-px bg-[#f7ecd0] motion-safe:animate-scratch" />
          <span className="absolute inset-y-0 left-[68%] w-[2px] bg-black/70 motion-safe:animate-scratch [animation-delay:-.6s]" />
          <div className="absolute inset-0 bg-radial from-transparent from-45% to-black/55" />
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_28px_10px_rgba(0,0,0,.7)]" />
          <div ref={set('dim')} className="absolute inset-0 bg-black opacity-0" />
        </div>
        {/* House lights: the wall lamps come up on both sides of the hall */}
        <div
          ref={set('house')}
          className="absolute inset-0 opacity-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 30% 55% at 0% 35%, rgba(255,184,96,.55), transparent 70%), radial-gradient(ellipse 30% 55% at 100% 35%, rgba(255,184,96,.55), transparent 70%), linear-gradient(180deg, rgba(255,200,130,.12), rgba(255,200,130,.05))',
          }}
        />
      </div>
      <div ref={set('doors')} className="absolute inset-0 [perspective:1400px]">
        <SwingDoor side="left" ref={set('left')} />
        <SwingDoor side="right" ref={set('right')} />
      </div>
    </div>
  )
}

// The painted interval card: ornate gold border, ವಿರಾಮ in the old title
// lettering, INTERVAL under it.
function IntervalCard() {
  const { subtitles } = usePrefs()
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 45%, #7e1622, #4c0a13 60%, #2a0508)' }}>
      <div className="absolute inset-[5%] rounded-[6px] border-[5px] border-double border-[#c9a052]/85" />
      <div className="absolute inset-[7%] rounded-[4px] border border-[#c9a052]/45" />
      {['left-[4%] top-[4%]', 'right-[4%] top-[4%] -scale-x-100', 'bottom-[4%] left-[4%] -scale-y-100', 'bottom-[4%] right-[4%] -scale-100'].map((at) => (
        <Flourish key={at} className={cn('absolute w-[clamp(3rem,9vw,7rem)]', at)} />
      ))}
      <div className="relative text-center">
        <p lang="kn" className="font-kn-display text-[clamp(0.8rem,1.6vw,1.1rem)] font-semibold tracking-[0.2em] text-[#e9c276]/80">
          ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ
        </p>
        <p lang="kn" className="font-kn-card text-[clamp(5rem,21vw,12rem)] leading-[1.1] text-arishina [text-shadow:0.05em_0.05em_0_#2a0508,0_0_0.4em_rgba(242,193,46,.25)]">
          ವಿರಾಮ
        </p>
        <p className={cn('font-poster text-[clamp(1.4rem,4.5vw,2.8rem)] leading-none tracking-[0.6em] text-[#f3ead5]', !subtitles && 'opacity-0')}>INTERVAL</p>
      </div>
    </div>
  )
}

export function Flourish({ className }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={className} fill="none" stroke="#c9a052" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 56 C4 26 26 4 56 4" />
      <path d="M11 56 C11 31 31 11 56 11" strokeOpacity=".6" />
      <path d="M4 38 C14 36 20 30 22 20 C24 12 32 8 38 12 C42 15 40 21 35 21 C31 21 30 17 33 16" />
      <circle cx="21" cy="21" r="2.4" fill="#c9a052" stroke="none" />
    </svg>
  )
}

// A padded swing door at the back of the hall: quilted maroon rexine with
// brass studs, a round window, a brass push plate and kick plate.
function SwingDoor({ side, ref }) {
  const { subtitles } = usePrefs()
  const left = side === 'left'
  return (
    <div
      ref={ref}
      className={cn('absolute top-0 h-full w-1/2 backface-hidden', left ? 'left-0 origin-left' : 'right-0 origin-right')}
      style={{
        backgroundImage: `linear-gradient(${left ? '90deg' : '270deg'}, rgba(0,0,0,.45), transparent 8%, transparent 88%, rgba(0,0,0,.5)), url(${doorQuilt})`,
        backgroundSize: 'auto, 6rem',
        backgroundPosition: `0 0, ${left ? 'right' : 'left'} top`,
      }}
    >
      {/* Brass edge where the two doors meet */}
      <span className={cn('absolute inset-y-0 w-2', left ? 'right-0' : 'left-0')} style={brass} />
      {/* Round window, showing the lobby's cool light */}
      <span className="absolute left-1/2 top-[16%] aspect-square w-[min(42%,13rem)] -translate-x-1/2 rounded-full p-[4%] shadow-[0_6px_12px_rgba(0,0,0,.55)]" style={brass}>
        <span
          className="block size-full rounded-full shadow-[inset_0_4px_10px_rgba(0,0,0,.45)]"
          style={{ backgroundImage: 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,.35) 36%, transparent 44%), radial-gradient(circle at 50% 30%, #f4f8f0, #cdd6bf 60%, #aab596)' }}
        />
      </span>
      {/* Push plate */}
      <span
        className={cn('absolute top-[52%] grid w-[min(20%,6rem)] place-items-center rounded-[4px] py-3 text-center shadow-[0_3px_6px_rgba(0,0,0,.5)]', left ? 'right-[8%]' : 'left-[8%]')}
        style={brass}
      >
        <span lang="kn" className="font-kn-display text-[clamp(0.9rem,1.6vw,1.3rem)] font-extrabold leading-none text-[#4a3208] [text-shadow:0_1px_0_rgba(255,240,200,.6)]">
          ತಳ್ಳಿ
        </span>
        {subtitles && <span className="font-poster text-[clamp(0.8rem,1.3vw,1.1rem)] leading-none tracking-widest text-[#4a3208]">PUSH</span>}
      </span>
      {/* Kick plate */}
      <span className="absolute inset-x-[5%] bottom-[3%] h-[9%] rounded-[3px] shadow-[0_-2px_4px_rgba(0,0,0,.35)]" style={brass} />
    </div>
  )
}

// The lobby's tube light, on a batten. It starts the way old tube lights do,
// with a few flickers, as the doors open.
function TubeLight() {
  return (
    <div aria-hidden className="absolute left-1/2 top-[4.6rem] z-0 w-[min(70%,26rem)] -translate-x-1/2">
      <span className="block h-2 rounded-[2px] bg-[#c9cfc6] shadow-[0_2px_3px_rgba(0,0,0,.25)]" />
      <span className="relative -mt-0.5 block h-2.5 rounded-full bg-[#dfe5dc]">
        <span className="absolute inset-0 rounded-full bg-[#fbfdf9] opacity-0 shadow-[0_0_18px_6px_rgba(234,242,232,.95)] group-data-lit/lobby:animate-warm-up" />
      </span>
      <span className="absolute left-1/2 top-full h-56 w-[160%] -translate-x-1/2 bg-radial-[ellipse_50%_60%_at_50%_0%] from-[#f3f9f1]/70 to-transparent opacity-0 group-data-lit/lobby:animate-warm-up" />
    </div>
  )
}

// Glossy green oil paint up to the dado rail, and a strip of terrazzo floor.
function Dado() {
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 z-0 h-40">
      <span
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(180deg, #8e0b20 0 4px, #efe6d2 4px 7px, rgba(255,255,255,.14) 7px, transparent 40%), linear-gradient(180deg, #34513f, #26402f)' }}
      />
      <span
        className="absolute inset-x-0 bottom-0 h-7"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, #f3ead5 0 1px, transparent 1.6px), radial-gradient(circle at 70% 70%, #8e0b20 0 1.2px, transparent 1.8px), radial-gradient(circle at 55% 20%, #2f2a26 0 1px, transparent 1.6px), linear-gradient(180deg, #a9a49a, #8f8a80)',
          backgroundSize: '11px 9px, 17px 13px, 7px 8px, auto',
        }}
      />
    </div>
  )
}

// On a phone the food station is taller than the screen, so while the
// poster or the booking window is in view but the coupon itself isn't, a
// copy of the coupon waits at the bottom of the screen. It's portalled to
// the page root: the section is pinned during the move, and a fixed element
// inside a pinned one would move with it.
function StickyBook({ lobbyRef }) {
  const { subtitles } = usePrefs()
  const [show, setShow] = useState(false)
  const [root, setRoot] = useState(null)
  const soldOut = MEAL.sold >= MEAL.coupons

  useEffect(() => {
    const lobby = lobbyRef.current
    setRoot(lobby.closest('.parva26-page') ?? document.body)
    const food = new Set()
    let coupon = false
    const update = () => setShow(food.size > 0 && !coupon && lobby.hasAttribute('data-lit'))
    const seenFood = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.isIntersecting ? food.add(entry.target) : food.delete(entry.target)
      update()
    })
    for (const el of [lobby.querySelector('[data-food]'), lobby.querySelector('#bhoori-bhojana')]) el && seenFood.observe(el)
    const seenCoupon = new IntersectionObserver(
      ([entry]) => {
        coupon = entry.isIntersecting
        update()
      },
      { threshold: 0.6 }
    )
    const real = lobby.querySelector('[data-coupon]')
    real && seenCoupon.observe(real)
    const lit = new MutationObserver(update)
    lit.observe(lobby, { attributes: true, attributeFilter: ['data-lit'] })
    return () => {
      seenFood.disconnect()
      seenCoupon.disconnect()
      lit.disconnect()
    }
  }, [lobbyRef])

  if (!root || soldOut) return null
  return createPortal(
    <div
      inert={!show}
      className={cn(
        'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[60] transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[160%] opacity-0'
      )}
    >
      <Coupon price={MEAL.price} href={MEAL.bookLink} subtitles={subtitles} className="rotate-[-3deg]" />
    </div>,
    root
  )
}
