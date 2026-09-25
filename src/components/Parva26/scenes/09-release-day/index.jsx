import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { HOOMALE } from '@p26/content'
import { sayLine } from '@p26/chrome/subtitle-strip'
import { ParvaHero, Garland } from '@p26/scenes/09-release-day/samudrappa'
import { createPetalThrower } from '@p26/scenes/09-release-day/petals'
import { gsap, useGSAP } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import ironGate from '@p26/assets/textures/iron-gate.webp'

// Scene 9, ಬಿಡುಗಡೆ ದಿನ · Release Day (allscenes.md). Still the interval:
// out through the theatre's folding iron gate onto the street at night,
// where a giant painted cutout of Samudrappa, our police-officer hero,
// stands against the front wall on bamboo scaffolding, lit from below. Everyone throws flowers at
// it: tap the cutout, or the basket. A fan-club banner counts the flowers
// everyone has thrown, and your own. Every 1,000 the garland grows and a
// flag goes up; more serial lights come on as the count climbs; at 10,000
// there are fireworks and a thank-you banner. Below, the entrance: the
// second-half sign lights up and the bell rings.

const fmt = (n) => n.toLocaleString('en-IN')

// Serial light strings draped over the scaffolding, in its 0–100 box:
// start, end, and how far each one sags.
const STRINGS = [
  { from: [4, 10], to: [96, 10], sag: 10, n: 16 },
  { from: [4, 36], to: [96, 36], sag: 8, n: 16 },
  { from: [4, 62], to: [96, 62], sag: 7, n: 16 },
  { from: [4, 10], to: [50, 62], sag: 5, n: 10 },
]
const BULB_COLORS = ['#ffd24a', '#ff4b3e', '#ffd24a', '#ffe9a0']

