import { cn } from '@/lib/utils'

// Serial light strings draped over the scaffolding, in its 0–100 box:
// start, end, and how far each one sags.
export const STRINGS = [
  { from: [4, 10], to: [96, 10], sag: 10, n: 16 },
  { from: [4, 36], to: [96, 36], sag: 8, n: 16 },
  { from: [4, 62], to: [96, 62], sag: 7, n: 16 },
  { from: [4, 10], to: [50, 62], sag: 5, n: 10 },
]

const BULB_COLORS = ['#ffd24a', '#ff4b3e', '#ffd24a', '#ffe9a0']

// Bamboo poles tied with coir rope behind the cutout, and serial lights
// draped over them. More strings light up as the count grows.
export function Scaffolding({ strings }) {
  const pole = (x) => (
    <g key={x}>
      <line x1={x} y1="0" x2={x} y2="100" stroke="#b89a5c" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      {[12, 30, 50, 70, 88].map((y) => (
        <line key={y} x1={x - 0.9} y1={y} x2={x + 0.9} y2={y} stroke="#7a6232" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  )
  const bar = (y) => <line key={y} x1="0" y1={y} x2="100" y2={y + 1.5} stroke="#a88c50" strokeWidth="2" vectorEffect="non-scaling-stroke" />
  return (
    <div aria-hidden className="absolute -inset-x-[16%] -top-[6%] bottom-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {[4, 50, 96].map(pole)}
        {[10, 36, 62, 88].map(bar)}
        <line x1="4" y1="88" x2="50" y2="36" stroke="#a88c50" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        <line x1="96" y1="88" x2="50" y2="36" stroke="#a88c50" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {[4, 50, 96].flatMap((x) =>
          [10, 36, 62, 88].map((y) => <rect key={`${x}-${y}`} x={x - 1.2} y={y - 0.9} width="2.4" height="2.4" fill="#6b4a22" />)
        )}
      </svg>
      {STRINGS.map((s, i) => (
        <LightString key={i} {...s} on={i < strings} />
      ))}
    </div>
  )
}

function LightString({ from, to, sag, n, on }) {
  const bulbs = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = from[0] + (to[0] - from[0]) * t
    const y = from[1] + (to[1] - from[1]) * t + sag * 4 * t * (1 - t)
    bulbs.push(
      <span
        key={i}
        className={cn('absolute size-1.5 -translate-1/2 rounded-full sm:size-2', on && 'motion-safe:animate-twinkle')}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          backgroundColor: on ? BULB_COLORS[i % BULB_COLORS.length] : '#3a2a1a',
          boxShadow: on ? `0 0 6px 2px ${BULB_COLORS[i % BULB_COLORS.length]}99` : 'none',
          animationDelay: `${-((i * 0.37) % 1.6)}s`,
        }}
      />
    )
  }
  return bulbs
}
