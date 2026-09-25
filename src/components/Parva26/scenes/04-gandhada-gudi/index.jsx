import { useEffect, useRef } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { FilmFrame } from '@p26/film/film-frame'
import { useFilmTick } from '@p26/film/film-layer'
import { createSandalStrip, frameRects, stripLayout } from '@p26/scenes/04-gandhada-gudi/sandal-strip'
import { gsap, useGSAP } from '@p26/lib/gsap'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// Captions are burned-in subtitles on each frame.
// TODO(content): Kannada captions, to be written and proofread by the club
// (allscenes.md, Scene 4). Until then the English shows whatever the
// subtitles setting.
const FRAMES = [
  {
    id: 'kaadu',
    kn: 'ಕಾಡು',
    en: 'The forest',
    caption: { kn: null, en: 'Karnataka has long been called ಗಂಧದ ಗುಡಿ, the temple of sandalwood, home to some of the world’s most prized sandalwood trees.' },
  },
  {
    id: 'kale',
    kn: 'ಕಲೆ',
    en: 'The craft',
    caption: {
      kn: null,
      en: 'Carvers turned the wood into boxes and figures. In 1916, the Mysore kingdom set up a factory to make soap from sandalwood oil, the start of Mysore Sandal soap.',
    },
  },
  {
    id: 'cinema',
    kn: 'ಸಿನಿಮಾ',
    en: 'The cinema',
    caption: {
      kn: null,
      en: 'The fragrance became a name. Kannada cinema is called Sandalwood. In 1973, the same year Mysore State became Karnataka, Dr. Rajkumar starred in Gandhada Gudi.',
    },
  },
]

// Share of the pinned scroll spent pulling the film; the rest holds on the
// last frame so its caption can be read.
const PULL = 0.75
const titleFont = (px, family = 'Akaya Kanadaka') => `${px}px "${family}"`