// The shared count and your own. Your total is kept in this browser; the
// shared one will come from the server.
function useHoomale() {
  const [base] = useState(() => {
    const preview = Number(new URLSearchParams(window.location.search).get('hoomale'))
    return Number.isFinite(preview) && preview > 0 ? preview : HOOMALE.base
  })
  const [session, setSession] = useState(0)
  const [mine, setMine] = useState(() => {
    try {
      return Number(localStorage.getItem('parva26:flowers')) || 0
    } catch {
      return 0
    }
  })
  const recent = useRef([])
  const pending = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem('parva26:flowers', String(mine))
    } catch {
      // ignore: your count just won't be remembered
    }
  }, [mine])

  // TODO(backend): send `pending` to the server in one batch every few
  // seconds; until then the flowers are only counted here.
  useEffect(() => {
    const id = setInterval(() => {
      pending.current = 0
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const add = () => {
    const now = Date.now()
    recent.current = recent.current.filter((t) => now - t < 60_000)
    if (recent.current.length >= HOOMALE.perMinute) return
    recent.current.push(now)
    pending.current++
    setSession((s) => s + 1)
    setMine((m) => m + 1)
  }

  return { shared: base + session, mine, add }
}

export function ReleaseDayScene() {
  const stageRef = useRef(null)
  const heroRef = useRef(null)
  const boardRef = useRef(null)
  const canvasRef = useRef(null)
  const pileRef = useRef(null)
  const gateRef = useRef(null)
  const thrower = useRef(null)
  const holding = useRef(0)
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const { shared, mine, add } = useHoomale()
  const [live, setLive] = useState(false)
  const [flag, setFlag] = useState(null)
  const sections = Math.max(1, Math.min(10, Math.floor(shared / HOOMALE.milestone)))
  const strings = Math.min(STRINGS.length, 1 + Math.floor(shared / 2500))
  const done = shared >= HOOMALE.goal

  // Two canvases the size of the street: flying petals, and the pile.
  useEffect(() => {
    const stage = stageRef.current
    const phone = window.innerWidth < 640
    thrower.current = createPetalThrower(canvasRef.current, pileRef.current, { max: phone ? 80 : 150 })
    const layout = () => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_400_000 / (w * h)))
      thrower.current.resize(w, h, scale)
      const s = stage.getBoundingClientRect()
      const b = boardRef.current.getBoundingClientRect()
      const board = { left: b.left - s.left, right: b.right - s.left, top: b.top - s.top }
      const street = h * 0.93
      thrower.current.setGround((x) =>
        x > board.left + 6 && x < board.right - 6 ? board.top + 2 + Math.random() * 5 : street + Math.random() * (h - street - 8)
      )
    }
    layout()
    let timer = 0
    const sized = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(layout, 150)
    })
    sized.observe(stage)
    const seen = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting))
    seen.observe(stage)
    return () => {
      clearTimeout(timer)
      sized.disconnect()
      seen.disconnect()
      thrower.current.stop()
    }
  }, [])

  // Milestones reached while you're here: a flag on the banner, and at the
  // goal, fireworks over the theatre.
  const lastShared = useRef(shared)
  useEffect(() => {
    const before = lastShared.current
    lastShared.current = shared
    if (Math.floor(shared / HOOMALE.milestone) > Math.floor(before / HOOMALE.milestone)) {
      const reached = Math.floor(shared / HOOMALE.milestone) * HOOMALE.milestone
      setFlag(reached)
      const id = setTimeout(() => setFlag(null), 2800)
      if (before < HOOMALE.goal && shared >= HOOMALE.goal) celebrate()
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shared])

  // Arriving after the goal: one burst when the street first comes into view.
  const burst = useRef(false)
  useEffect(() => {
    if (live && done && !burst.current) {
      burst.current = true
      celebrate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, done])

  function celebrate() {
    if (reduced) return
    const w = stageRef.current.clientWidth
    const h = stageRef.current.clientHeight
    ;[0, 450, 900].forEach((ms, i) => setTimeout(() => thrower.current.fireworks(w * (0.3 + i * 0.2), h * (0.16 + (i % 2) * 0.08)), ms))
  }

  // A handful at (x, y) in the street's coordinates.
  const throwAt = (x, y) => {
    add()
    if (reduced) thrower.current.drop(4)
    else thrower.current.throwAt(x, y, window.innerWidth < 640 ? 5 : 7)
  }
  const aimAtHero = () => {
    const s = stageRef.current.getBoundingClientRect()
    const r = heroRef.current.getBoundingClientRect()
    return [r.left - s.left + r.width * (0.3 + Math.random() * 0.4), r.top - s.top + r.height * (0.12 + Math.random() * 0.32)]
  }
  // Holding down throws a steady stream.
  const startHold = (aim) => {
    stopHold()
    throwAt(...aim())
    holding.current = setInterval(() => throwAt(...aim()), 160)
  }
  const stopHold = () => {
    clearInterval(holding.current)
    holding.current = 0
  }
  useEffect(() => stopHold, [])

  const onHeroDown = (e) => {
    const el = e.currentTarget
    const s = stageRef.current.getBoundingClientRect()
    let x = e.clientX - s.left
    let y = e.clientY - s.top
    el.setPointerCapture(e.pointerId)
    const move = (ev) => {
      x = ev.clientX - s.left
      y = ev.clientY - s.top
    }
    const end = () => {
      stopHold()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
    startHold(() => [x, y])
  }

  // The folding gate slides aside as the street scrolls into view.
  useGSAP(
    () => {
      if (reduced) return
      const gate = gateRef.current
      gsap.fromTo(
        gate,
        { scaleX: 1 },
        {
          scaleX: 0.05,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'top 85%',
            end: 'top 10%',
            scrub: 0.4,
            onToggle: (self) => (gate.style.willChange = self.isActive ? 'transform' : ''),
          },
        }
      )
    },
    { dependencies: [reduced] }
  )

  return (
    <section id="release-day" aria-labelledby="release-day-title" className="relative scroll-mt-14 overflow-hidden bg-[#1b1530]">
      <h2 id="release-day-title" className="sr-only">
        <span lang="kn">ಬಿಡುಗಡೆ ದಿನ</span> · Release day: throw flowers at {HOOMALE.hero.en}
      </h2>
      <div ref={stageRef} className={cn('relative h-[100svh] min-h-[38rem] overflow-hidden', !live && '[&_*]:[animation-play-state:paused]')}>
        <NightStreet subtitles={subtitles} />

        {/* The cutout's box: scaffolding, its shadow on the wall, the hero */}
        <div className="absolute bottom-[23%] left-1/2 aspect-[424/624] h-[52%] -translate-x-1/2 sm:bottom-[13%] sm:h-[70%] lg:left-[30%] lg:h-[74%]">
          <ParvaHero silhouette="rgba(10,6,20,.45)" className="absolute inset-0 size-full origin-bottom translate-x-[6%] -translate-y-[6%] scale-[1.16]" />
          <Scaffolding strings={strings} />
          <div ref={heroRef} aria-hidden onPointerDown={onHeroDown} className="absolute inset-0 cursor-pointer touch-none select-none">
            <ParvaHero className="size-full" />
          </div>
          <Garland sections={sections} className="pointer-events-none absolute inset-0 size-full origin-[50%_41%] motion-safe:animate-garland-sway" />
        </div>

        <BaseBoard ref={boardRef} subtitles={subtitles} />
        <canvas ref={pileRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full" />
        <FocusLamps two={shared >= 5000} />

        <FanBanner shared={shared} mine={mine} flag={flag} done={done} subtitles={subtitles} onThrowStart={() => startHold(aimAtHero)} onThrowEnd={stopHold} onThrowOnce={() => throwAt(...aimAtHero())} />

        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-40 size-full" />
        {done && <ThankYouBanner subtitles={subtitles} reduced={reduced} />}

        {!reduced && (
          <div ref={gateRef} aria-hidden className="pointer-events-none absolute inset-0 z-50 origin-left" style={{ backgroundImage: `url(${ironGate})`, backgroundSize: '3rem 3rem' }}>
            <span className="absolute inset-x-0 top-0 h-3 bg-[#1c201e] shadow-[0_2px_4px_rgba(0,0,0,.6)]" />
            <span className="absolute inset-x-0 bottom-0 h-3 bg-[#1c201e]" />
          </div>
        )}
      </div>

      <SecondHalfSign subtitles={subtitles} />
    </section>
  )
}

// Night sky, the theatre's front wall lit from below, and the street.
function NightStreet({ subtitles }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 34% 8%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 58% 14%, #fff 0 1.2px, transparent 1.7px), radial-gradient(circle at 81% 6%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 90% 22%, #fff 0 .8px, transparent 1.3px), radial-gradient(circle at 70% 26%, #fff 0 .8px, transparent 1.3px), linear-gradient(180deg, #17122a, #2b2140 45%, #3b2c48)',
        }}
      />
      {/* Crescent moon */}
      <span className="absolute right-[12%] top-[9%] size-10 rounded-full shadow-[inset_-9px_4px_0_0_#f6ecc8] sm:size-14 sm:shadow-[inset_-13px_6px_0_0_#f6ecc8]" />
      {/* The front wall, lime-washed, warm where the cutout's lamps reach */}
      <div
        className="absolute inset-x-0 bottom-[7%] top-[20%]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 38% 70% at 42% 100%, rgba(255,214,150,.45), transparent 70%), repeating-linear-gradient(90deg, transparent 0 15%, rgba(0,0,0,.18) 15% 16.5%, transparent 16.5% 17%), linear-gradient(180deg, #5b4a36, #463826 60%, #3a2e20)',
        }}
      >
        <span className="absolute inset-x-0 top-0 h-3 bg-[#2e2418] shadow-[0_4px_8px_rgba(0,0,0,.4)]" />
      </div>
      {/* The theatre's name along the top of the wall, in bulb-lit letters */}
      <p className="absolute right-[4%] top-[22.5%] hidden text-right sm:block">
        <span lang="kn" className="block font-kn-card text-[clamp(1.6rem,3vw,2.6rem)] leading-none text-[#ffe6a8] [text-shadow:0_0_6px_rgba(255,200,90,.9),0_0_18px_rgba(255,170,60,.5)]">
          ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ
        </span>
        {subtitles && <span className="mt-1 block font-poster text-lg tracking-[0.3em] text-[#ffe6a8]/70">Sri Gandhada Gudi Chitramandira</span>}
      </p>
      {/* Street and kerb, under an orange street light */}
      <div
        className="absolute inset-x-0 bottom-0 h-[8%]"
        style={{ backgroundImage: 'linear-gradient(180deg, #6b6356 0 3px, #2a2622 3px, #1d1a17)' }}
      />
      <span className="absolute -left-[10%] bottom-0 h-[40%] w-[45%] bg-radial-[ellipse_at_30%_100%] from-[#ff9a3c]/25 to-transparent to-65%" />
    </div>
  )
}

