import { useEffect, useRef, useState } from 'react'
import { usePrefs } from './prefs'
import { CREDITS, ASSET_CREDITS, CONTACT, SPONSORS, MEAL, HOOMALE } from './data'
import { Flourish } from './scene-interval'
import { Coupon } from './booking-counter'
import { FilmFrame } from './fx/film-frame'
import { gsap, ScrollTrigger, useGSAP } from './fx/gsap'
import { velvet } from './fx/materials'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

// Scene 12, the credits and ಶುಭಂ (allscenes.md). After a silent black beat,
// the end credits roll on the screen in projected cream, the team credited
// as a film crew (names from the main site's team list). Beside them a
// small inset plays "making of" photos, sepia turning to colour; it is also
// the gallery. The roll drifts up on its own when you stop scrolling, and
// pauses on the thank-you card. The small print, contact and links come at
// the very end, as in a film. Then ಶುಭಂ, the curtain closes over the screen,
// and the stage front offers "watch again" and one last Book.

const photos = Object.values(import.meta.glob('./assets/making-of/*.webp', { eager: true, query: '?url', import: 'default' }))

// Projected text: cream, with light spreading softly round each letter.
const GLOW = 'text-[#f1dfc0] [text-shadow:0_0_6px_rgba(241,223,192,.35),0_0_1px_rgba(241,223,192,.6)]'

