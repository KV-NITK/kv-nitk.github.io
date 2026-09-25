import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { GUESTS, PAST_GUESTS, SPONSORS, SPONSOR_TIERS } from '@p26/content'
import { GuestFrame, revealTime } from '@p26/scenes/07-guests/honour-frame'
import { FilmFrame } from '@p26/film/film-frame'
import { gsap, useGSAP } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { vineAcross, vineDown } from '@p26/styles/carving'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { useOnScreen, PAUSED } from '@p26/lib/on-screen'
import { willChange } from '@p26/lib/layers'
import { cn } from '@/lib/utils'
import sandalPanel from '@p26/assets/textures/sandal-panel.webp'

// Scene 7, ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance (allscenes.md). The
// theatre's lobby: a sandalwood-panelled wall of honour. This year's guests
// hang under velvet until their unveiling date, with the Chief Guest in the
// middle; along the wall, the guests of past Parvas with their lamps lit;
// at the end, the producers' board, where the sponsors are credited the way
// a film credits its backers. On a laptop the camera pans along the wall as
// you scroll; on a phone the wall is stacked and scrolls normally.

// Wall sizes: on a laptop they follow the height of the screen (cqh), so
// the whole wall fits in one shot from top to bottom.
const SIZES = {
  chief: '[--fw:min(66vw,17rem)] lg:[--fw:26.5cqh]',
  guest: '[--fw:min(38vw,10.5rem)] lg:[--fw:19.5cqh]',
  past: '[--fw:min(38vw,10.5rem)] lg:[--fw:18.5cqh]',
}

// Sandalwood panels: grain and the groove between panels are baked into a
// small bitmap tile. Drawn live (gradients and an SVG tile) they made the
// wall several times slower to paint as the camera pans onto it.
const WALL = {
  backgroundImage: `linear-gradient(180deg, rgba(255,242,214,.3), transparent 32%, transparent 72%, rgba(70,34,10,.22)), url(${sandalPanel}), linear-gradient(180deg, #d3a26d, #c8955f 55%, #b9854f)`,
  backgroundSize: 'auto, 16rem 32rem, auto',
}

const WOOD =
  'repeating-linear-gradient(90deg, rgba(0,0,0,.14) 0 2px, transparent 2px 11px), linear-gradient(180deg, #7a4829, #5a3219 60%, #3e2110)'

// Before the backend exists (build step 16), `?unveil` shows what an
// unveiling looks like: the next guest due is "revealed" with stand-in
// details. Nothing real is in here.
const PREVIEW = {
  name: { kn: 'ಅತಿಥಿಯ ಹೆಸರು', en: 'Guest’s name' },
  photo: PAST_GUESTS[0].photo,
  card: {
    when: { kn: 'ಅಕ್ಟೋಬರ್ 29 · ಬೆಳಿಗ್ಗೆ 11:00', en: '29 Oct, 11:00 AM, SJA' },
    line: 'A preview of an unveiling; the real guest appears here on their date.',
    link: '/events',
  },
  preview: true,
}