// Bamboo poles tied with coir rope behind the cutout, and serial lights
// draped over them. More strings light up as the count grows.
function Scaffolding({ strings }) {
  const pole = (x) => (
    <g key={x}>
      <line x1={x} y1="0" x2={x} y2="100" stroke="#b89a5c" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      {[12, 30, 50, 70, 88].map((y) => (
        <line key={y} x1={x - 0.9} y1={y} x2={x + 0.9} y2={y} stroke="#7a6232" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  )
  const bar = (y) => <line key={y} x1="0" y1={y} x2="100" y2={y + 1.5} stroke="#a88c50" strokeWidth="2" vectorEffect="non-scaling-stroke" />
  return (
    <div aria-hidden className="absolute -inset-x-[16%] -top-[6%] bottom-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {[4, 50, 96].map(pole)}
        {[10, 36, 62, 88].map(bar)}
        <line x1="4" y1="88" x2="50" y2="36" stroke="#a88c50" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        <line x1="96" y1="88" x2="50" y2="36" stroke="#a88c50" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {[4, 50, 96].flatMap((x) =>
          [10, 36, 62, 88].map((y) => <rect key={`${x}-${y}`} x={x - 1.2} y={y - 0.9} width="2.4" height="2.4" fill="#6b4a22" />)
        )}
      </svg>
      {STRINGS.map((s, i) => (
        <LightString key={i} {...s} on={i < strings} />
      ))}
    </div>
  )
}

function LightString({ from, to, sag, n, on }) {
  const bulbs = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = from[0] + (to[0] - from[0]) * t
    const y = from[1] + (to[1] - from[1]) * t + sag * 4 * t * (1 - t)
    bulbs.push(
      <span
        key={i}
        className={cn('absolute size-1.5 -translate-1/2 rounded-full sm:size-2', on && 'motion-safe:animate-twinkle')}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          backgroundColor: on ? BULB_COLORS[i % BULB_COLORS.length] : '#3a2a1a',
          boxShadow: on ? `0 0 6px 2px ${BULB_COLORS[i % BULB_COLORS.length]}99` : 'none',
          animationDelay: `${-((i * 0.37) % 1.6)}s`,
        }}
      />
    )
  }
  return bulbs
}

