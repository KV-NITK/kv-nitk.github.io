import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { En, usePrefs } from '@p26/lib/prefs'
import { sayLine } from '@p26/chrome/subtitle-strip'
import { Flourish } from '@p26/ui/flourish'
import { MARKET, PLACES } from '@p26/content'
import { MarketStage } from '@p26/market/market-stage'
import { FilmFrame } from '@p26/film/film-frame'
import { useFilmScreen } from '@p26/film/film-layer'
import { gsap, ScrollTrigger, useGSAP } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { willChange } from '@p26/lib/layers'
import { cn } from '@/lib/utils'
import doorQuilt from '@p26/assets/textures/door-quilt.webp'

// Scene 8, ವಿರಾಮ · Interval. The screen shows a worn ವಿರಾಮ card and the
// interval bell rings; the house lights come up; the camera turns to the
// padded swing doors at the back of the hall and goes through them, out
// into the Parva Market: the forecourt game, in a box in the page, with the
// stalls as plain buttons under it for anyone who'd rather not walk.
// The move plays on its own as the section arrives (it holds for half a
// screen); the Book links in the top bar and the seat tickets skip past it.

// Links that mean "take me to the market", and addresses that land there.
const BOOK_LINKS = 'a[href="#interval"], a[href="#angadi"], a[href="#parva-sante"]'
const MARKET_HASHES = ['#interval', '#angadi', '#parva-sante']

export function IntervalScene() {
  const sectionRef = useRef(null)
  const move = useRef({})
  const triggerRef = useRef(null)
  // Until when a Book-link jump is flying past the move (no bell caption).
  const jumpingRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  // The doors have opened: the market game may run.
  const [open, setOpen] = useState(reduced)

  useGSAP(
    () => {
      if (reduced) {
        setOpen(true)
        return
      }
      const { overlay, screen, card, dim, house, doors, left, right } = move.current
      // The doors, card and light layers are screen-sized, so they get their
      // own layers while the move plays and give them up after.
      const promote = (on) => {
        willChange([screen, doors, left, right], on && 'transform')
        willChange([dim, house], on && 'opacity')
      }

      // The move plays on its own once the section reaches the top, while
      // the section holds for half a screen; it costs no scrolling. Leaving
      // past the hold finishes it at once, and going back above the section
      // resets it for next time.
      const tl = gsap.timeline({
        paused: true,
        onStart: () => promote(true),
        onComplete: () => {
          promote(false)
          setOpen(true)
        },
      })
      const finish = () => {
        tl.progress(1)
        promote(false)
        setOpen(true)
      }
      const reset = () => {
        tl.pause(0)
        setOpen(false)
      }

      tl.to({}, { duration: 0.1 })
        // The worn reel jumps once
        .to(card, { yPercent: -2.5, duration: 0.015, ease: 'none' }, 0.12)
        .to(card, { yPercent: 0, duration: 0.015, ease: 'none' }, 0.135)
        // The bell only for someone watching, not for a Book-link jump
        .call(() => performance.now() > jumpingRef.current && sayLine('[Interval bell rings]', 3500), null, 0.16)
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
      tl.duration(2.6)

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=50%',
        pin: true,
        invalidateOnRefresh: true,
        onEnter: () => tl.play(),
        onLeave: finish,
        onLeaveBack: reset,
      })
      triggerRef.current = st

      // A page that arrives already scrolled past (coming back from a
      // stall) starts with the doors open.
      const arrived = () => window.scrollY >= st.end && finish()
      ScrollTrigger.addEventListener('refresh', arrived)
      arrived()

      return () => {
        promote(false)
        ScrollTrigger.removeEventListener('refresh', arrived)
        triggerRef.current = null
      }
    },
    { scope: sectionRef, dependencies: [reduced] }
  )

  // Book links land in the market with the move already done: a jump to the
  // section itself would stop at the ವಿರಾಮ card. So does arriving at the
  // page with one of the market's addresses (coming back from a stall, or
  // the old /parva-26/market link).
  useEffect(() => {
    const jump = () => {
      const box = document.getElementById('parva-sante')
      const title = document.getElementById('interval-title')
      if (!box || !title || !sectionRef.current) return false
      jumpingRef.current = performance.now() + 1500
      const from = sectionRef.current.getBoundingClientRect().top
      const offset = box.getBoundingClientRect().top - from
      // The market's name under the top bar, with the game below it; if both
      // don't fit, the game box in the middle of the screen
      const named = title.getBoundingClientRect().top - from - 88
      const fits = offset + box.offsetHeight - named < window.innerHeight - 12
      const top = fits ? named : offset - Math.max(0, (window.innerHeight - box.offsetHeight) / 2)
      const st = triggerRef.current
      const sectionTop = st ? st.end : sectionRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: sectionTop + Math.max(0, top), behavior: 'instant' })
      return true
    }
    const onClick = (e) => {
      const link = e.target.closest?.(BOOK_LINKS)
      if (link && jump()) e.preventDefault()
    }
    document.addEventListener('click', onClick)

    // On arrival, wait for the fonts and the scroll triggers above to settle.
    // The pins above get measured again as images and fonts arrive, which
    // moves everything down, so land again after each re-measure for a few
    // seconds, until the visitor scrolls for themselves.
    let cancelled = false
    let settle = 0
    const moved = () => {
      cancelled = true
    }
    const again = () => !cancelled && jump()
    const MOVES = ['wheel', 'touchstart', 'keydown']
    if (MARKET_HASHES.includes(window.location.hash)) {
      window.history.scrollRestoration = 'manual'
      for (const type of MOVES) window.addEventListener(type, moved, { passive: true })
      ScrollTrigger.addEventListener('refresh', again)
      document.fonts.ready.then(() =>
        setTimeout(() => {
          if (cancelled) return
          ScrollTrigger.refresh()
          jump()
        }, 150)
      )
      settle = setTimeout(() => ScrollTrigger.removeEventListener('refresh', again), 4000)
    }
    return () => {
      cancelled = true
      clearTimeout(settle)
      ScrollTrigger.removeEventListener('refresh', again)
      for (const type of MOVES) window.removeEventListener(type, moved)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <section ref={sectionRef} id="interval" aria-labelledby="interval-title" className="relative scroll-mt-14 bg-theatre">
      {reduced && (
        <FilmFrame>
          <div className="relative h-[55svh]">
            <IntervalCard />
          </div>
        </FilmFrame>
      )}

      <Forecourt open={open} />

      {!reduced && <IntervalMove parts={move.current} />}
    </section>
  )
}

