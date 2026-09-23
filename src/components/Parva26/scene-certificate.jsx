import { useEffect, useRef, useState } from 'react'
import { usePrefs } from './prefs'
import { EVENT } from './data'
import { graphemes, toKannadaDigits } from './text'
import { FilmFrame } from './fx/film-frame'
import { gsap, ScrollTrigger, useGSAP } from './fx/gsap'
import { paper, wood } from './fx/textures'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

// Scene 3: a parody certificate, filmed lying on a desk under a lamp. The
// values type in, the signature draws itself and the approval stamp slams
// down. The stamped box on the Language line is the subtitles switch.
// Deliberately not modelled on the real CBFC certificate (spec §3 Scene 3).

const FIELDS = [
  { label: 'Title', value: 'ಪರ್ವ', lang: 'kn', gloss: 'Parva' },
  { label: 'Category', value: 'ಸರ್ವರಿಗೂ', lang: 'kn', gloss: 'for everyone' },
  { label: 'Length', value: 'One full day' },
  { label: 'Language', value: 'ಕನ್ನಡ', lang: 'kn', gloss: 'Kannada', subtitlesBox: true },
  { label: 'Certified by', value: 'Kannada Vedike' },
]

const CHARS = FIELDS.map((f) => graphemes(f.value))
const STARTS = CHARS.map((_, i) => CHARS.slice(0, i).reduce((n, c) => n + c.length, 0))
const TOTAL = STARTS[STARTS.length - 1] + CHARS[CHARS.length - 1].length
const LANGUAGE = FIELDS.findIndex((f) => f.subtitlesBox)

const releaseDate = (() => {
  const d = new Date(EVENT.date)
  const pad = (n) => String(n).padStart(2, '0')
  return toKannadaDigits(`${pad(d.getDate())}·${pad(d.getMonth() + 1)}·${d.getFullYear()}`)
})()

const rand = (min, max) => min + Math.random() * (max - min)
let stampId = 0