// The painted board at the cutout's feet.
function BaseBoard({ ref, subtitles }) {
  return (
    <div ref={ref} className="absolute bottom-[13%] left-1/2 z-10 w-[min(88%,24rem)] -translate-x-1/2 sm:bottom-[5%] lg:left-[30%] lg:w-[min(30%,26rem)]">
      <div
        className="relative rounded-[3px] border-[3px] border-[#1d1a17] bg-arishina px-3 py-1.5 text-center shadow-[0_8px_14px_rgba(0,0,0,.5)]"
        style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 32%, rgba(0,0,0,.12) 32% 33.5%, transparent 33.5% 66%)' }}
      >
        <p lang="kn" className="font-kn-display text-2xl font-extrabold leading-tight text-kumkuma sm:text-3xl">
          {HOOMALE.hero.kn}
        </p>
        <p lang="kn" className="font-kn-display text-sm font-bold leading-tight text-[#1d1a17] sm:text-base">
          ಪರ್ವ ಬಿಡುಗಡೆ ದಿನ · ಅಭಿಮಾನಿಗಳ ಹಾರ್ದಿಕ ಸ್ವಾಗತ
        </p>
        {subtitles && <p className="font-poster text-sm leading-tight tracking-wider text-[#1d1a17]/80">{HOOMALE.hero.en} · Parva release day · A warm welcome from the fans</p>}
      </div>
      {/* Legs */}
      <span aria-hidden className="absolute -bottom-3 left-[12%] h-3 w-2 bg-[#4a2c14]" />
      <span aria-hidden className="absolute -bottom-3 right-[12%] h-3 w-2 bg-[#4a2c14]" />
    </div>
  )
}

