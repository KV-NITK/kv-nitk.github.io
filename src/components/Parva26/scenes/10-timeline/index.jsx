import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { TIMELINE } from '@p26/content'
import { toKannadaDigits } from '@p26/lib/text'
import { EraCard } from '@p26/scenes/10-timeline/era-cards'
import { FilmFrame } from '@p26/film/film-frame'
import { gsap, useGSAP } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// Scene 10, ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ · Sandalwood through the years (allscenes.md).
// The start of the second half, back on the screen. The shot is the
// projection booth's rewind bench: a strip of film between two metal reels
// over a glowing light box, a loupe resting on the frame in the middle.
// Scrolling pulls the film along (the reels turn with it) and it settles
// with one frame under the loupe; that frame plays large above, with its
// story as burned-in subtitles. Each frame is a title card lettered in its
// era's style; a splice of clear tape marks each new era.

const N = TIMELINE.length
// Blank leader before and after the films, so the strip runs to the reels.
const LEADER = 4
const REEL = { lg: 320, sm: 150 }

export function TimelineScene() {
  const sectionRef = useRef(null)
  const stripRef = useRef(null)
  const reelsRef = useRef([])
  const triggerRef = useRef(null)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()

  // Distance between two frames on the strip, in pixels.
  const pitch = () => {
    const cells = stripRef.current?.children
    return cells ? cells[LEADER + 1].offsetLeft - cells[LEADER].offsetLeft : 0
  }

  // Place the strip at a position in frames (0 … N-1) and turn the reels by
  // the same length of film.
  const place = (at) => {
    const x = -at * pitch()
    gsap.set(stripRef.current, { x })
    const r = (window.innerWidth >= 1024 ? REEL.lg : REEL.sm) / 2
    for (const reel of reelsRef.current) reel && gsap.set(reel, { rotation: (x / r) * (180 / Math.PI) })
    const i = Math.round(at)
    if (i !== indexRef.current) {
      indexRef.current = i
      setIndex(i)
    }
  }

  // Scrolling pulls the film; it settles with one frame under the loupe.
  useGSAP(
    () => {
      if (reduced) return
      const proxy = { at: 0 }
      const moving = [stripRef.current, ...reelsRef.current]
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.5,
          // Nearest frame only: with the default inertia a quick flick snaps
          // several frames on, or all the way to the end.
          snap: { snapTo: 1 / (N - 1), inertia: false, duration: { min: 0.2, max: 0.4 }, delay: 0.08, ease: 'power1.inOut' },
          invalidateOnRefresh: true,
          onToggle: (self) => moving.forEach((el) => el && (el.style.willChange = self.isActive ? 'transform' : '')),
          onRefresh: () => place(proxy.at),
        },
      })
      tl.to(proxy, { at: N - 1, ease: 'none', onUpdate: () => place(proxy.at) })
      triggerRef.current = tl.scrollTrigger
      return () => (triggerRef.current = null)
    },
    { scope: sectionRef, dependencies: [reduced] }
  )

  // With reduced motion the buttons step the strip; nothing scrubs.
  useEffect(() => {
    if (!reduced) return
    place(index)
    const onResize = () => place(indexRef.current)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, index])

  const goTo = (i) => {
    const to = Math.max(0, Math.min(N - 1, i))
    const st = triggerRef.current
    if (!st) return setIndex(to)
    window.scrollTo({ top: st.start + (to / (N - 1)) * (st.end - st.start), behavior: 'smooth' })
  }

  // On a laptop the strip can be pulled by hand too: dragging scrolls the
  // page by the matching amount.
  const onStripDown = (e) => {
    const st = triggerRef.current
    if (!st || e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const perPx = (st.end - st.start) / ((N - 1) * pitch())
    let last = e.clientX
    el.setPointerCapture(e.pointerId)
    const move = (ev) => {
      window.scrollBy(0, -(ev.clientX - last) * perPx)
      last = ev.clientX
    }
    const end = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
  }

  const entry = TIMELINE[index]

  return (
    <section ref={sectionRef} id="timeline" aria-labelledby="timeline-title" className="scroll-mt-14">
      <FilmFrame>
        <div className="relative h-[calc(100svh-0.75rem)] overflow-hidden bg-[#110b07] sm:h-[calc(100svh-1.5rem)]">
          <Projected entry={entry} index={index} reduced={reduced} subtitles={subtitles} />

          <div className="absolute inset-x-0 bottom-0 h-[45%] lg:h-[42%]">
            {/* The light box glows under the strip and lights the reels' rims */}
            <span aria-hidden className="absolute inset-x-[12%] top-[6%] h-[62%] rounded-[6px] bg-[#fff4dc] shadow-[0_0_40px_14px_rgba(255,236,200,.35)] motion-safe:animate-hum" />
            <span aria-hidden className="absolute inset-x-[8%] top-[64%] h-[30%] bg-linear-to-b from-[#2a1d12] to-[#130d09]" />
            <Reel ref={(el) => (reelsRef.current[0] = el)} className="left-0 -translate-x-[45%]" />
            <Reel ref={(el) => (reelsRef.current[1] = el)} className="right-0 translate-x-[45%]" />

            <div className="absolute inset-x-[6%] top-[3%] h-[70%] cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing lg:inset-x-[10%]" onPointerDown={onStripDown}>
              <div
                ref={stripRef}
                className="absolute top-0 flex h-full [--fw:min(58vw,15rem)] lg:[--fw:17rem]"
                style={{ left: `calc(50% - var(--fw) / 2 - ${LEADER} * var(--fw))` }}
              >
                {Array.from({ length: LEADER }, (_, i) => (
                  <Cell key={`head${i}`} />
                ))}
                {TIMELINE.map((t, i) => (
                  <Cell key={t.year} entry={t} splice={i > 0 && TIMELINE[i - 1].era !== t.era} onPick={() => goTo(i)} current={i === index} subtitles={subtitles} />
                ))}
                {Array.from({ length: LEADER }, (_, i) => (
                  <Cell key={`tail${i}`} />
                ))}
              </div>
              <Loupe />
            </div>

            <div className="absolute inset-x-0 bottom-[3%] flex flex-col items-center gap-2 lg:bottom-[5%]">
              <div className="flex items-center gap-3">
                <StepButton dir={-1} disabled={index === 0} onClick={() => goTo(index - 1)} />
                <p className="min-w-16 rounded-[3px] px-2 py-1 text-center font-kn-body text-base font-bold text-[#3a2406] shadow-[inset_0_1px_0_rgba(255,248,220,.6)]" style={brass} aria-live="polite">
                  <span className="sr-only">Film </span>
                  {index + 1} / {N}
                </p>
                <StepButton dir={1} disabled={index === N - 1} onClick={() => goTo(index + 1)} />
              </div>
              <h2 id="timeline-title" className="text-center leading-tight">
                <span lang="kn" className="font-kn-display text-base font-bold text-[#f1dfc0] sm:text-lg">
                  ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ
                </span>
                <span className={cn('ml-2 font-poster text-sm tracking-[0.2em] text-[#f1dfc0]/60 sm:text-base', !subtitles && 'sr-only')}>Sandalwood through the years</span>
              </h2>
            </div>
          </div>
        </div>
      </FilmFrame>
    </section>
  )
}