export function CreditsScene() {
  const listRef = useRef(null)
  const insetRef = useRef(null)
  const thanksRef = useRef(null)
  const returnRef = useRef(null)
  const endRef = useRef(null)
  const curtainsRef = useRef([])
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()

  // The inset stays beside the roll on a laptop; the curtain closes over
  // the ending as you scroll through it.
  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({ trigger: listRef.current, start: 'top 22%', end: 'bottom 75%', pin: insetRef.current, pinSpacing: false })
      })
      const [left, right] = curtainsRef.current
      gsap
        .timeline({
          scrollTrigger: {
            trigger: endRef.current,
            start: 'top top',
            end: '+=90%',
            pin: true,
            scrub: 0.6,
            onToggle: (self) => [left, right].forEach((el) => (el.style.willChange = self.isActive ? 'transform' : '')),
          },
        })
        .to({}, { duration: 0.35 })
        .fromTo(left, { xPercent: -101 }, { xPercent: 0, ease: 'power1.inOut', duration: 1 })
        .fromTo(right, { xPercent: 101 }, { xPercent: 0, ease: 'power1.inOut', duration: 1 }, '<')
      return () => mm.revert()
    },
    { dependencies: [reduced] }
  )

  useCreditsDrift({ listRef, stops: [thanksRef, returnRef], endRef, reduced })

  return (
    <section id="credits" aria-labelledby="credits-title" className="scroll-mt-14">
      <FilmFrame>
        <div className="bg-black">
          {/* The silent black beat before the credits */}
          <div aria-hidden className="h-[45svh]" />

          <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-[25svh] sm:px-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
            <MakingOf ref={insetRef} reduced={reduced} subtitles={subtitles} />

            <div ref={listRef} className="flex flex-col items-center gap-14 text-center">
              <div>
                <p lang="kn" className={cn('font-kn-display text-lg font-semibold', GLOW)}>
                  ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ
                </p>
                {subtitles && <p className={cn('font-poster text-base tracking-[0.3em] opacity-80', GLOW)}>Kannada Vedike presents</p>}
                <h2 id="credits-title" className="mt-4">
                  <span lang="kn" className={cn('block font-kn-card text-6xl leading-tight sm:text-7xl', GLOW)}>
                    ಪರ್ವ 2026
                  </span>
                  <span className={cn('block font-poster text-lg tracking-[0.35em]', GLOW, !subtitles && 'sr-only')}>Credits</span>
                </h2>
              </div>

              <dl className="w-full space-y-9">
                {CREDITS.map((job) => (
                  <div key={job.en} className="grid gap-1 lg:grid-cols-2 lg:gap-8">
                    <dt className="lg:text-right">
                      <span lang="kn" className={cn('block font-kn-display text-lg font-semibold leading-tight', GLOW)}>
                        {job.kn}
                      </span>
                      <span className={cn('block font-poster text-sm tracking-[0.2em] opacity-75', GLOW, !subtitles && 'sr-only')}>
                        {job.en} <span className="opacity-70">({job.team})</span>
                      </span>
                    </dt>
                    <dd className="lg:text-left">
                      {job.people.map((name) => (
                        <span key={name} className={cn('block font-kn-body text-xl font-medium leading-snug', GLOW)}>
                          {name}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <div>
                <p lang="kn" className={cn('font-kn-display text-lg font-semibold', GLOW)}>
                  ವಿಶೇಷ ಕೃತಜ್ಞತೆ
                </p>
                {subtitles && <p className={cn('font-poster text-sm tracking-[0.2em] opacity-75', GLOW)}>Special thanks</p>}
                <p className={cn('mt-3 max-w-md font-kn-body text-lg leading-relaxed', GLOW)}>{SPONSORS.map((s) => s.name).join(' · ')}</p>
              </div>

              {/* The roll pauses on this card */}
              <div ref={thanksRef} className="flex min-h-[55svh] flex-col items-center justify-center">
                <p lang="kn" className={cn('font-kn-display text-3xl font-bold leading-snug sm:text-4xl', GLOW)}>
                  ಅಭಿಮಾನಿ ದೇವರುಗಳಿಗೆ ಧನ್ಯವಾದ
                </p>
                {subtitles && <p className={cn('mt-2 font-kn-body text-lg', GLOW)}>Thank you to our fans, who are our gods</p>}
              </div>

              <SmallPrint subtitles={subtitles} />

              <WillReturn ref={returnRef} subtitles={subtitles} />
            </div>
          </div>

          {/* Fade to black, then ಶುಭಂ as the curtain closes */}
          <div ref={endRef} className="relative grid h-[calc(100svh-0.75rem)] place-items-center overflow-hidden sm:h-[calc(100svh-1.5rem)]">
            <Shubham />
            {!reduced && (
              <>
                <Curtain ref={(el) => (curtainsRef.current[0] = el)} side="left" />
                <Curtain ref={(el) => (curtainsRef.current[1] = el)} side="right" />
              </>
            )}
          </div>
        </div>
      </FilmFrame>
      <StageFront reduced={reduced} subtitles={subtitles} />
    </section>
  )
}

// When you stop scrolling for three seconds, the credits carry on rolling
// by themselves, slowly, like a real roll: they wait a moment on each of
// the stop cards (thank you, and the stinger) and stop when ಶುಭಂ comes up. Any wheel, touch or key
// hands control straight back.
function useCreditsDrift({ listRef, stops, endRef, reduced }) {
  useEffect(() => {
    if (reduced) return
    let idle = 0
    let raf = 0
    let last = 0
    let carry = 0
    const waited = new Set()
    let pauseUntil = 0

    const rolling = () => {
      const r = listRef.current.getBoundingClientRect()
      return r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4
    }
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      for (const stop of stops) {
        const card = stop.current
        if (!card || waited.has(card)) continue
        const t = card.getBoundingClientRect()
        if (t.top + t.height / 2 <= innerHeight / 2) {
          waited.add(card)
          pauseUntil = now + 2500
        }
      }
      if (endRef.current.getBoundingClientRect().top <= innerHeight * 0.05) return (raf = 0)
      if (now >= pauseUntil) {
        carry += 38 * dt
        const px = Math.floor(carry)
        if (px) {
          window.scrollBy(0, px)
          carry -= px
        }
      }
      raf = requestAnimationFrame(step)
    }
    const wait = () => {
      clearTimeout(idle)
      idle = setTimeout(() => {
        if (rolling() && document.visibilityState === 'visible' && !raf) {
          last = performance.now()
          raf = requestAnimationFrame(step)
        } else wait()
      }, 3000)
    }
    const takeOver = () => {
      cancelAnimationFrame(raf)
      raf = 0
      wait()
    }
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    events.forEach((type) => window.addEventListener(type, takeOver, { passive: true }))
    // Scrolling by hand resets the three seconds; our own scrolling doesn't.
    const onScroll = () => !raf && wait()
    window.addEventListener('scroll', onScroll, { passive: true })
    wait()
    return () => {
      clearTimeout(idle)
      cancelAnimationFrame(raf)
      events.forEach((type) => window.removeEventListener(type, takeOver))
      window.removeEventListener('scroll', onScroll)
    }
    // The stop cards are fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef, endRef, reduced])
}

// The "making of" inset: photos from past Parvas and the club, each one
// starting in sepia and turning to colour before the next comes in. It is
// also the way to the full gallery.
function MakingOf({ ref, reduced, subtitles }) {
  const [i, setI] = useState(0)
  const [live, setLive] = useState(false)
  const [developed, setDeveloped] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    const seen = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting))
    seen.observe(boxRef.current)
    return () => seen.disconnect()
  }, [])
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setI((n) => (n + 1) % photos.length), 4200)
    return () => clearInterval(id)
  }, [live])
  // Each photo comes in sepia and develops into colour.
  useEffect(() => {
    setDeveloped(false)
    if (!live) return
    const id = setTimeout(() => setDeveloped(true), 250)
    return () => clearTimeout(id)
  }, [i, live])

  return (
    <div ref={ref} className="w-full max-w-sm justify-self-center lg:self-start">
      <div ref={boxRef} className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#0d0b09] shadow-[0_0_0_1px_rgba(241,223,192,.2),0_0_30px_rgba(241,223,192,.08)]">
        <img
          key={i}
          src={photos[i]}
          alt=""
          decoding="async"
          className={cn(
            'absolute inset-0 size-full object-cover',
            !reduced && 'animate-in fade-in transition-[filter] duration-[2600ms] ease-out',
            developed ? 'sepia-0 saturate-100' : 'sepia saturate-50'
          )}
        />
        {/* The next photo, loading out of sight */}
        <img src={photos[(i + 1) % photos.length]} alt="" loading="lazy" className="hidden" />
        <span aria-hidden className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_24px_8px_rgba(0,0,0,.6)]" />
      </div>
      <p className={cn('mt-3 text-center font-kn-display text-sm', GLOW)}>
        <span lang="kn">ಚಿತ್ರೀಕರಣದ ಕ್ಷಣಗಳು</span>
        {subtitles && <span className="font-kn-body opacity-80"> · The making of</span>}
      </p>
      <a
        href={CONTACT.gallery}
        className={cn('mx-auto mt-1 flex min-h-11 w-fit items-center font-kn-display text-base font-semibold underline decoration-[#f1dfc0]/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina', GLOW)}
      >
        <span lang="kn">ಗ್ಯಾಲರಿ</span>
        {subtitles && <span className="font-kn-body"> · Full gallery →</span>}
      </a>
    </div>
  )
}

