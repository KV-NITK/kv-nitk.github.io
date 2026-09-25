import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { HOOMALE } from '@p26/content'
import { ParvaHero, Garland } from '@p26/scenes/09-release-day/samudrappa'
import { createPetalThrower } from '@p26/scenes/09-release-day/petals'
import { gsap, useGSAP } from '@p26/lib/gsap'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { useOnScreen, PAUSED } from '@p26/lib/on-screen'
import { willChange } from '@p26/lib/layers'
import { cn } from '@/lib/utils'
import ironGate from '@p26/assets/textures/iron-gate.webp'
import { useHoomale } from '@p26/scenes/09-release-day/use-hoomale'
import { NightStreet } from '@p26/scenes/09-release-day/street'
import { STRINGS, Scaffolding } from '@p26/scenes/09-release-day/scaffolding'
import { BaseBoard, FocusLamps } from '@p26/scenes/09-release-day/set-pieces'
import { FanBanner } from '@p26/scenes/09-release-day/fan-banner'
import { ThankYouBanner, SecondHalfSign } from '@p26/scenes/09-release-day/signs'

// Scene 9, ಬಿಡುಗಡೆ ದಿನ · Release Day (allscenes.md). Still the interval:
// out through the theatre's folding iron gate onto the street at night,
// where a giant painted cutout of Samudrappa, our police-officer hero,
// stands against the front wall on bamboo scaffolding, lit from below. Everyone throws flowers at
// it: tap the cutout, or the basket. A fan-club banner counts the flowers
// everyone has thrown, and your own. Every 1,000 the garland grows and a
// flag goes up; more serial lights come on as the count climbs; at 10,000
// there are fireworks and a thank-you banner. Below, the entrance: the
// second-half sign lights up and the bell rings.

export function ReleaseDayScene() {
  const stageRef = useRef(null)
  const heroRef = useRef(null)
  const boardRef = useRef(null)
  const canvasRef = useRef(null)
  const pileRef = useRef(null)
  const gateRef = useRef(null)
  const thrower = useRef(null)
  const holding = useRef(0)
  const live = useOnScreen(stageRef)
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const { shared, mine, add } = useHoomale()
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
    return () => {
      clearTimeout(timer)
      sized.disconnect()
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
            onToggle: (self) => willChange([gate], self.isActive && 'transform'),
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
      <div ref={stageRef} className={cn('relative h-[100svh] min-h-[38rem] overflow-hidden', !live && PAUSED)}>
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