// Focus lamps on the street, pointing up at the hero's face. A second one
// comes on at 5,000 flowers.
function FocusLamps({ two }) {
  const lamp = (at, tilt) => (
    <div className={cn('absolute bottom-[7.5%] z-30', at)}>
      <span
        className="absolute bottom-full left-1/2 h-[60vh] w-[26vh] -translate-x-1/2 origin-bottom opacity-60"
        style={{ rotate: `${tilt}deg`, clipPath: 'polygon(44% 100%, 56% 100%, 100% 0, 0 0)', backgroundImage: 'linear-gradient(0deg, rgba(255,236,190,.35), rgba(255,236,190,0) 80%)' }}
      />
      <span className="relative block h-4 w-7 rounded-t-[6px] bg-[#141414] shadow-[0_-2px_8px_rgba(255,220,150,.7)]" style={{ rotate: `${tilt}deg` }} />
      <span className="mx-auto block h-2 w-1.5 bg-[#141414]" />
    </div>
  )
  return (
    <div aria-hidden className="pointer-events-none">
      <div className="absolute inset-x-0 bottom-0 lg:left-[30%] lg:right-auto">
        {lamp('left-1/2 -translate-x-[180%] lg:left-0 lg:-translate-x-[170%]', 8)}
        {two && lamp('left-1/2 translate-x-[80%] lg:left-0 lg:translate-x-[90%]', -8)}
      </div>
    </div>
  )
}