// The very end of the roll, smaller: what we used, and how to reach us.
function SmallPrint({ subtitles }) {
  const policies = CONTACT.policies.filter((p) => p.href)
  return (
    <div className="w-full max-w-lg space-y-8 text-sm">
      <div>
        <p className={cn('font-poster tracking-[0.25em] opacity-80', GLOW)}>Also on screen</p>
        <ul className="mt-2 space-y-1.5">
          {ASSET_CREDITS.map((a) => (
            <li key={a.what} className={cn('leading-snug opacity-80', GLOW)}>
              <span className="font-semibold">{a.what}:</span> {a.who}
              {a.licence && <span className="opacity-75"> ({a.licence})</span>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p lang="kn" className={cn('font-kn-display text-base font-semibold', GLOW)}>
          ಸಂಪರ್ಕ{subtitles && <span className="font-kn-body"> · Contact</span>}
        </p>
        <ul className="mt-2 space-y-1">
          {CONTACT.people.map((p) => (
            <li key={p.email} className={cn('opacity-85', GLOW)}>
              {p.name}, {p.role} ·{' '}
              <a href={`mailto:${p.email}`} className="underline decoration-[#f1dfc0]/40 underline-offset-2 focus-visible:outline-2 focus-visible:outline-arishina">
                {p.email}
              </a>
            </li>
          ))}
        </ul>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {CONTACT.social.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex min-h-11 items-center underline decoration-[#f1dfc0]/40 underline-offset-2 focus-visible:outline-2 focus-visible:outline-arishina', GLOW)}>
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        {policies.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4">
            {policies.map((p) => (
              <li key={p.name}>
                <a href={p.href} className={cn('inline-flex min-h-11 items-center underline decoration-[#f1dfc0]/40 underline-offset-2', GLOW)}>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className={cn('mt-3 opacity-70', GLOW)}>Kannada Vedike, NITK Surathkal · ಕನ್ನಡ ವೇದಿಕೆ, ಎನ್‌ಐಟಿಕೆ ಸುರತ್ಕಲ್</p>
      </div>
    </div>
  )
}

// The stinger at the very end of the credits, the way big films promise
// their hero's return, with the question mark the meme adds.
function WillReturn({ ref, subtitles }) {
  const hero = HOOMALE.hero
  return (
    <div ref={ref} className="flex min-h-[60svh] flex-col items-center justify-center gap-3">
      <p lang="kn" className={cn('font-kn-display text-2xl font-bold leading-snug sm:text-3xl', GLOW)}>
        {hero.kn} ಡೂಮ್ಸ್‌ಡೇಯಲ್ಲಿ ಮತ್ತೆ ಬರುತ್ತಾರೆ?
      </p>
      <p className={cn('font-poster text-3xl leading-tight tracking-[0.18em] sm:text-5xl', GLOW, !subtitles && 'sr-only')}>
        {hero.en} will return in Doomsday?
      </p>
    </div>
  )
}

// The end card: ಶುಭಂ, hand-lettered with a flourish, cream on black with a
// warm glow, and ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ under it.
function Shubham() {
  return (
    <div className="relative text-center">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-0 h-[140%] w-[160%] -translate-1/2 bg-radial from-[#ffcf80]/12 to-transparent to-65%" />
      <Flourish className="mx-auto w-24 rotate-[135deg] opacity-80" />
      <p lang="kn" className="relative font-kn-card text-[clamp(6rem,24vw,14rem)] leading-none text-[#f6e3b8] [text-shadow:0_0_14px_rgba(255,214,140,.55),0_0_40px_rgba(255,190,100,.25)]">
        ಶುಭಂ
      </p>
      <p lang="kn" className="relative mt-4 font-kn-display text-2xl font-semibold text-[#f1dfc0]/90 [text-shadow:0_0_8px_rgba(241,223,192,.35)] sm:text-3xl">
        ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ
      </p>
      <Flourish className="mx-auto mt-4 w-24 -rotate-45 opacity-80" />
    </div>
  )
}

// One half of the stage curtain, drawing across the screen at the end. Its
// starting place is set by the animation alone: a transform in the style
// as well would be added to it.
function Curtain({ ref, side }) {
  const left = side === 'left'
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('absolute inset-y-0 z-10 w-[51%]', left ? 'left-0' : 'right-0')}
      style={{
        ...velvet,
        backgroundImage: `linear-gradient(${left ? '90deg' : '270deg'}, rgba(0,0,0,.45), transparent 30%, rgba(255,120,140,.06) 60%, rgba(0,0,0,.35)), ${velvet.backgroundImage}`,
      }}
    >
      {/* A gold fringe along the bottom */}
      <span className="absolute inset-x-0 bottom-0 h-3" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #c9a052 0 3px, #7a5a1c 3px 5px)' }} />
    </div>
  )
}

// Below the screen, the stage front: watch again, or one last Book.
function StageFront({ reduced, subtitles }) {
  return (
    <div className="relative bg-theatre px-4 pb-16 pt-10 text-center">
      {reduced && (
        <div aria-hidden className="mx-auto -mt-10 mb-8 h-24 max-w-5xl" style={velvet} />
      )}
      <div aria-hidden className="mx-auto mb-10 h-4 max-w-5xl rounded-[2px]" style={{ backgroundImage: 'linear-gradient(180deg, #8a5a30, #4a2c14)' }} />
      <div className="flex flex-wrap items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0 })}
          className="min-h-12 -rotate-1 rounded-[4px] border-[3px] border-[#f1dfc0] bg-kumkuma px-6 py-2 text-[#fff4dc] shadow-[0_6px_12px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina"
        >
          <span lang="kn" className="block font-kn-display text-xl font-bold leading-tight">
            ಮತ್ತೊಮ್ಮೆ ನೋಡಿ
          </span>
          {subtitles && <span className="block font-poster text-base tracking-[0.2em]">Watch again</span>}
        </button>
        <Coupon price={MEAL.price} href="#interval" subtitles={subtitles} className="rotate-[2deg]" />
      </div>
    </div>
  )
}
