import { cn } from '../../lib/utils'

/**
 * Scattered, animated treasure-hunt props. Each is a transparent PNG dropped
 * into /public/hh2026 — this file only positions, sizes, and animates them.
 */

function ImageProp({ src, alt, className, aspect }) {
  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn('block bg-contain bg-center bg-no-repeat', className)}
      style={{ backgroundImage: `url('${src}')`, aspectRatio: aspect }}
    />
  )
}

export function Revolver({ className }) {
  return <ImageProp src="/hh2026/prop-revolver.png" aspect="1920 / 819" className={className} />
}

export function Coin({ className }) {
  return <ImageProp src="/hh2026/prop-coin.png" aspect="1264 / 1244" className={className} />
}

export function CompassRose({ className }) {
  return <ImageProp src="/hh2026/prop-compass.png" aspect="1 / 1" className={className} />
}

export function Rope({ className }) {
  return <ImageProp src="/hh2026/prop-rope.png" aspect="1536 / 1024" className={className} />
}

export function Footprints({ className }) {
  return <ImageProp src="/hh2026/prop-footprint.png" aspect="1536 / 1024" className={className} />
}

export function Key({ className }) {
  return <ImageProp src="/hh2026/prop-key.png" aspect="1672 / 941" className={className} />
}

/**
 * Unlike the other props this one has no transparency — it's a full
 * rectangular illustration (painted ragged edges on a solid backing), so
 * it's meant to be shown framed like the hero poster, not floated freely.
 */
export function TreasureMap({ className }) {
  return <ImageProp src="/hh2026/prop-map-scrap.png" aspect="1536 / 1024" className={className} />
}

export function TreasureChest({ className }) {
  return <ImageProp src="/hh2026/treasure-chest.png" aspect="1230 / 1278" className={className} />
}

/** Wide left→right footprint trail, meant to run under `animate-drift`. */
export function FootprintTrail({ className }) {
  return (
    <span aria-hidden="true" className={cn('flex w-[200%] gap-10', className)}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Footprints
          key={i}
          className={cn('h-10 w-14 shrink-0 opacity-50', i % 2 === 1 && 'translate-y-2')}
        />
      ))}
    </span>
  )
}

/** Reusable jagged-edge clipPath, referenced by the `clip-torn` utility. */
export function TornEdgeDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="torn-edge" clipPathUnits="objectBoundingBox">
          <path
            d="M0,0.03 L0.05,0.09 0.09,0.02 0.14,0.08 0.19,0.01 0.24,0.07
               0.3,0.02 0.36,0.09 0.42,0.015 0.47,0.08 0.53,0.02 0.58,0.09
               0.64,0.01 0.7,0.075 0.76,0.02 0.82,0.085 0.88,0.015 0.94,0.07
               1,0.02 1,1 0,1 Z"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

/**
 * Positions + animates any child prop. Purely presentational: absolute
 * placement, pointer-events disabled, one of the float/sway/spin motions.
 */
export function Roam({ children, className, motion = 'float', duration = '8s', delay = '0s' }) {
  const motionClass =
    motion === 'none'
      ? ''
      : motion === 'float'
        ? 'animate-float'
        : motion === 'sway'
          ? 'animate-sway'
          : 'animate-spin-slow'

  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute', motionClass, className)}
      style={{ '--roam-duration': duration, '--roam-delay': delay }}
    >
      {children}
    </span>
  )
}