// Everything the move animates: the screen with the card, the house lights
// and the doors. It covers the first screen of the market and is gone once the
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
      {/* Round window, showing the dusk outside */}
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
        <En className="font-poster text-[clamp(0.8rem,1.3vw,1.1rem)] leading-none tracking-widest text-[#4a3208]">PUSH</En>
      </span>
      {/* Kick plate */}
      <span className="absolute inset-x-[5%] bottom-[3%] h-[9%] rounded-[3px] shadow-[0_-2px_4px_rgba(0,0,0,.35)]" style={brass} />
    </div>
  )
}

// Outside the doors: the market's name, the game box, and the stalls again
// as buttons. The game is never the whole screen; the page goes on around it.
function Forecourt({ open }) {
  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-5 px-4 pb-16 pt-24 sm:gap-6 sm:px-8"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 45% at 50% 35%, rgba(201,131,74,.22), transparent 70%), linear-gradient(180deg, #1c1230, #0b0705 55%)' }}
    >
      <header className="text-center">
        <p className="font-poster text-sm tracking-[0.3em] text-sandal">
          <span lang="kn" className="font-kn-display tracking-normal">ವಿರಾಮ</span>
          <En> · INTERVAL</En>
        </p>
        <h2 id="interval-title" className="mt-1 font-kn-card text-[clamp(2.2rem,8vw,3.6rem)] leading-tight text-arishina [text-shadow:0.05em_0.05em_0_#7e1424]">
          <span lang="kn">{MARKET.title.kn}</span>
          <En className="block font-poster text-[clamp(1.1rem,3.5vw,1.6rem)] leading-none tracking-[0.25em] text-gandha [text-shadow:none]">{MARKET.title.en}</En>
        </h2>
        <p className="mt-2 font-kn-body text-sm font-semibold text-gandha/80 sm:text-base">
          <span lang="kn" className="block">{MARKET.intro.kn}</span>
          <En className="block text-gandha/65">{MARKET.intro.en}</En>
        </p>
      </header>

      <MarketStage ready={open} />

      <Stalls />
    </div>
  )
}

// The stalls as plain buttons, for anyone who'd rather not play.
function Stalls() {
  const stalls = PLACES.filter((p) => p.kind)
  const ticket = 'relative flex min-h-14 items-center gap-3 rounded-sm px-5 py-2 text-left shadow-[0_0.5rem_1rem_rgba(0,0,0,.5)]'
  return (
    <ul aria-label="Stalls" className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {stalls.map((p) => (
        <li key={p.id}>
          {p.go ? (
            <Link
              to={p.go}
              onClick={() => window.history.replaceState(window.history.state, '', '#parva-sante')}
              className={cn(ticket, 'bg-arishina text-theatre transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-kumkuma motion-reduce:transition-none')}
            >
              <StallLabel place={p} />
              <span aria-hidden className="font-poster text-2xl leading-none">→</span>
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm opacity-40 mix-blend-multiply" style={paper} />
            </Link>
          ) : (
            <p className={cn(ticket, 'bg-[#3a2a20] text-gandha/70 ring-1 ring-gandha/20')}>
              <StallLabel place={p} soon />
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function StallLabel({ place, soon }) {
  return (
    <span>
      <span lang="kn" className="block font-kn-display text-lg font-extrabold leading-tight">
        {place.sign.kn}
        {soon && <span className="font-kn-body text-sm font-semibold"> · {MARKET.soon.kn}</span>}
      </span>
      <En className="block font-poster text-sm leading-none tracking-widest">{soon ? `${place.sign.en} · ${MARKET.soon.en}` : place.sign.en}</En>
    </span>
  )
}
