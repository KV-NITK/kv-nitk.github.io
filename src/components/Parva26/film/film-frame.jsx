import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@p26/lib/gsap'
import { useFilmScreen } from '@p26/film/film-layer'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'

// A scene that plays "on screen": black screen masking around a projected
// frame with softly rounded corners and projector falloff. Flicker and dust
// are drawn by FilmLayer over the registered frame. As the scene ends, a round
// cue mark flashes twice in the top-right corner, the dot projectionists
// watched for before changing reels.
//
// Everything here is static on purpose: animating a scene-sized layer (CSS
// filters, a constant wobble) made the browser re-blend it every frame.
export function FilmFrame({ children }) {
  const frameRef = useRef(null)
  const cueRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  useFilmScreen(frameRef)

  useGSAP(
    () => {
      if (reduced) return
      ScrollTrigger.create({
        trigger: frameRef.current,
        start: 'bottom 60%',
        onEnter: () =>
          gsap
            .timeline()
            .set(cueRef.current, { opacity: 1 })
            .set(cueRef.current, { opacity: 0 }, 0.17)
            .set(cueRef.current, { opacity: 1 }, 0.9)
            .set(cueRef.current, { opacity: 0 }, 1.07),
      })
    },
    { scope: frameRef, dependencies: [reduced] }
  )

  return (
    <div className="bg-black p-1.5 sm:p-3">
      <div ref={frameRef} className="relative isolate overflow-hidden rounded-[14px] sm:rounded-[24px]">
        {children}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial from-transparent from-45% to-black/55" />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_28px_10px_rgba(0,0,0,.7)]" />
        <div
          ref={cueRef}
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-[5%] size-[clamp(18px,3vw,34px)] rounded-full bg-black/85 opacity-0 shadow-[0_0_0_2px_rgba(255,244,220,.35)]"
        />
      </div>
    </div>
  )
}