// The frame under the loupe, projected large, with its story burned in.
function Projected({ entry, index, reduced, subtitles }) {
  const last = index === N - 1
  return (
    <div className="absolute inset-x-0 top-0 h-[55%] pt-[4.25rem] [container-type:size] lg:h-[58%]">
      <div className="flex size-full items-center justify-center">
        <div key={index} className={cn('relative w-[min(94cqw,calc(100cqh*4/3))]', reduced ? 'animate-in fade-in duration-300' : 'motion-safe:animate-jump-cut')}>
          <EraCard entry={entry} subtitles={subtitles} className="w-full rounded-[4px] shadow-[0_0_50px_6px_rgba(255,244,220,.12)]" />
          <p className="absolute inset-x-[5%] bottom-[5%] text-center font-kn-body text-[max(0.95rem,2.6cqh)] font-semibold leading-snug text-[#f6f0e2] [text-shadow:0_0_1px_#000,0_0_3px_rgba(0,0,0,.95),0_1px_5px_rgba(0,0,0,.85)]">
            <span className="mr-2 font-bold text-[#fff1a8]">{entry.year}</span>
            {entry.lineKn && (
              <span lang="kn" className="block">
                {entry.lineKn}
              </span>
            )}
            <span className={cn(entry.lineKn && !subtitles && 'sr-only')}>{entry.line}</span>
          </p>
        </div>
      </div>
      {last && (
        <a
          href="#fan-pass"
          className="absolute inset-x-3 top-[4.3rem] flex min-h-11 flex-col items-center justify-center rounded-2xl bg-arishina/95 px-4 py-1 text-center text-theatre shadow-[0_4px_10px_rgba(0,0,0,.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina sm:inset-x-auto sm:bottom-1 sm:left-1/2 sm:top-auto sm:-translate-x-1/2 sm:flex-row sm:gap-2 sm:whitespace-nowrap sm:rounded-full sm:py-0"
        >
          <span lang="kn" className="font-kn-display text-base font-bold">
            ಮುಂದಿನ ಫ್ರೇಮ್ ನಿಮ್ಮದು
          </span>
          {subtitles && <span className="text-sm font-semibold leading-tight"><span className="hidden sm:inline">· </span>The next frame is yours: make your fan pass</span>}
        </a>
      )}
    </div>
  )
}