// The fan-club banner between two bamboo poles: the shared count, your own,
// the milestone flag, and the basket you throw from.
// On a phone the banner sits at the top and the basket at the bottom of the
// street, in thumb reach; from a tablet up the basket hangs under the banner.
function FanBanner({ shared, mine, flag, done, subtitles, onThrowStart, onThrowEnd, onThrowOnce }) {
  return (
    <div className="contents sm:absolute sm:right-[5%] sm:top-[33%] sm:z-30 sm:flex sm:w-[min(24rem,38%)] sm:flex-col sm:items-end">
      <div className="absolute inset-x-3 top-[4.6rem] z-30 px-3 sm:static sm:w-full sm:px-5">
        {/* Poles */}
        <span aria-hidden className="absolute -top-4 bottom-[-60vh] left-0 hidden w-2.5 rounded-full sm:block" style={{ backgroundImage: 'linear-gradient(90deg, #8a7040, #d8bd7c 45%, #9a7e46)' }} />
        <span aria-hidden className="absolute -top-4 bottom-[-60vh] right-0 hidden w-2.5 rounded-full sm:block" style={{ backgroundImage: 'linear-gradient(90deg, #8a7040, #d8bd7c 45%, #9a7e46)' }} />
        <div
          className="relative rounded-[2px] border-y-[6px] border-kumkuma bg-[#f6eedb] px-3 pb-3 pt-2 text-center text-[#1d1a17] shadow-[0_10px_20px_rgba(0,0,0,.45)] sm:px-4"
          style={{ ...paper, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 75% 97%, 50% 100%, 25% 97%, 0 100%)' }}
        >
          <p lang="kn" className="font-kn-display text-sm font-bold leading-tight text-kumkuma">
            {HOOMALE.hero.kn} ಅಭಿಮಾನಿಗಳ ಸಂಘ
          </p>
          {subtitles && <p className="font-poster text-xs leading-tight tracking-[0.2em] text-kumkuma/80">{HOOMALE.hero.en} fans’ association</p>}
          <p className="flex items-baseline justify-center gap-3 sm:block">
            <span lang="kn" className="font-kn-display text-2xl font-extrabold leading-tight sm:block sm:text-4xl">
              ಹೂಮಳೆ
            </span>
            <span className="font-kn-display text-3xl font-extrabold leading-none text-kumkuma sm:mt-1 sm:block sm:text-5xl" aria-live="polite">
              {fmt(shared)}
            </span>
          </p>
          <p className={cn('text-sm font-semibold leading-tight sm:text-base', !subtitles && 'sr-only')}>flowers so far</p>
          <p className="mt-1 text-base font-semibold leading-tight">
            <span lang="kn" className="font-kn-display">
              ನಿಮ್ಮ ಹೂವು
            </span>
            {subtitles && <span> · Your flowers</span>}: <span className="font-bold">{fmt(mine)}</span>
          </p>
          {/* On a phone the thank-you goes on the banner, clear of the hero */}
          {done && (
            <p className="-mx-3 mt-2 bg-kumkuma px-2 py-1 text-[#fff4dc] sm:hidden">
              <span lang="kn" className="font-kn-display text-base font-bold">
                ಧನ್ಯವಾದ ಅಭಿಮಾನಿಗಳೇ!
              </span>
              {subtitles && <span className="block text-sm font-semibold">10,000 flowers! Thank you, fans</span>}
            </p>
          )}
          {flag && (
            <span className="absolute -right-2 -top-3 rotate-[8deg] bg-kumkuma px-2 py-0.5 font-kn-display text-lg font-extrabold text-[#fff4dc] shadow-[0_3px_6px_rgba(0,0,0,.4)] motion-safe:animate-tag-swing">
              {fmt(flag)}!
            </span>
          )}
        </div>
      </div>

      {/* The basket: tap to throw, hold for a stream */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          onThrowStart()
        }}
        onPointerUp={onThrowEnd}
        onPointerCancel={onThrowEnd}
        onClick={(e) => e.detail === 0 && onThrowOnce()}
        data-en="Throw flowers (hold for more)"
        className="group absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 touch-none select-none items-end gap-3 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina sm:static sm:mr-6 sm:mt-5 sm:translate-x-0"
      >
        <Basket />
        <span className="mb-1 whitespace-nowrap rounded-[3px] bg-arishina px-3 py-2 text-left text-theatre shadow-[0_4px_8px_rgba(0,0,0,.45)] transition-transform group-active:translate-y-0.5">
          <span lang="kn" className="block font-kn-display text-xl font-extrabold leading-none">
            ಹೂ ಎಸೆಯಿರಿ
          </span>
          {subtitles && <span className="mt-0.5 block font-poster text-base leading-none tracking-wider">Throw flowers</span>}
        </span>
      </button>
    </div>
  )
}

// A woven bamboo basket heaped with marigold, rose and jasmine.
function Basket() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden className="w-16 drop-shadow-[0_6px_6px_rgba(0,0,0,.5)] transition-transform group-hover:-rotate-3 group-active:scale-95 sm:w-20">
      {[
        [18, 22, '#f08a1c'],
        [30, 16, '#f7c21e'],
        [42, 14, '#f08a1c'],
        [54, 17, '#c8102e'],
        [62, 23, '#f7c21e'],
        [24, 26, '#fbf8ef'],
        [36, 22, '#e86a10'],
        [48, 22, '#f7c21e'],
        [58, 27, '#f08a1c'],
        [40, 27, '#fbf8ef'],
      ].map(([cx, cy, fill]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="7" fill={fill} stroke="#7a3a08" strokeWidth="1" />
      ))}
      <path d="M8 28 L72 28 L64 60 L16 60 Z" fill="#c9a060" stroke="#6b4a22" strokeWidth="2" />
      {[36, 44, 52].map((y) => (
        <path key={y} d={`M${10 + (y - 28) / 4} ${y} L${70 - (y - 28) / 4} ${y}`} stroke="#8a6a36" strokeWidth="2" />
      ))}
      {[20, 30, 40, 50, 60].map((x) => (
        <path key={x} d={`M${x} 28 L${40 + (x - 40) * 0.75} 60`} stroke="#8a6a36" strokeWidth="1.6" />
      ))}
      <path d="M6 28 L74 28" stroke="#6b4a22" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

