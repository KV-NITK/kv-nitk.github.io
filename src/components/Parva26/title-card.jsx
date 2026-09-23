import { useRef } from 'react'
import { sayLine } from './subtitle-strip'
import { graphemes } from './text'
import { gsap, useGSAP } from './fx/gsap'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

const TAGLINE_EN = 'A festival for the land of sandalwood: its forests, its craft and its cinema'
const AKSHARAS = graphemes('ಪರ್ವ')

// A 70s–80s Kannada film title: deep brown block extrusion down and to the
// right, from the lit front face to the dark back.
const EXTRUSION = (() => {
  const steps = 12
  const step = 0.0072
  const shades = ['#7a3710', '#6a2e0c', '#5a270a', '#4b2008', '#3e1a06', '#331505']
  const layers = Array.from({ length: steps }, (_, i) => {
    const d = ((i + 1) * step).toFixed(4)
    return `${d}em ${d}em 0 ${shades[Math.floor((i / steps) * shades.length)]}`
  })
  const depth = (steps * step).toFixed(3)
  layers.push(`${depth}em ${depth}em 0.12em rgba(0,0,0,.55)`)
  return layers.join(', ')
})()

// What the projector shows over the forest (brief, Scene 2), sized to the
// screen with container units. It plays like old opening credits: the
// "presents" card fades in and out, each akshara of ಪರ್ವ flies in from deep
// in the screen and settles, a shine crosses the letters, then the credit
// returns above the title and the tagline is subtitled.
export function TitleCard() {
  const rootRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef)
      const nearTop = () => window.scrollY < window.innerHeight * 0.5
      if (reduced) {
        if (nearTop()) sayLine(TAGLINE_EN)
        return
      }

      gsap.set([q('[data-presents]'), q('[data-akshara]'), q('[data-parva-en]'), q('[data-tagline]')], { autoAlpha: 0 })
      const tl = gsap.timeline({ paused: true, delay: 0.2 })
      tl.to(q('[data-presents]'), { autoAlpha: 1, duration: 0.7, ease: 'power1.out' })
        .to(q('[data-presents]'), { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, '+=1.1')
        .fromTo(
          q('[data-akshara]'),
          { autoAlpha: 0, scale: 0.12, yPercent: -12, filter: 'blur(10px)' },
          { autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.85, ease: 'back.out(2.2)', stagger: 0.32, clearProps: 'filter' },
          '+=0.15'
        )
        .fromTo(q('[data-shine]'), { backgroundPositionX: '100%' }, { backgroundPositionX: '0%', duration: 1.1, ease: 'power2.inOut' }, '-=0.1')
        .fromTo(
          q('[data-parva-en]'),
          { autoAlpha: 0, letterSpacing: '1.1em' },
          { autoAlpha: 1, letterSpacing: '0.45em', duration: 1, ease: 'power2.out' },
          '<0.1'
        )
        .to([q('[data-presents]'), q('[data-tagline]')], { autoAlpha: 1, duration: 0.8, ease: 'power1.out' }, '-=0.3')
        .call(() => nearTop() && sayLine(TAGLINE_EN))

      // Start once the fonts are in, so the letters don't reshape mid-flight.
      document.fonts.ready.then(() => tl.play())
    },
    { scope: rootRef, dependencies: [reduced] }
  )

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 flex flex-col items-center justify-center pb-[9cqh] text-center [text-shadow:0_2px_10px_rgba(20,8,0,.55)]"
    >
      <p data-presents lang="kn" data-en="Kannada Vedike presents" className="font-kn-body text-[max(0.8rem,4.2cqh)] font-medium text-[#fbf0d8]">
        ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ
      </p>

      <h1 className="mt-[1cqh]">
        <span className="sr-only">
          <span lang="kn">ಪರ್ವ</span> Parva 2026
        </span>
        <span aria-hidden lang="kn" className="flex font-kn-display text-[min(19cqw,27cqh)] font-extrabold leading-[1.05]">
          {AKSHARAS.map((akshara, i) => (
            <span key={i} data-akshara className={cn('inline-grid', i > 0 && '-ml-[0.04em]')}>
              {/* Back to front: extrusion, kumkuma outline, gold face, shine */}
              <span className="col-start-1 row-start-1 text-[#7a3710] [-webkit-text-stroke:0.085em_#7a3710]" style={{ textShadow: EXTRUSION }}>
                {akshara}
              </span>
              <span className="col-start-1 row-start-1 text-kumkuma [-webkit-text-stroke:0.085em_var(--color-kumkuma)] [text-shadow:none]">
                {akshara}
              </span>
              <span className="col-start-1 row-start-1 bg-linear-to-b from-[#fff4b8] from-15% via-arishina via-55% to-[#c47c0c] bg-clip-text text-transparent [text-shadow:none]">
                {akshara}
              </span>
              <span
                data-shine
                className="col-start-1 row-start-1 bg-[linear-gradient(100deg,transparent_40%,rgba(255,255,245,.95)_50%,transparent_60%)] bg-size-[300%_100%] bg-position-[100%_0] bg-no-repeat bg-clip-text text-transparent [text-shadow:none]"
              >
                {akshara}
              </span>
            </span>
          ))}
        </span>
        <span aria-hidden data-parva-en className="mt-[1.5cqh] block pl-[0.45em] font-poster text-[max(1rem,6.5cqh)] leading-none tracking-[0.45em] text-[#fbf0d8]">
          PARVA 2026
        </span>
      </h1>

      <p data-tagline data-en={TAGLINE_EN} className="mt-[3cqh]">
        <span lang="kn" className="font-kn-display text-[max(0.85rem,4.4cqh)] font-semibold text-[#fbf0d8]/95">ಗಂಧದ ಗುಡಿಯ ಹಬ್ಬ</span>
        <span lang="en" className="sr-only">{TAGLINE_EN}</span>
      </p>
    </div>
  )
}