// One frame of film: sprocket holes above and below, the title card in the
// middle, the year printed in the edge in Kannada numerals, like the codes
// on real film. Leader frames are blank.
function Cell({ entry, splice, onPick, current, subtitles }) {
  const holes = 'radial-gradient(circle at 50% 50%, transparent 0, transparent 0), repeating-linear-gradient(90deg, transparent 0 12%, rgba(255,244,220,.95) 12% 26%, transparent 26% 50%)'
  return (
    <div className="relative flex h-full w-(--fw) shrink-0 flex-col" style={{ backgroundImage: 'linear-gradient(180deg, rgba(40,22,10,.9), rgba(58,32,14,.82) 50%, rgba(40,22,10,.9))' }}>
      <span aria-hidden className="mx-[3%] mt-[3%] h-[7%] rounded-[2px]" style={{ backgroundImage: holes, backgroundSize: '25% 100%' }} />
      <div className="relative mx-[4%] my-[2%] flex-1 overflow-hidden rounded-[2px] bg-[#1a120c]">
        {entry ? (
          <button type="button" onClick={onPick} aria-label={`${entry.year}, ${entry.film}`} className="absolute inset-0 block size-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-arishina">
            <EraCard entry={entry} subtitles={subtitles} className="absolute inset-0 size-full aspect-auto opacity-95" />
          </button>
        ) : (
          <span aria-hidden className="absolute inset-0 bg-[#fff4dc]/70" />
        )}
        {entry && !current && <span aria-hidden className="pointer-events-none absolute inset-0 bg-black/15" />}
      </div>
      <span aria-hidden className="relative mx-[3%] mb-[3%] h-[7%] rounded-[2px]" style={{ backgroundImage: holes, backgroundSize: '25% 100%' }}>
        {entry && (
          <span className="absolute -top-[125%] left-[6%] font-typewriter text-[0.6rem] leading-none tracking-widest text-[#f2c98a]/80">
            ಪರ್ವ {toKannadaDigits(entry.year)}
          </span>
        )}
      </span>
      {/* A splice of clear tape where a new era begins */}
      {splice && (
        <span
          aria-hidden
          className="absolute inset-y-0 -left-3 z-10 w-6 bg-[#f7f1e0]/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,.25)]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,.55) 0 1.5px, transparent 2px), radial-gradient(circle at 70% 55%, rgba(255,255,255,.5) 0 1px, transparent 1.6px), radial-gradient(circle at 40% 80%, rgba(255,255,255,.5) 0 1.3px, transparent 1.8px), linear-gradient(90deg, rgba(255,255,255,.12), transparent 40%, rgba(255,255,255,.15))',
          }}
        />
      )}
    </div>
  )
}

// A film editor's loupe standing on the middle frame.
function Loupe() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 aspect-square h-[92%] -translate-1/2 rounded-full border-[6px] border-[#2b2b2b] shadow-[0_8px_16px_rgba(0,0,0,.55),inset_0_0_0_2px_rgba(255,255,255,.2),inset_0_-6px_12px_rgba(255,244,220,.25)]"
      style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,.22), transparent 35%, transparent 70%, rgba(255,255,255,.1))' }}
    >
      <span className="absolute -right-[18%] top-[62%] h-[12%] w-[26%] rotate-[28deg] rounded-full bg-[#2b2b2b] shadow-[0_3px_5px_rgba(0,0,0,.5)]" />
    </span>
  )
}

// A metal spool with round holes, dark grey with worn edges, and a thin rim
// of light from the light box below.
function Reel({ ref, className }) {
  return (
    <div className={cn('absolute top-[26%] aspect-square w-[9.5rem] lg:w-[20rem]', className)}>
      <svg ref={ref} viewBox="0 0 200 200" aria-hidden className="size-full">
        <circle cx="100" cy="100" r="97" fill="#55595c" stroke="#1b1c1d" strokeWidth="3" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#6f7478" strokeWidth="6" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="#6d7174" strokeWidth="1.5" strokeDasharray="6 10" opacity=".6" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={100 + Math.cos((a * Math.PI) / 180) * 56} cy={100 + Math.sin((a * Math.PI) / 180) * 56} r="24" fill="#110b07" stroke="#222" strokeWidth="2" />
        ))}
        <circle cx="100" cy="100" r="18" fill="#55595c" stroke="#1b1c1d" strokeWidth="3" />
        <rect x="95" y="84" width="10" height="32" rx="2" fill="#1b1c1d" />
        <path d="M22 140 A86 86 0 0 0 178 140" fill="none" stroke="#fff4dc" strokeOpacity=".35" strokeWidth="2.5" />
      </svg>
    </div>
  )
}

function StepButton({ dir, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? 'Previous film' : 'Next film'}
      className="grid size-11 place-items-center rounded-full text-lg text-[#3a2406] shadow-[0_3px_5px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,248,220,.6)] transition-transform enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
      style={brass}
    >
      <span aria-hidden>{dir < 0 ? '◀' : '▶'}</span>
    </button>
  )
}
