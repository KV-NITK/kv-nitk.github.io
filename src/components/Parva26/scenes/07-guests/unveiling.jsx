import { useId } from 'react'
import { gsap } from '@p26/lib/gsap'
import { cn } from '@/lib/utils'

// After the unveiling, the velvet lies bunched over the bottom of the frame.
export function FoldedVelvet({ hidden }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      aria-hidden
      data-folded
      viewBox="0 0 108 24"
      className={cn('pointer-events-none absolute -left-[4%] bottom-[-7%] z-10 w-[108%] overflow-visible', hidden && 'invisible')}
    >
      <defs>
        <linearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d21b38" />
          <stop offset=".55" stopColor="#a30c26" />
          <stop offset="1" stopColor="#5e0715" />
        </linearGradient>
      </defs>
      <path
        d="M3 7 C11 1 19 6 27 2.5 C35 0 43 5.5 53 2.5 C63 0 71 5.5 81 2.5 C91 0 99 5 105 6 C107 12 105 18 101 22 Q93 19 87 22.5 Q79 19 71 22.5 Q63 19 55 22.5 Q47 19 39 22.5 Q31 19 23 22.5 Q15 19 7 22 C3 18 1.5 12 3 7 Z"
        fill={`url(#${id}f)`}
      />
      <g fill="none" strokeLinecap="round">
        {[15, 31, 47, 63, 79, 95].map((x) => (
          <path key={x} d={`M${x} 5 C${x - 1} 11 ${x + 1} 16 ${x - 1} 21`} stroke="#3e030c" strokeOpacity=".45" strokeWidth="2.6" />
        ))}
        {[22, 39, 55, 71, 87].map((x) => (
          <path key={x} d={`M${x} 4 C${x + 1} 10 ${x - 1} 15 ${x} 20`} stroke="#ff7084" strokeOpacity=".3" strokeWidth="1" />
        ))}
      </g>
      {/* The gold cord, coiled on top */}
      <path d="M62 6 C70 1 80 3 78 8 C76 12 66 10 68 5" fill="none" stroke="#d9ab45" strokeWidth="1.4" />
    </svg>
  )
}

// A puff of arishina and kumkuma as the portrait appears.
export function Puff() {
  return (
    <span aria-hidden className="pointer-events-none absolute bottom-[4%] left-1/2 z-30">
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          data-puff
          className={cn('absolute size-1.5 rounded-full opacity-0', i % 3 ? 'bg-arishina' : 'bg-kumkuma', i % 4 === 0 && 'size-2.5 blur-[1px]')}
        />
      ))}
    </span>
  )
}

// About two seconds: the seal cracks, the cord and tag drop, the velvet
// slides down and bunches at the base, the lamp clicks on with a stutter,
// and a puff of powder goes up. With reduced motion the veil just fades.
export function unveil(box, reduced, onDone) {
  const q = gsap.utils.selector(box)
  const tl = gsap.timeline({ onComplete: onDone })
  if (reduced) {
    return tl.to(q('[data-veil], [data-tag]'), { autoAlpha: 0, duration: 0.4 }).set(q('[data-folded]'), { visibility: 'visible' })
  }
  const w = box.offsetWidth
  tl.to(q('[data-seal="l"]'), { rotate: -32, x: -4, y: 14, autoAlpha: 0, duration: 0.5, ease: 'power2.in', transformOrigin: '50% 50%' }, 0)
    .to(q('[data-seal="r"]'), { rotate: 26, x: 4, y: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.in', transformOrigin: '50% 50%' }, 0.03)
    .to(q('[data-cord]'), { y: 34, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.22)
    .to(q('[data-tag]'), { y: w * 0.5, rotate: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0.22)
    .to(q('[data-cloth]'), { scaleY: 0.12, duration: 0.75, ease: 'power2.in', transformOrigin: '50% 100%' }, 0.45)
    .to(q('[data-cloth]'), { autoAlpha: 0, duration: 0.12 }, 1.08)
    .fromTo(q('[data-folded]'), { visibility: 'visible', scaleY: 0.2, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: '50% 0%' }, 1.05)
    .fromTo(q('[data-lamp-light]'), { opacity: 0 }, { keyframes: { opacity: [0, 0.85, 0.15, 1] }, duration: 0.35, ease: 'none' }, 1.3)
  q('[data-puff]').forEach((dot) => {
    const a = gsap.utils.random(-Math.PI * 0.95, -Math.PI * 0.05)
    const r = gsap.utils.random(0.18, 0.6) * w
    tl.set(dot, { x: 0, y: 0, autoAlpha: 1, scale: gsap.utils.random(0.6, 1.4) }, 1.3)
      .to(dot, { x: Math.cos(a) * r, y: Math.sin(a) * r, duration: 0.55, ease: 'power2.out' }, 1.3)
      .to(dot, { y: `+=${w * 0.25}`, autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, 1.85)
  })
  return tl
}