function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function GuestsScene() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const wallRef = useRef(null)
  const railRef = useRef(null)
  const [open, setOpen] = useState(null)
  const now = useNow()
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()

  // The next covered guest due gets the countdown and the trembling cord.
  const nextId = useMemo(
    () =>
      GUESTS.filter((g) => !g.name && revealTime(g.revealDate) > now).sort((a, b) => revealTime(a.revealDate) - revealTime(b.revealDate))[0]?.id,
    [now]
  )
  const guests = useMemo(() => {
    const preview = new URLSearchParams(window.location.search).has('unveil')
    return [...GUESTS].sort((a, b) => a.place - b.place).map((g) => (preview && g.id === nextId && !g.name ? { ...g, ...PREVIEW } : g))
    // The preview guest is chosen once; it shouldn't jump as the clock ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const pastYears = [...new Set(PAST_GUESTS.map((g) => g.year))].sort((a, b) => b - a)

  // Veils and lamps only move while the wall is on screen.
  const live = useOnScreen(stageRef)

  // Tapping anywhere else, or Escape, closes the open card or hint.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!e.target.closest?.(`[data-guest="${open}"]`)) setOpen(null)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // On a laptop the section holds for about a screen while the camera pans
  // along the wall; the rope barrier in front moves faster, for depth.
  // The wall and rope only ever slide (never scale), so they keep their own
  // layers for as long as the scene is near the screen: dropping the layer
  // after each scroll, as the hero does, would re-raster the whole wall on
  // every new scroll.
  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const wall = wallRef.current
        const rail = railRef.current
        const distance = () => Math.max(0, wall.offsetWidth - stageRef.current.clientWidth)
        const near = new IntersectionObserver(
          ([entry]) => {
            willChange([wall, rail], entry.isIntersecting && 'transform')
          },
          { rootMargin: '50% 0px' }
        )
        near.observe(stageRef.current)
        gsap
          .timeline({
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, invalidateOnRefresh: true },
          })
          .to({}, { duration: 0.1 })
          .to(wall, { x: () => -distance(), ease: 'none', duration: 1 })
          .to(rail, { x: () => -distance() * 1.3, ease: 'none', duration: 1 }, '<')
          .to({}, { duration: 0.1 })
        return () => {
          near.disconnect()
          willChange([wall, rail], false)
        }
      })
      return () => mm.revert()
    },
    { scope: sectionRef, dependencies: [reduced] }
  )

  const toggle = (id) => () => setOpen((current) => (current === id ? null : id))

  return (
    <section ref={sectionRef} id="guests" aria-labelledby="guests-title" className="scroll-mt-14">
      <FilmFrame>
        <div
          ref={stageRef}
          className={cn('relative overflow-hidden bg-sandal lg:h-[calc(100svh-1.5rem)] lg:[container-type:size]', !live && PAUSED)}
        >
          <div ref={wallRef} className="relative flex flex-col lg:h-full lg:w-max lg:flex-row" style={WALL}>
            <Cornice />
            <Dado />

            {/* This year's guests */}
            <div className="relative flex flex-col items-center px-4 pb-14 pt-[11rem] lg:min-w-[100cqw] lg:justify-center lg:px-[7cqh] lg:pb-[12cqh] lg:pt-[18cqh]">
              <TitleSign subtitles={subtitles} />
              <ul className="grid w-full max-w-md grid-cols-2 justify-items-center gap-x-3 gap-y-8 lg:flex lg:w-auto lg:max-w-none lg:items-center lg:gap-[4.2cqh]">
                {guests.map((guest) => (
                  <li key={guest.id} data-guest={guest.id} className={cn(guest.chief && 'col-span-2 max-lg:order-first')}>
                    <GuestFrame
                      guest={guest}
                      next={guest.id === nextId}
                      now={now}
                      open={open === guest.id}
                      onToggle={toggle(guest.id)}
                      className={guest.chief ? SIZES.chief : SIZES.guest}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <Pilaster />

            {/* Guests of past Parvas */}
            {pastYears.map((year) => (
              <div key={year} className="relative flex flex-col items-center px-4 pb-14 pt-4 lg:justify-center lg:px-[7cqh] lg:pb-[13cqh] lg:pt-[13cqh]">
                <BrassPlate as="h3" kn={`ಪರ್ವ ${year}ರ ಅತಿಥಿಗಳು`} en={`Guests of Parva ${year}`} subtitles={subtitles} />
                <ul className="mt-2 grid w-full max-w-md grid-cols-2 justify-items-center gap-x-3 gap-y-8 [&>li:last-child:nth-child(odd)]:col-span-2 lg:mt-[1cqh] lg:flex lg:w-auto lg:max-w-none lg:gap-[3.6cqh]">
                  {PAST_GUESTS.filter((g) => g.year === year).map((guest) => (
                    <li key={guest.id} data-guest={guest.id}>
                      <GuestFrame
                        guest={{ ...guest, card: { when: guest.when, line: guest.line } }}
                        past
                        open={open === guest.id}
                        onToggle={toggle(guest.id)}
                        className={SIZES.past}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <Pilaster />

            <ProducersBoard subtitles={subtitles} />

            <Pilaster className="lg:mr-[10cqh]" />
          </div>

          <Rail ref={railRef} />
        </div>
      </FilmFrame>
    </section>
  )
}

// The carved heartwood cornice along the top of the wall.
function Cornice() {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 h-16 lg:h-[8.5cqh]" style={{ backgroundImage: WOOD }}>
      <span className="absolute inset-x-0 bottom-0 h-4 shadow-[0_6px_10px_rgba(40,18,4,.45)] lg:h-[2.4cqh]" style={vineAcross} />
      <span className="absolute inset-x-0 top-0 h-px bg-[#f0c890]/30" />
    </div>
  )
}

// Panelled heartwood dado along the bottom, under a carved rail.
function Dado() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-8 lg:h-[11cqh]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, transparent 0 1.4rem, rgba(0,0,0,.3) 1.4rem calc(1.4rem + 2px), rgba(255,220,170,.12) calc(1.4rem + 2px) calc(1.4rem + 3px), transparent calc(1.4rem + 3px) 10rem), ' +
          WOOD,
      }}
    >
      <span className="absolute inset-x-0 top-0 h-3 shadow-[0_-4px_8px_rgba(40,18,4,.3)] lg:h-[2.2cqh]" style={vineAcross} />
    </div>
  )
}

// A carved sandalwood pilaster between two stretches of the wall.
function Pilaster({ className }) {
  return (
    <div
      aria-hidden
      className={cn('relative hidden h-full w-[6.5cqh] shrink-0 shadow-[6px_0_12px_rgba(60,28,8,.35),-6px_0_12px_rgba(60,28,8,.35)] lg:block', className)}
      style={{ backgroundImage: WOOD }}
    >
      <span className="absolute inset-x-[22%] inset-y-[13cqh]" style={vineDown} />
    </div>
  )
}

// Raised brass letters fixed to the wall under the cornice (the cornice
// itself sits under the top bar).
function TitleSign({ subtitles }) {
  return (
    <h2 id="guests-title" className="absolute inset-x-0 top-[4.75rem] flex flex-col items-center text-center lg:top-[9.5cqh]">
      <span
        lang="kn"
        className="font-kn-display text-[2.6rem] font-extrabold leading-none text-[#f0cf86] [text-shadow:0_1px_0_#fff3cf,0_2px_0_#b07d2c,0_3px_0_#8a5e1c,0_4px_0_#6a4512,0_8px_10px_rgba(60,28,6,.5)] lg:text-[5.4cqh]"
      >
        ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ
      </span>
      <span className={cn('mt-1 font-poster text-lg tracking-[0.35em] text-[#5a3219] lg:mt-[0.6cqh] lg:text-[2.3cqh]', !subtitles && 'sr-only')}>
        Special appearance
      </span>
    </h2>
  )
}

// An engraved brass plate screwed to the wall.
function BrassPlate({ as: Tag = 'p', kn, en, subtitles, className }) {
  return (
    <Tag
      className={cn(
        'relative flex flex-col items-center rounded-[3px] px-7 py-1.5 text-center shadow-[0_3px_5px_rgba(50,24,6,.5),inset_0_1px_0_rgba(255,248,220,.6),inset_0_-1px_0_rgba(80,50,10,.5)]',
        className
      )}
      style={brass}
    >
      {['left-2', 'right-2'].map((at) => (
        <span key={at} aria-hidden className={cn('absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#6b4a14] shadow-[inset_0_1px_1px_rgba(0,0,0,.6),0_1px_0_rgba(255,240,200,.5)]', at)} />
      ))}
      <span lang="kn" className="font-kn-serif text-base font-bold leading-tight text-[#3a2406] [text-shadow:0_1px_0_rgba(255,238,190,.65)] lg:text-[2.2cqh]">
        {kn}
      </span>
      <span className={cn('font-poster text-base leading-tight tracking-[0.14em] text-[#4a300c] [text-shadow:0_1px_0_rgba(255,238,190,.6)] lg:text-[2cqh]', !subtitles && 'sr-only')}>
        {en}
      </span>
    </Tag>
  )
}

// The producers' board: each tier of sponsors under its own brass plate,
// every logo on an ivory enamel plate with a maroon rim and brass screws.
function ProducersBoard({ subtitles }) {
  const tier = (id) => SPONSOR_TIERS.find((t) => t.id === id)
  const of = (id) => SPONSORS.filter((s) => s.tier === id)
  return (
    <div className="relative flex flex-col items-center gap-6 px-4 pb-20 pt-6 lg:justify-center lg:gap-[3cqh] lg:px-[7cqh] lg:pb-[13cqh] lg:pt-[13cqh]">
      <h3 className="sr-only">Sponsors</h3>
      <SponsorGroup tier={tier('executive')} sponsors={of('executive')} big subtitles={subtitles} />
      <div className="flex w-full flex-col items-center gap-6 lg:w-auto lg:flex-row lg:items-start lg:gap-[5cqh]">
        <SponsorGroup tier={tier('associate')} sponsors={of('associate')} subtitles={subtitles} />
        <SponsorGroup tier={tier('media')} sponsors={of('media')} subtitles={subtitles} />
      </div>
    </div>
  )
}

function SponsorGroup({ tier, sponsors, big, subtitles }) {
  if (!sponsors.length) return null
  return (
    <div className="flex w-full flex-col items-center lg:w-auto">
      <BrassPlate as="h4" kn={tier.kn} en={tier.en} subtitles={subtitles} />
      <ul
        className={cn(
          'mt-3 grid w-full max-w-md justify-center gap-3 lg:mt-[1.8cqh] lg:w-auto lg:max-w-none lg:gap-[2cqh]',
          sponsors.length > 1 ? 'grid-cols-2' : 'grid-cols-[minmax(0,12rem)] lg:grid-cols-1'
        )}
      >
        {sponsors.map((sponsor) => (
          <li key={sponsor.id}>
            <EnamelPlate sponsor={sponsor} big={big} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function EnamelPlate({ sponsor, big }) {
  const Plate = sponsor.href ? 'a' : 'div'
  return (
    <Plate
      {...(sponsor.href ? { href: sponsor.href, target: '_blank', rel: 'noreferrer' } : {})}
      className={cn(
        'relative isolate block aspect-[8/5] w-full rounded-[0.55rem] p-[5%] shadow-[0_0.5rem_0.7rem_-0.2rem_rgba(58,26,6,.55)]',
        big ? 'lg:w-[19cqh]' : 'lg:w-[14cqh]',
        sponsor.href && 'transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kumkuma'
      )}
      style={{ backgroundImage: 'linear-gradient(180deg, #7a1d14, #4a0f09)' }}
    >
      <span
        className="relative grid size-full place-items-center rounded-[0.35rem] bg-[#f7f1e2] p-[8%] shadow-[inset_0_0_0_1px_rgba(0,0,0,.18),inset_0_-2px_4px_rgba(120,90,40,.2)]"
      >
        <img src={sponsor.logo} alt={sponsor.name} loading="lazy" decoding="async" className="absolute inset-[9%] size-[82%] object-contain mix-blend-multiply" />
        {/* Gloss of the enamel */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-160 from-white/45 via-transparent via-35% to-transparent" />
      </span>
      {['left-[2.5%] top-[4%]', 'right-[2.5%] top-[4%]', 'bottom-[4%] left-[2.5%]', 'bottom-[4%] right-[2.5%]'].map((at) => (
        <span key={at} aria-hidden className={cn('absolute size-1.5 rounded-full shadow-[0_1px_1px_rgba(0,0,0,.6)]', at)} style={brass} />
      ))}
      {/* A chip in the enamel rim */}
      <span aria-hidden className="absolute bottom-[1%] right-[18%] h-[5%] w-[7%] rounded-[40%] bg-[#1c1712]" />
    </Plate>
  )
}

// The queue barrier in front of the wall: brass posts and a sagging velvet
// rope. It sits closer to the camera, so it slides past faster.
function Rail({ ref }) {
  const posts = 12
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute bottom-0 left-0 hidden h-[17cqh] lg:block" style={{ width: `${posts * 44}cqh` }}>
      {Array.from({ length: posts }, (_, i) => (
        <span key={i} className="absolute bottom-0 h-full w-[7cqh]" style={{ left: `${i * 44 + 10}cqh` }}>
          {i < posts - 1 && (
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute left-1/2 top-[9%] h-[22%] w-[44cqh] overflow-visible">
              <path d="M0 2 Q50 26 100 2" fill="none" stroke="#6e0818" strokeWidth="7" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
              <path d="M0 2 Q50 26 100 2" fill="none" stroke="#c8102e" strokeWidth="4.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
              <path d="M0 1 Q50 25 100 1" fill="none" stroke="#ff7a8c" strokeOpacity=".45" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </svg>
          )}
          {/* Base, pole and ball top */}
          <span className="absolute bottom-[1%] left-0 h-[9%] w-full rounded-[50%] shadow-[0_0.6cqh_1cqh_rgba(20,8,2,.55)]" style={brass} />
          <span className="absolute bottom-[5%] left-1/2 top-[12%] w-[1.5cqh] -translate-x-1/2 shadow-[inset_-0.4cqh_0_0.5cqh_rgba(60,30,6,.5)]" style={brass} />
          <span className="absolute left-1/2 top-[1%] size-[3cqh] -translate-x-1/2 rounded-full shadow-[inset_-0.5cqh_-0.5cqh_0.8cqh_rgba(60,30,6,.55)]" style={brass} />
        </span>
      ))}
    </div>
  )
}