export function CertificateScene() {
  const reduced = usePrefersReducedMotion()
  const { subtitles, setSubtitles } = usePrefs()
  const paperRef = useRef(null)
  const deskRef = useRef(null)
  const [started, setStarted] = useState(false)
  const [typed, setTyped] = useState(0)
  const [signed, setSigned] = useState(false)
  const [stamps, setStamps] = useState([])

  const typedNow = reduced ? TOTAL : typed
  const typedIn = (i) => Math.min(Math.max(typedNow - STARTS[i], 0), CHARS[i].length)
  const lineDone = (i) => typedIn(i) === CHARS[i].length

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: paperRef.current,
      start: 'top 70%',
      once: true,
      onEnter: () => setStarted(true),
    })
  })

  useEffect(() => {
    if (!started || reduced || typed >= TOTAL) return
    // A longer pause at the start of each line, like a carriage return.
    const delay = STARTS.includes(typed) && typed > 0 ? 420 : rand(55, 130)
    const id = setTimeout(() => setTyped((n) => n + 1), delay)
    return () => clearTimeout(id)
  }, [started, reduced, typed])

  // The first ON/OFF stamp lands once the Language line is typed. After that
  // every change of the setting, from here or the top bar, stamps again on top.
  const languageDone = lineDone(LANGUAGE)
  useEffect(() => {
    if (!languageDone) return
    const next = { id: stampId++, on: subtitles, rot: rand(-8, 6), dx: rand(-4, 4), dy: rand(-3, 3) }
    setStamps((prev) => (prev.at(-1)?.on === subtitles ? prev : [...prev.slice(-2), next]))
  }, [languageDone, subtitles])

  const shakeCamera = () =>
    gsap.to(deskRef.current, {
      keyframes: { x: [0, -5, 4, -3, 2, 0], y: [0, 3, -3, 2, -1, 0] },
      duration: 0.32,
      ease: 'none',
    })

  return (
    <section id="certificate" className="scroll-mt-14">
      <FilmFrame>
        <div
          ref={deskRef}
          className="relative flex min-h-[calc(100svh-4.5rem)] items-center justify-center bg-[#2a190d] px-3 py-12 sm:px-8 sm:py-10"
          style={wood}
        >
          <div className="relative w-full max-w-[34rem] rotate-[-0.8deg]">
            {/* The lifted corners cast a softer, wider shadow than the flat middle */}
            <div aria-hidden className="absolute -bottom-3 -right-2 h-24 w-44 rounded-[50%] bg-black/70 blur-xl" />
            <div aria-hidden className="absolute -left-2 -top-2 h-16 w-28 rounded-[50%] bg-black/50 blur-lg" />

            <article
              ref={paperRef}
              className="relative bg-paper px-6 py-7 text-print shadow-[0_24px_50px_-12px_rgba(0,0,0,.85),0_6px_12px_rgba(0,0,0,.45),inset_0_0_60px_rgba(125,85,35,.3)] sm:px-11 sm:py-8"
              style={paper}
            >
              <div aria-hidden className="pointer-events-none absolute inset-2.5 border-[5px] border-double border-print/40 sm:inset-3.5" />

              <header className="relative text-center">
                <div className="flex justify-between font-typewriter text-[0.7rem] text-print/70">
                  <span>No. {toKannadaDigits('2026/001')}</span>
                  <span>{releaseDate}</span>
                </div>
                <h2 className="mt-3 font-kn-serif">
                  <span lang="kn" className="block text-4xl font-bold leading-tight sm:text-5xl">ಪ್ರಮಾಣ ಪತ್ರ</span>
                  <span className="mt-1 flex items-center justify-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.5em] text-print/75">
                    <span aria-hidden className="h-px w-8 bg-current" />
                    Certificate
                    <span aria-hidden className="h-px w-8 bg-current" />
                  </span>
                </h2>
                <p className="mx-auto mt-3 max-w-sm font-kn-serif text-xs italic leading-relaxed text-print/70">
                  This is to certify that the show described below has been examined and found fit for public celebration.
                </p>
              </header>

              <dl className="relative mt-5 space-y-2.5">
                {FIELDS.map((field, i) => (
                  <div key={field.label} className="grid gap-x-4 sm:grid-cols-[7.5rem_1fr] sm:items-baseline">
                    <dt className="font-kn-serif text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-print/65">
                      {field.label}
                    </dt>
                    <dd className="flex min-h-9 flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-dotted border-print/45 pb-1">
                      <TypedValue chars={CHARS[i]} count={typedIn(i)} lang={field.lang} />
                      {field.gloss && lineDone(i) && (
                        <span lang="en" className={cn('font-kn-serif text-xs italic text-print/60', !subtitles && 'sr-only')}>
                          ({field.gloss})
                        </span>
                      )}
                      {field.subtitlesBox && (
                        <SubtitlesStampBox
                          stamps={stamps}
                          animate={!reduced}
                          subtitles={subtitles}
                          onToggle={() => setSubtitles((on) => !on)}
                        />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="relative mt-6 flex items-end justify-between">
                <div className="w-40 sm:w-48">
                  <div className="h-14">
                    {typedNow >= TOTAL && <Signature animate={!reduced} onDone={() => setSigned(true)} />}
                  </div>
                  <div className="border-t border-print/60 pt-1 font-kn-serif text-[0.65rem] uppercase tracking-[0.2em] text-print/65">
                    Authorised signatory
                  </div>
                </div>
                <div className="-mb-3 -mr-2 w-28 sm:w-36">
                  {(reduced || signed) && <Seal animate={!reduced} onLand={shakeCamera} />}
                </div>
              </div>

              <footer className="relative mt-5 space-y-1 font-kn-serif text-[0.68rem] leading-snug text-print/65">
                <p>Side effects may include: whistling, dancing in the aisle, too much holige.</p>
                <p>A parody certificate, not issued by any film board. Tap the stamped box to switch subtitles.</p>
              </footer>

              {/* Curl shading on two corners */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(70,45,20,.28),transparent_22%),radial-gradient(circle_at_0%_0%,rgba(70,45,20,.2),transparent_16%)]"
              />
            </article>
          </div>

          {/* Desk lamp from the top left */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-[at_30%_22%] from-[#ffd79a]/15 via-transparent via-45% to-black/55" />
        </div>
      </FilmFrame>
    </section>
  )
}

// Typed text wobbles a little per word and prints unevenly, like a worn
// typewriter ribbon. Screen readers get the full value straight away.
function TypedValue({ chars, count, lang }) {
  const words = chars.slice(0, count).join('').split(' ')

  return (
    <>
      <span lang={lang} className="sr-only">{chars.join('')}</span>
      <span
        aria-hidden
        lang={lang}
        className="font-typewriter text-lg text-[#241c16] [text-shadow:0_0_.8px_rgba(36,28,22,.75)] sm:text-xl"
      >
        {words.map((word, i) => (
          <span
            key={i}
            className="mr-[0.35em] inline-block"
            style={{
              transform: `translateY(${((i * 7) % 5) * 0.25 - 0.5}px) rotate(${((i * 3) % 5) * 0.3 - 0.6}deg)`,
              opacity: 0.8 + ((i * 5) % 4) * 0.06,
            }}
          >
            {word}
          </span>
        ))}
      </span>
    </>
  )
}

function SubtitlesStampBox({ stamps, animate, subtitles, onToggle }) {
  return (
    <button
      type="button"
      aria-label="English subtitles"
      aria-pressed={subtitles}
      // Not data-en-always: switching off hides the strip at once, as a live demo.
      data-en={`English subtitles: ${subtitles ? 'on' : 'off'}`}
      onClick={onToggle}
      className="group ml-auto inline-flex cursor-pointer items-center gap-2 rounded-sm font-kn-serif text-[0.68rem] uppercase tracking-[0.15em] text-print/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kumkuma"
    >
      with English subtitles:
      <span
        aria-hidden
        className="relative inline-block h-9 w-[4.5rem] rounded-sm border border-dashed border-print/30 transition-colors group-hover:border-print/60"
      >
        {stamps.map((stamp, i) => (
          <BoxStamp key={stamp.id} {...stamp} animate={animate} faded={i < stamps.length - 1} />
        ))}
      </span>
    </button>
  )
}

function BoxStamp({ on, rot, dx, dy, animate, faded }) {
  const inkRef = useRef(null)

  useGSAP(() => {
    if (!animate) return
    gsap.fromTo(inkRef.current, { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: 'power4.in' })
  })

  return (
    <span
      className={cn('absolute inset-0 transition-opacity duration-500', faded && 'opacity-35')}
      style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}
    >
      <span
        ref={inkRef}
        className="grid size-full place-items-center rounded-[3px] border-[2.5px] border-kumkuma font-poster text-2xl leading-none tracking-wider text-kumkuma [filter:url(#p26-ink)]"
      >
        {on ? 'ON' : 'OFF'}
      </span>
    </span>
  )
}

// One fountain-pen stroke, drawn in real time.
function Signature({ animate, onDone }) {
  const pathRef = useRef(null)

  useGSAP(() => {
    if (!animate) {
      onDone()
      return
    }
    gsap.fromTo(pathRef.current, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power1.inOut', onComplete: onDone })
  })

  return (
    <svg viewBox="0 0 220 70" aria-hidden className="h-full w-full overflow-visible">
      <path
        ref={pathRef}
        d="M8 48 C14 30 24 14 30 22 C36 30 22 52 18 50 C14 48 30 30 42 32 C52 34 44 50 50 50 C58 50 60 34 68 34 C76 34 70 50 78 49 C88 48 90 26 100 24 C108 22 104 46 96 48 C90 50 100 36 112 36 C122 36 116 50 126 48 C138 46 140 30 150 30 C158 30 152 46 160 46 C170 46 176 32 186 30 C196 28 204 34 212 26 C200 44 150 58 70 60 C50 61 36 60 30 58"
        fill="none"
        stroke="var(--color-pen)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Round kumkuma approval stamp. It slams down, then the camera shakes.
function Seal({ animate, onLand }) {
  const sealRef = useRef(null)

  useGSAP(() => {
    if (!animate) return
    gsap.fromTo(
      sealRef.current,
      { scale: 2.6, opacity: 0, rotate: -22 },
      { scale: 1, opacity: 0.92, rotate: -9, duration: 0.2, ease: 'power4.in', onComplete: onLand }
    )
  })

  return (
    <div ref={sealRef} style={{ transform: 'rotate(-9deg)', opacity: 0.92 }}>
      <svg viewBox="0 0 200 200" aria-hidden className="w-full font-kn-body font-bold">
        <defs>
          <path id="p26-seal-bottom" d="M24 100 A76 76 0 0 0 176 100" />
        </defs>
        <g filter="url(#p26-ink)" stroke="var(--color-kumkuma)" fill="var(--color-kumkuma)">
          <circle cx="100" cy="100" r="93" fill="none" strokeWidth="6" />
          <circle cx="100" cy="100" r="85" fill="none" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="50" fill="none" strokeWidth="2" />
          <line x1="54" y1="84" x2="146" y2="84" strokeWidth="1.5" />
          <line x1="54" y1="118" x2="146" y2="118" strokeWidth="1.5" />
          <g stroke="none">
            <ArcText text="ಕನ್ನಡ ವೇದಿಕೆ" radius={66} span={100} fontSize={18} />
            <text fontSize="13" letterSpacing="3" textAnchor="middle">
              <textPath href="#p26-seal-bottom" startOffset="50%">NITK · {toKannadaDigits(2026)}</textPath>
            </text>
            <text x="100" y="107" fontSize="16" textAnchor="middle">ಅನುಮೋದಿತ</text>
            <text x="25" y="104" fontSize="12" textAnchor="middle">★</text>
            <text x="175" y="104" fontSize="12" textAnchor="middle">★</text>
          </g>
        </g>
      </svg>
    </div>
  )
}

// Curved text laid out one akshara at a time. Browsers place <textPath> text
// glyph by glyph, which pulls Kannada vowel signs off their consonants.
function ArcText({ text, radius, span, fontSize }) {
  const parts = graphemes(text)
  const step = span / (parts.length - 1)

  return parts.map((part, i) => (
    <text
      key={i}
      x="100"
      y={100 - radius}
      fontSize={fontSize}
      textAnchor="middle"
      transform={`rotate(${-span / 2 + i * step} 100 100)`}
    >
      {part}
    </text>
  ))
}