// At 10,000 flowers a painted banner unrolls across the top.
function ThankYouBanner({ subtitles, reduced }) {
  return (
    <div
      className={cn('absolute right-[4%] top-[10%] z-40 hidden w-[min(40rem,50%)] origin-top sm:block', !reduced && 'motion-safe:animate-unroll')}
    >
      <p className="rounded-[2px] border-y-4 border-arishina bg-kumkuma px-4 py-2 text-center text-[#fff4dc] shadow-[0_10px_20px_rgba(0,0,0,.5)]">
        <span lang="kn" className="block font-kn-display text-xl font-extrabold leading-tight lg:text-2xl">
          10,000 ಹೂವು! ಧನ್ಯವಾದ ಅಭಿಮಾನಿಗಳೇ
        </span>
        {subtitles && <span className="block font-poster text-base tracking-[0.2em] lg:text-lg">10,000 flowers! Thank you, fans</span>}
      </p>
    </div>
  )
}

// The theatre's entrance: when you reach it, the second-half sign lights up
// and the bell rings. The next scene plays on the screen again.
function SecondHalfSign({ subtitles }) {
  const ref = useRef(null)
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const seen = new IntersectionObserver(
      ([entry]) => {
        setLit(entry.isIntersecting)
        if (entry.isIntersecting) sayLine('[Second bell rings]', 3000)
      },
      { threshold: 0.6 }
    )
    seen.observe(ref.current)
    return () => seen.disconnect()
  }, [])
  const bulbs = useMemo(() => Array.from({ length: 18 }, (_, i) => i), [])
  return (
    <div className="relative flex min-h-[55svh] flex-col items-center justify-end overflow-hidden px-4 pb-0 pt-16" style={{ backgroundImage: 'linear-gradient(180deg, #1d1a17, #2a2218 60%, #3a2e20)' }}>
      <div ref={ref} className="relative z-10 mb-8 rounded-[4px] border-[3px] border-[#1d1a17] bg-[#2a1a10] px-8 py-4 text-center shadow-[0_10px_20px_rgba(0,0,0,.6)]">
        {bulbs.map((i) => (
          <span
            key={i}
            aria-hidden
            className={cn('absolute size-2 rounded-full transition-[background-color,box-shadow] duration-500', lit ? 'bg-[#ffe6a0] shadow-[0_0_6px_2px_rgba(255,210,120,.8)]' : 'bg-[#4a3a26]')}
            style={i < 9 ? { top: -5, left: `${6 + i * 11}%`, transitionDelay: `${i * 40}ms` } : { bottom: -5, left: `${6 + (i - 9) * 11}%`, transitionDelay: `${i * 40}ms` }}
          />
        ))}
        <p
          lang="kn"
          className={cn(
            'font-kn-display text-3xl font-extrabold leading-tight transition-[color,text-shadow] duration-700 sm:text-4xl',
            lit ? 'text-[#ffe6a8] [text-shadow:0_0_8px_rgba(255,200,90,.9),0_0_22px_rgba(255,160,60,.5)]' : 'text-[#6b5a40]'
          )}
        >
          ದ್ವಿತೀಯಾರ್ಧ ಆರಂಭ
        </p>
        <p className={cn('font-poster text-lg tracking-[0.25em] transition-colors duration-700', lit ? 'text-[#ffe6a8]/80' : 'text-[#6b5a40]', !subtitles && 'sr-only')}>
          The second half is starting
        </p>
      </div>
      {/* The entrance, warm inside, with the gate folded to one side */}
      <div aria-hidden className="relative h-40 w-[min(90%,34rem)] rounded-t-[1.5rem] bg-[#140c08] shadow-[0_0_40px_10px_rgba(255,190,110,.18)] sm:h-52" style={{ backgroundImage: 'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(255,196,120,.55), transparent 70%)' }}>
        <span className="absolute inset-y-0 left-0 w-6" style={{ backgroundImage: `url(${ironGate})`, backgroundSize: '0.9rem 3rem' }} />
        <span className="absolute inset-y-0 right-0 w-6" style={{ backgroundImage: `url(${ironGate})`, backgroundSize: '0.9rem 3rem' }} />
        <span className="absolute inset-x-0 bottom-0 h-2" style={brass} />
      </div>
    </div>
  )
}
