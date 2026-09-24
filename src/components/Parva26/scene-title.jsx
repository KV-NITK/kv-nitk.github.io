import { useEffect, useRef } from 'react'
import { TitleCard } from './title-card'
import { ShowBoard } from './show-board'
import { SeatRow } from './seat-tickets'
import { NameBoard } from './name-board'
import { Proscenium } from './proscenium'
import { TheatreWalls } from './theatre-walls'
import { Audience } from './audience'
import { createForest } from './fx/forest'
import { createAir } from './fx/air'
import { useFilmScreen, useFilmTick } from './fx/film-layer'
import { gsap, useGSAP } from './fx/gsap'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'

// Scene 2, the title card, inside the theatre of Scene 1 (brief, Scenes 1–2).
// You sit about eight rows back: the silver screen plays the title film inside
// the carved arch under the name board, the show board hangs on the right
// pillar, the projector beam fills the air over the audience, and the seat in
// front holds the three tickets.
//
// Moving the mouse shifts each layer by its depth: the screen least, the arch
// more, the audience and seats most. The first scroll pushes the camera in
// over the seats until the screen fills the width of the page, and every scene
// after that plays on screen. Scrolling back pulls the camera out again.
export function TitleScene() {
  const sectionRef = useRef(null)
  const roomRef = useRef(null)
  const wallsRef = useRef(null)
  const stageRef = useRef(null)
  const screenRef = useRef(null)
  const maskRef = useRef(null)
  const boardRef = useRef(null)
  const airRef = useRef(null)
  const seatsRef = useRef(null)
  const seatsDepthRef = useRef(null)
  const audienceRef = useRef(null)

  useMouseParallax(sectionRef, [
    [wallsRef, 12],
    [stageRef, 10],
    // Inside the arch, so relative to it: the screen ends up moving least.
    [screenRef, -5],
    [boardRef, 14],
    [airRef, 9],
    [seatsDepthRef, 28],
    [audienceRef, -7],
  ])
  useCameraPush({ sectionRef, roomRef, maskRef, seatsRef })
  useScreenBottom(maskRef)

  return (
    <section ref={sectionRef} id="title" className="relative isolate flex min-h-svh scroll-mt-14 flex-col overflow-hidden bg-[#0b0705]">
      <div ref={roomRef} className="relative flex flex-1 flex-col">
        {/* The lit screen is the room's main light: a warm spill around the stage */}
        <div aria-hidden data-fade className="pointer-events-none absolute inset-x-0 top-0 h-[85%] bg-radial-[ellipse_55%_60%_at_50%_40%] from-[#6e4a2a]/40 via-[#3a2414]/15 via-55% to-transparent" />
        <TheatreWalls ref={wallsRef} />

        <div ref={stageRef} className="relative mx-auto flex w-[calc(100%-1.25rem)] flex-col items-center pt-[4.3rem] lg:w-auto lg:pt-[3.9rem]">
          <NameBoard data-fade className="z-10 w-full max-w-[26rem] lg:w-[min(34rem,46vw)] lg:max-w-none" />
          <div className="mt-[1.4rem] w-full lg:mt-[2.7rem]">
            <Proscenium>
              <div ref={screenRef} className="w-full lg:w-[min(50vw,72svh)]">
                <SilverScreen ref={maskRef} />
              </div>
            </Proscenium>
          </div>
        </div>

        <div
          ref={boardRef}
          data-fade
          className="relative mx-auto my-auto w-[min(100%-2rem,22rem)] py-3 lg:absolute lg:left-[90.5%] lg:top-[26svh] lg:my-0 lg:w-[clamp(12.5rem,14.5vw,15rem)] lg:-translate-x-1/2 lg:py-0"
        >
          <ShowBoard />
        </div>

        <AirCanvas ref={airRef} screenRef={maskRef} />
      </div>

      {/* --seat: how much of the seat in front shows below its rail;
          --peek: how far the tickets stand above it */}
      <div ref={seatsRef} className="relative pt-2 [--peek:5.25rem] [--seat:5.25rem] sm:[--peek:6.75rem] sm:[--seat:clamp(7rem,20svh,13rem)]">
        <div ref={seatsDepthRef}>
          <div ref={audienceRef} className="absolute inset-x-0 bottom-[var(--seat)]">
            <Audience className="bottom-0" />
          </div>
          <SeatRow />
        </div>
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
function SilverScreen({ ref }) {
  const screenRef = useRef(null)
  useFilmScreen(screenRef)

  return (
    <div ref={ref} className="bg-[#050302] p-[0.7%] lg:p-[0.9%]" style={{ clipPath: CURVE }}>
      <div
        ref={screenRef}
        className="relative aspect-[6/5] max-h-[min(38svh,calc(100svh-31rem))] w-full bg-radial from-[#efe6d6] to-[#a9adb4] [container-type:size] sm:aspect-[16/9] sm:max-h-none lg:aspect-[2/1]"
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

// The beam, smoke, dust and fans (fx/air.js) on a half-resolution canvas over
// the room. Painted on the film layer's tick while the hall is on screen.
function AirCanvas({ ref, screenRef }) {
  const canvasRef = useRef(null)
  const airRef = useRef(null)
  const pointerRef = useRef(null)
  const visibleRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    // Half resolution: the air is all soft light.
    const resize = () => {
      canvas.width = Math.round(canvas.offsetWidth * 0.5)
      canvas.height = Math.round(canvas.offsetHeight * 0.5)
      airRef.current = createAir(canvas)
    }
    resize()
    const sized = new ResizeObserver(resize)
    sized.observe(canvas)
    const seen = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    seen.observe(canvas)
    const onMove = (e) => {
      pointerRef.current = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      sized.disconnect()
      seen.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  useFilmTick((now) => {
    const canvas = canvasRef.current
    if (!visibleRef.current || !airRef.current || !screenRef.current) return
    const box = canvas.getBoundingClientRect()
    const k = canvas.width / box.width
    const s = screenRef.current.getBoundingClientRect()
    const p = pointerRef.current
    airRef.current.draw(now / 1000, {
      screen: { x: (s.left - box.left) * k, y: (s.top - box.top) * k, w: s.width * k, h: s.height * k },
      pointer: p && { x: (p.x - box.left) * k, y: (p.y - box.top) * k },
      fansInView: window.innerWidth >= 1024,
    })
  })

  return (
    <div ref={ref} data-fade aria-hidden className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

// Moves each layer against the mouse by up to `depth` pixels, and slides the
// lamp-light on the carvings the other way. Desktop only, and only while the
// section is on screen.
function useMouseParallax(sectionRef, layers) {
  const reduced = usePrefersReducedMotion()
  const layersRef = useRef(layers)

  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const section = sectionRef.current
    const layers = layersRef.current.map(([ref, depth]) => [ref.current, depth])
    const movers = layers.map(([el, depth]) => ({
      depth,
      x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }),
    }))
    const lamps = section.querySelectorAll('[data-lamp]')
    const lampX = lamps.length ? gsap.quickTo(lamps, 'x', { duration: 1.4, ease: 'power2' }) : () => {}
    let inView = true
    const seen = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    seen.observe(section)

    const onMove = (e) => {
      if (!inView) return
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      for (const m of movers) {
        m.x(-nx * m.depth)
        m.y(-ny * m.depth * 0.35)
      }
      lampX(nx * 60)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      seen.disconnect()
      gsap.set([...layers.map(([el]) => el), ...lamps], { clearProps: 'transform' })
    }
  }, [reduced, sectionRef])
}

// Publishes how far the screen's foot is from the bottom of the window as
// --p26-screen-bottom, so the subtitle strip can sit on the screen.
// Measured every frame while the hall is in view, because the camera push
// keeps easing after the scroll events stop.
function useScreenBottom(maskRef) {
  useEffect(() => {
    const root = document.documentElement
    const mask = maskRef.current
    let inView = true
    let last = null
    const update = () => {
      if (!inView) return
      const value = Math.round(window.innerHeight - mask.getBoundingClientRect().bottom + 14)
      if (value !== last) root.style.setProperty('--p26-screen-bottom', `${(last = value)}px`)
    }
    const seen = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    seen.observe(mask)
    update()
    gsap.ticker.add(update)
    return () => {
      gsap.ticker.remove(update)
      seen.disconnect()
      root.style.removeProperty('--p26-screen-bottom')
    }
  }, [maskRef])
}

// The first scroll leans the camera in: the hall scales about the screen until
// the screen (with its black masking) spans the page, the seats and audience
// sink out of view, and everything but the screen fades into the dark. The
// section stays pinned while it happens; scrolling back plays it in reverse.
function useCameraPush({ sectionRef, roomRef, maskRef, seatsRef }) {
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const room = roomRef.current
      // Where the screen sits in the hall, ignoring the push already applied.
      const measure = () => {
        const scale = gsap.getProperty(room, 'scaleX') || 1
        const r = room.getBoundingClientRect()
        const m = maskRef.current.getBoundingClientRect()
        const w = m.width / scale
        const cx = (m.left - r.left) / scale + w / 2
        const cy = (m.top - r.top) / scale + m.height / scale / 2
        return { w, cx, cy }
      }

      gsap
        .timeline({
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=80%', pin: true, scrub: 0.5, invalidateOnRefresh: true },
        })
        .to(
          room,
          {
            transformOrigin: () => {
              const { cx, cy } = measure()
              return `${cx}px ${cy}px`
            },
            scale: () => window.innerWidth / measure().w,
            x: () => window.innerWidth / 2 - measure().cx,
            y: () => window.innerHeight / 2 - measure().cy,
            ease: 'power2.in',
          },
          0
        )
        .to(seatsRef.current, { yPercent: 130, ease: 'power2.in' }, 0)
        .to(seatsRef.current, { autoAlpha: 0, ease: 'power1.in', duration: 0.5 }, 0.5)
        .to(room.querySelectorAll('[data-fade]'), { autoAlpha: 0, ease: 'power1.in', duration: 0.8 }, 0.1)
    },
    { dependencies: [reduced] }
  )
}