// Scene 4, ಗಂಧದ ಗುಡಿ · Why Sandalwood (allscenes.md). Inside the screen, a
// short length of film is pulled sideways by the scroll so each frame slides
// into the centre in turn: the forest, the carver's bench, the cinema. The
// agarbatti smoke from the bench crosses into the cinema frame and becomes
// its projector beam. With reduced motion the three frames are shown at once.
export function GandhadaGudiScene() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const overlaysRef = useRef([])
  const stripRef = useRef(null)
  const layoutRef = useRef(null)
  const progressRef = useRef(0)
  const visibleRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()

  const draw = (t = performance.now() / 1000) => {
    const strip = stripRef.current
    if (!strip) return
    const rects = strip.draw(progressRef.current, t, titleFont)
    rects.forEach((r, i) => {
      const el = overlaysRef.current[i]
      if (el) el.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`
    })
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    stripRef.current = createSandalStrip(canvas)
    let cancelled = false

    const layout = () => {
      const W = stage.clientWidth
      const L = stripLayout(W, window.innerHeight, reduced)
      layoutRef.current = L
      // Captions sit under the frames when the frames are small.
      stage.dataset.captions = L.still || L.small ? 'below' : 'inside'
      // Stacked frames on a phone set the stage's height themselves.
      if (L.column) {
        const last = frameRects(L, W, 0)[2]
        stage.style.height = `${last.y + L.fh + L.band + 170}px`
      } else {
        stage.style.height = ''
      }
      const H = stage.clientHeight
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_600_000 / (W * H)))
      canvas.width = Math.round(W * scale)
      canvas.height = Math.round(H * scale)
      stripRef.current.resize(L, scale)
      overlaysRef.current.forEach((el) => {
        if (!el) return
        el.style.width = `${L.fw}px`
        el.style.height = `${L.fh}px`
        el.style.setProperty('--band', `${L.band}px`)
      })
      drawRef.current()
    }

    // Draw once the lettering fonts are in, so the tiny title card and edge
    // codes don't paint in a fallback font.
    Promise.all([
      document.fonts.load('32px "Akaya Kanadaka"', 'ಗಂಧದ ಗುಡಿ'),
      document.fonts.load('32px "Baloo Tamma 2 Variable"', 'ಪರ್ವ ೨೬'),
    ]).finally(() => !cancelled && layout())
    layout()

    let timer = 0
    const sized = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(layout, 120)
    })
    sized.observe(stage)
    const seen = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    seen.observe(stage)
    return () => {
      cancelled = true
      clearTimeout(timer)
      sized.disconnect()
      seen.disconnect()
    }
  }, [reduced])

  // Scrolling pulls the film; the section holds while it does.
  useGSAP(
    () => {
      if (reduced) return
      const proxy = { p: 0 }
      gsap
        .timeline({
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=200%', pin: true, scrub: 0.6 },
        })
        .to(proxy, {
          p: 1,
          duration: PULL,
          ease: 'none',
          onUpdate: () => {
            progressRef.current = proxy.p
            drawRef.current()
          },
        })
        .to({}, { duration: 1 - PULL })
    },
    { dependencies: [reduced] }
  )

  // Mist, leaves, the carver's stroke and the lamp keep moving at the film
  // layer's pace while the scene is on screen.
  useFilmTick((now) => {
    if (visibleRef.current) drawRef.current(now / 1000)
  })

  return (
    <section ref={sectionRef} id="gandhada-gudi" aria-labelledby="gandhada-gudi-title" className="scroll-mt-14">
      <FilmFrame>
        <div ref={stageRef} className="group relative h-[calc(100svh-0.75rem)] overflow-hidden sm:h-[calc(100svh-1.5rem)]">
          <h2 id="gandhada-gudi-title" className="sr-only">
            <span lang="kn">ಗಂಧದ ಗುಡಿ</span> · Why Kannada cinema is called Sandalwood
          </h2>
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
          {FRAMES.map((frame, i) => (
            <article
              key={frame.id}
              ref={(el) => (overlaysRef.current[i] = el)}
              aria-label={frame.en}
              className="absolute left-0 top-0 [container-type:size]"
            >
              <h3 className="absolute left-[4%] top-[4%] text-left">
                <span lang="kn" className="block font-kn-card text-[11cqh] leading-none text-[#f5e6bf] [text-shadow:0_2px_0_rgba(0,0,0,.35),0_0_14px_rgba(0,0,0,.45)]">
                  {frame.kn}
                </span>
                <span className={cn('mt-[1cqh] block font-poster text-[3.6cqh] tracking-[0.2em] text-[#f5e6bf]/85 [text-shadow:0_1px_3px_rgba(0,0,0,.7)]', !subtitles && 'sr-only')}>
                  {frame.en}
                </span>
              </h3>
              <BurnedInCaption caption={frame.caption} subtitles={subtitles} />
            </article>
          ))}
        </div>
      </FilmFrame>
    </section>
  )
}

// Subtitles printed onto the film: off-white with a soft edge and a faint
// dark outline. When the frames are small (phones, or all three shown at
// once) they sit under the strip, where they can be big enough to read.
function BurnedInCaption({ caption, subtitles }) {
  const showEnglish = subtitles || !caption.kn
  return (
    <p className="absolute inset-x-[6%] bottom-[4%] text-center font-kn-body font-semibold leading-snug text-[#f6f0e2] [text-shadow:0_0_1px_#000,0_0_3px_rgba(0,0,0,.9),0_1px_5px_rgba(0,0,0,.8)] group-data-[captions=below]:inset-x-0 group-data-[captions=below]:bottom-auto group-data-[captions=below]:top-[calc(100%+var(--band)+0.9rem)]">
      {caption.kn && (
        <span lang="kn" className="block text-[4.6cqh] group-data-[captions=below]:text-[1.05rem]">
          {caption.kn}
        </span>
      )}
      <span lang="en" className={cn('block text-[4.1cqh] group-data-[captions=below]:text-[0.95rem]', !showEnglish && 'sr-only')}>
        {caption.en}
      </span>
    </p>
  )
}
