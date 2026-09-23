import { useEffect, useRef } from 'react'
import { TitleCard } from './title-card'
import { ShowBoard } from './show-board'
import { SeatRow } from './seat-tickets'
import { createForest } from './fx/forest'
import { useFilmScreen, useFilmTick } from './fx/film-layer'
import { gsap } from './fx/gsap'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'

// Scene 2, the title card (brief, Scene 2). You sit a few rows back: the
// silver screen plays the title film, the show board hangs on the right
// pillar, and the seat in front holds the three tickets. Moving the mouse
// shifts the screen least and the seats most, which gives the room depth.
// The arch, walls, audience and projector beam arrive with the theatre set.
export function TitleScene() {
  const sectionRef = useRef(null)
  const screenRef = useRef(null)
  const boardRef = useRef(null)
  const seatsRef = useRef(null)

  useMouseParallax(sectionRef, [
    [screenRef, 6],
    [boardRef, 14],
    [seatsRef, 28],
  ])

  return (
    <section ref={sectionRef} id="title" className="relative isolate flex min-h-svh scroll-mt-14 flex-col overflow-hidden bg-[#0b0705] pt-16 sm:pt-20">
      {/* The lit screen is the room's light: a warm spill on the wall around it */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[80%] bg-radial-[ellipse_60%_55%_at_50%_38%] from-[#7a5230]/45 via-[#3a2414]/20 via-55% to-transparent" />

      <div ref={screenRef} className="relative mx-auto w-[calc(100%-1.25rem)] lg:w-[min(66vw,104svh)]">
        <SilverScreen />
      </div>

      <div
        ref={boardRef}
        className="relative mx-auto mt-3 w-[min(100%-2rem,20rem)] lg:absolute lg:right-[calc((100vw-min(66vw,104svh))/4)] lg:top-[24svh] lg:mt-0 lg:w-[clamp(12.5rem,15vw,15rem)] lg:translate-x-1/2"
      >
        <ShowBoard />
      </div>

      <div ref={seatsRef} className="relative mt-auto pt-6">
        <SeatRow />
      </div>
    </section>
  )
}

// A curved screen seen from the seats: the sides are nearer, so the top and
// bottom edges bow in toward the middle. Percentages keep it responsive.
const CURVE = (() => {
  const sag = 1.4
  const top = []
  const bottom = []
  for (let i = 0; i <= 16; i++) {
    const x = (i / 16) * 100
    const y = sag * (1 - ((2 * i) / 16 - 1) ** 2)
    top.push(`${x}% ${y}%`)
    bottom.unshift(`${x}% ${100 - y}%`)
  }
  return `polygon(${[...top, ...bottom].join(', ')})`
})()

// Black masking around a silver screen. The projected film covers all but a
// thin margin of silver lit by the projector's spill, and the screen's fine
// perforations show only near the edges, where the image is dimmest.
function SilverScreen() {
  const screenRef = useRef(null)
  useFilmScreen(screenRef)

  return (
    <div className="bg-[#050302] p-[0.7%] lg:p-[0.9%]" style={{ clipPath: CURVE }}>
      <div
        ref={screenRef}
        className="@container relative aspect-[6/5] bg-radial from-[#efe6d6] to-[#a9adb4] sm:aspect-[16/9] lg:aspect-[2/1]"
        style={{ clipPath: CURVE }}
      >
        <ForestFilm className="absolute inset-[1.1%] size-[97.8%]" />
        <TitleCard />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial from-transparent from-50% to-black/40" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,.4)_.7px,transparent_1.1px)] bg-size-[4px_4px] [mask-image:radial-gradient(ellipse_at_center,transparent_62%,#000_100%)]"
        />
      </div>
    </div>
  )
}

// The painted forest (fx/forest.js) on a canvas sized to the screen. It is
// redrawn on the film layer's tick while it is on screen, and holds still
// with reduced motion.
function ForestFilm({ className }) {
  const canvasRef = useRef(null)
  const forestRef = useRef(null)
  const visibleRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    let timer = 0
    let width = 0

    const setup = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || Math.round(rect.width) === width) return
      width = Math.round(rect.width)
      // The projected image is soft anyway, so cap the pixel count: it keeps
      // the per-frame cost flat on large and high-density screens.
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(480_000 / (rect.width * rect.height)))
      canvas.width = Math.round(rect.width * scale)
      canvas.height = Math.round(rect.height * scale)
      forestRef.current = createForest(canvas)
      forestRef.current.draw(performance.now() / 1000)
    }

    setup()
    const resize = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(setup, 150)
    })
    resize.observe(canvas)
    const seen = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    seen.observe(canvas)

    return () => {
      clearTimeout(timer)
      resize.disconnect()
      seen.disconnect()
    }
  }, [])

  useFilmTick((now) => {
    if (visibleRef.current) forestRef.current?.draw(now / 1000)
  })

  return <canvas ref={canvasRef} aria-hidden className={className} />
}

// Moves each layer against the mouse by up to `depth` pixels. Desktop only,
// and only while the section is on screen.
function useMouseParallax(sectionRef, layers) {
  const reduced = usePrefersReducedMotion()
  const layersRef = useRef(layers)

  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const movers = layersRef.current.map(([ref, depth]) => ({
      depth,
      x: gsap.quickTo(ref.current, 'x', { duration: 0.9, ease: 'power3' }),
      y: gsap.quickTo(ref.current, 'y', { duration: 0.9, ease: 'power3' }),
    }))
    let inView = true
    const seen = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    seen.observe(sectionRef.current)

    const onMove = (e) => {
      if (!inView) return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      for (const m of movers) {
        m.x(-nx * m.depth)
        m.y(-ny * m.depth * 0.35)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      seen.disconnect()
      for (const [ref] of layersRef.current) gsap.set(ref.current, { clearProps: 'transform' })
    }
  }, [reduced, sectionRef])
}
