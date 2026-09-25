import { useRef } from 'react'
import { En, usePrefs } from '@p26/lib/prefs'
import { CREDITS, SPONSORS, HOOMALE } from '@p26/content'
import { FilmFrame } from '@p26/film/film-frame'
import { gsap, ScrollTrigger, useGSAP } from '@p26/lib/gsap'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { willChange } from '@p26/lib/layers'
import { cn } from '@/lib/utils'
import { GLOW } from '@p26/scenes/12-credits/glow'
import { useCreditsDrift } from '@p26/scenes/12-credits/use-credits-drift'
import { MakingOf } from '@p26/scenes/12-credits/making-of'
import { SmallPrint } from '@p26/scenes/12-credits/small-print'
import { Shubham, Curtain, StageFront } from '@p26/scenes/12-credits/ending'

// Scene 12, the credits and ಶುಭಂ (allscenes.md). After a silent black beat,
// the end credits roll on the screen in projected cream, the team credited
// as a film crew (names from the main site's team list). Beside them a
// small inset plays "making of" photos, sepia turning to colour; it is also
// the gallery. The roll drifts up on its own when you stop scrolling, and
// pauses on the thank-you card. The small print, contact and links come at
// the very end, as in a film. Then ಶುಭಂ, the curtain closes over the screen,
// and the stage front offers "watch again" and one last Book.

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
            onToggle: (self) => willChange([left, right], self.isActive && 'transform'),
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
                <En as="p" className={cn('font-poster text-base tracking-[0.3em] opacity-80', GLOW)}>Kannada Vedike presents</En>
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
                <En as="p" className={cn('font-poster text-sm tracking-[0.2em] opacity-75', GLOW)}>Special thanks</En>
                <p className={cn('mt-3 max-w-md font-kn-body text-lg leading-relaxed', GLOW)}>{SPONSORS.map((s) => s.name).join(' · ')}</p>
              </div>

              {/* The roll pauses on this card */}
              <div ref={thanksRef} className="flex min-h-[55svh] flex-col items-center justify-center">
                <p lang="kn" className={cn('font-kn-display text-3xl font-bold leading-snug sm:text-4xl', GLOW)}>
                  ಅಭಿಮಾನಿ ದೇವರುಗಳಿಗೆ ಧನ್ಯವಾದ
                </p>
                <En as="p" className={cn('mt-2 font-kn-body text-lg', GLOW)}>Thank you to our fans, who are our gods</En>
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
