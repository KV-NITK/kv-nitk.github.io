import { useId } from 'react'
import { Tag } from '@p26/scenes/07-guests/tag'

// A wobbly round blob for the wax seal, the same every render.
const SEAL = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2
  const r = 6.2 + [0.5, -0.2, 0.7, 0.1, -0.4, 0.6, 0.2, -0.3][i % 8]
  return `${(50 + Math.cos(a) * r).toFixed(2)} ${(61.5 + Math.sin(a) * r).toFixed(2)}`
})

const SEAL_PATH = `M${SEAL.join(' L')} Z`

const CRACK = '50.8,53 49.2,57.4 51.3,60.6 48.8,64.4 50.9,67.2 49.8,71'

// Hem points of the veil, and where its folds run from the knot to the hem.
const HEM = [92, 78, 64, 50, 36, 22, 8, -6]
  .map((x, i) => `Q${x + 7} ${i % 2 ? 149.5 : 149} ${x} 144.5`)
  .join(' ')

const VEIL = `M50 -3 C79 -3 103 20 103 49 C103 53 101 56 98.5 58 C101 72 104 104 106 144.5 ${HEM} C-4 104 -1 72 1.5 58 C-1 56 -3 53 -3 49 C-3 20 21 -3 50 -3 Z`

const TROUGHS = [8, 22, 36, 50, 64, 78, 92]

const RIDGES = [1, 15, 29, 43, 57, 71, 85, 99]

// Under the cord the cloth falls in nearly upright folds, flaring a little
// toward the hem; over the arch it lies smooth, with a few soft creases.
const cordY = (x) => 57.5 + 4 * (1 - ((x - 50) / 50) ** 2)

const lowerFold = (x) => {
  const top = 50 + (x - 50) * 0.8
  return `M${top.toFixed(1)} ${(cordY(top) + 1).toFixed(1)} Q${(50 + (x - 50) * 0.9).toFixed(1)} 100 ${x} 144`
}

const UPPER_FOLDS = ['M12 24 C16 37 18 48 19 58', 'M28 9 C31 28 33 44 34 59', 'M72 9 C69 28 67 44 66 59', 'M88 24 C84 37 82 48 81 58']

// The velvet veil, in frame units: the frame is 100 × 140 and the cloth
// hangs a little past it on every side.
export function Veil() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      aria-hidden
      data-veil
      viewBox="-6 -4 112 152"
      className="pointer-events-none absolute left-[-6%] top-[-2.857%] z-10 h-[108.57%] w-[112%] overflow-visible"
    >
      <defs>
        <linearGradient id={`${id}h`} x1="0" x2="1">
          <stop offset="0" stopColor="#5e0715" />
          <stop offset=".09" stopColor="#930b22" />
          <stop offset=".24" stopColor="#c8102e" />
          <stop offset=".5" stopColor="#d21b38" />
          <stop offset=".76" stopColor="#c8102e" />
          <stop offset=".91" stopColor="#930b22" />
          <stop offset="1" stopColor="#5e0715" />
        </linearGradient>
        <linearGradient id={`${id}v`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd9d9" stopOpacity=".16" />
          <stop offset=".4" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#2a0006" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6d77e" />
          <stop offset=".5" stopColor="#c9962f" />
          <stop offset="1" stopColor="#7d5714" />
        </linearGradient>
        <radialGradient id={`${id}s`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#c21a2e" />
          <stop offset=".7" stopColor="#8a0a1b" />
          <stop offset="1" stopColor="#5a0510" />
        </radialGradient>
        <radialGradient id={`${id}k`}>
          <stop offset="0" stopColor="#ffc2cb" stopOpacity=".22" />
          <stop offset="1" stopColor="#ffc2cb" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}l`}>
          <polygon points={`40,50 ${CRACK} 40,74`} />
        </clipPath>
        <clipPath id={`${id}r`}>
          <polygon points={`60,50 ${CRACK} 60,74`} />
        </clipPath>
      </defs>

      <g data-nudge>
        <g data-cloth>
          <g className="origin-top motion-safe:animate-veil-sway">
          <path d={VEIL} fill={`url(#${id}h)`} />
          <g fill="none" strokeLinecap="round">
            {UPPER_FOLDS.map((d) => (
              <path key={d} d={d} stroke="#4a0410" strokeOpacity=".2" strokeWidth="3.4" />
            ))}
            {TROUGHS.map((x) => (
              <path key={x} d={lowerFold(x)} stroke="#4a0410" strokeOpacity=".38" strokeWidth="4.2" />
            ))}
            {RIDGES.map((x) => (
              <path key={x} d={lowerFold(x)} stroke="#ff6b7f" strokeOpacity=".26" strokeWidth="1.3" />
            ))}
          </g>
          <path d={VEIL} fill={`url(#${id}v)`} />
          <ellipse cx="38" cy="24" rx="24" ry="15" fill={`url(#${id}k)`} />
          {/* Pile of the velvet: a fine sheen along the top */}
          <path d="M8 34 C18 12 34 2 50 1.5 C66 2 82 12 92 34" fill="none" stroke="#ff8a99" strokeOpacity=".22" strokeWidth="1.4" />
          </g>
        </g>

        <g data-cord>
          <path d="M0.5 57.5 Q50 65.5 99.5 57.5" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.9" />
          <path d="M0.5 57.5 Q50 65.5 99.5 57.5" fill="none" stroke="#6b4a10" strokeWidth="1.9" strokeDasharray="0.8 1.3" strokeOpacity=".7" />
          <path d="M49.5 62 C47 70 46 76 44.5 83" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.3" />
          <path d="M50.5 62 C53 69 55 74 57.5 80" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.3" />
          <path d="M44.5 82 C42.6 85 42.8 89 44.3 91 C45.8 89 46.4 85 44.5 82 Z" fill="#c9962f" />
          <path d="M57.5 79 C55.6 82 55.8 86 57.3 88 C58.8 86 59.4 82 57.5 79 Z" fill="#c9962f" />
          <path d="M50 61 C44 55 40 60 45 63.5 C47 64.5 49 62.5 50 61 Z M50 61 C56 55 60 60 55 63.5 C53 64.5 51 62.5 50 61 Z" fill={`url(#${id}g)`} />
          {/* Tag string from the knot */}
          <path d="M50 64 L50 74.5" stroke="#efe2c4" strokeWidth=".6" />
        </g>

        {['l', 'r'].map((half) => (
          <g key={half} data-seal={half} clipPath={`url(#${id}${half})`}>
            <path d={SEAL_PATH} fill={`url(#${id}s)`} stroke="#4a0410" strokeWidth=".4" />
            <circle cx="50" cy="61.5" r="4.3" fill="none" stroke="#4a0410" strokeOpacity=".5" strokeWidth=".7" />
            <circle cx="50" cy="61.9" r="4.3" fill="none" stroke="#ff9aa6" strokeOpacity=".3" strokeWidth=".5" />
            <text x="50" y="64.8" textAnchor="middle" fontSize="6.4" fontFamily="'Baloo Tamma 2 Variable', sans-serif" fontWeight="700" fill="#ff9aa6" fillOpacity=".35">
              ಕ
            </text>
            <text x="50" y="64.4" textAnchor="middle" fontSize="6.4" fontFamily="'Baloo Tamma 2 Variable', sans-serif" fontWeight="700" fill="#4a0410">
              ಕ
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
