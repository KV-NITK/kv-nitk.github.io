import { useEffect, useRef, useState } from 'react'
import { usePrefs } from './prefs'
import { MEAL, MENU, eventDay } from './data'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

// The Bhoori Bhojana poster in the lobby's glass display frame (Scene 8,
// allscenes.md). A banana leaf, sprinkled with water, fills the middle; when
// it comes into view the dishes are served onto it one at a time, in the
// menu's order. Hovering or tapping a dish names it in the subtitle strip.

// Where each dish sits on the 400 × 220 leaf.
const PLACES = {
  chapati: [78, 108],
  sukka: [160, 64],
  kabab: [226, 70],
  bowl: [288, 50],
  gheeRice: [168, 142],
  rice: [252, 150],
  vada: [106, 180],
  sweet: [196, 192],
  curd: [342, 110],
}

export function FeastPoster({ className }) {
  const leafRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const [served, setServed] = useState(false)
  const day = eventDay(MEAL.day)

  // Served once per visit, when the leaf is well in view and the lobby's
  // lights are on (during the interval move the doors still hide it).
  useEffect(() => {
    if (served) return
    const leaf = leafRef.current
    const lobby = leaf.closest('[data-lobby]')
    let visible = false
    const check = () => visible && (!lobby || lobby.hasAttribute('data-lit')) && setServed(true)
    const seen = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        check()
      },
      { threshold: 0.6 }
    )
    seen.observe(leaf)
    const lit = lobby && new MutationObserver(check)
    lit?.observe(lobby, { attributes: true, attributeFilter: ['data-lit'] })
    return () => {
      seen.disconnect()
      lit?.disconnect()
    }
  }, [served])

  const shown = served || reduced

  return (
    <div data-food className={cn('relative rounded-[6px] p-2.5 shadow-[0_1.2rem_1.6rem_-0.6rem_rgba(20,30,20,.55)]', className)} style={{ backgroundImage: 'linear-gradient(180deg, #6a4424, #4a2c14)' }}>
      {/* Screws of the display frame */}
      {['left-1 top-1', 'right-1 top-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((at) => (
        <span key={at} aria-hidden className={cn('absolute size-1.5 rounded-full bg-[#c9a052] shadow-[0_1px_1px_rgba(0,0,0,.6)]', at)} />
      ))}
      <div
        className="relative overflow-hidden rounded-[2px] px-4 pb-0 pt-5 text-center"
        style={{ backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 52%, #8a2a18, transparent 70%), linear-gradient(180deg, #6e1d12, #561409 60%, #3f0e06)' }}
      >
        <h3 className="relative">
          <span
            lang="kn"
            className="block font-kn-display text-5xl font-extrabold leading-none text-arishina"
            style={{ textShadow: '-1px -1px 0 #7a0a16, 1px -1px 0 #7a0a16, -1px 1px 0 #7a0a16, 1px 1px 0 #7a0a16, 3px 3px 0 #2a0604' }}
          >
            ಭೂರಿ ಭೋಜನ
          </span>
          <span lang="kn" className="mt-2 block font-kn-display text-lg font-semibold leading-tight text-[#f6e3bc]">
            ಬಾಳೆ ಎಲೆ ಊಟ
          </span>
          <span className={cn('block font-poster text-lg tracking-[0.14em] text-[#f6e3bc]/85', !subtitles && 'sr-only')}>A full meal on a banana leaf</span>
        </h3>

        <svg ref={leafRef} viewBox="0 0 400 220" className="relative -mx-2 mt-3 block w-[calc(100%+1rem)] overflow-visible" aria-hidden>
          <Leaf />
          {MENU.map((item, i) => {
            const [x, y] = PLACES[item.dish] ?? [200, 110]
            const Dish = DISHES[item.dish] ?? DISHES.bowl
            return (
              <g
                key={item.id}
                data-en={`${item.kn} · ${item.en}`}
                className="cursor-help"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  opacity: shown ? 1 : 0,
                  transform: shown ? 'none' : 'translateY(-16px) scale(.9)',
                  transition: reduced ? 'none' : 'opacity .45s ease-out, transform .5s cubic-bezier(.2,.9,.3,1.25)',
                  transitionDelay: reduced ? '0s' : `${0.3 + i * 0.35}s`,
                }}
              >
                <Dish x={x} y={y} />
              </g>
            )
          })}
        </svg>
        <ul className="sr-only">
          {MENU.map((item) => (
            <li key={item.id}>
              <span lang="kn">{item.kn}</span> · {item.en}
            </li>
          ))}
        </ul>

        {/* When and where: normal digits, big enough to read (A5, A7) */}
        <p className="relative -mx-4 mt-3 bg-kumkuma px-3 py-2 text-[#fff4dc]">
          <span lang="kn" className="block font-kn-display text-lg font-bold leading-tight">
            {day.kn} · {MEAL.time.kn}
          </span>
          <span lang="kn" className="block font-kn-display text-base font-semibold leading-tight">
            {MEAL.venue.kn}
          </span>
          {subtitles && (
            <span className="mt-0.5 block text-base font-semibold leading-tight opacity-85">
              {day.en}, {MEAL.time.en} · {MEAL.venue.en}
            </span>
          )}
        </p>
      </div>
      {/* Glass of the display frame */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-2.5"
        style={{ backgroundImage: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,.12) 24%, transparent 30%, transparent 62%, rgba(255,255,255,.07) 65%, transparent 70%)' }}
      />
    </div>
  )
}

// The leaf, seen from above: glossy green, lighter along the midrib, fine
// veins running out toward the tip, a small tear in the lower edge, and
// drops of water sprinkled before serving.
const LEAF =
  'M10 40 C60 18 180 10 290 22 C340 28 378 60 396 104 C376 150 330 186 270 198 C220 206 170 208 142 207 L134 196 L126 206 C80 206 40 198 16 186 C6 150 4 80 10 40 Z'

function Leaf() {
  const veins = []
  for (let x = 20; x < 380; x += 13) {
    const mid = 118 - (x / 400) * 14
    veins.push(`M${x} ${mid} L${x + 44} 8`, `M${x} ${mid} L${x + 44} 214`)
  }
  return (
    <g>
      <defs>
        <linearGradient id="p26-leaf" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2f6423" />
          <stop offset=".48" stopColor="#4c8c38" />
          <stop offset=".54" stopColor="#4c8c38" />
          <stop offset="1" stopColor="#2c5e21" />
        </linearGradient>
        <clipPath id="p26-leaf-clip">
          <path d={LEAF} />
        </clipPath>
        <radialGradient id="p26-steel" cx=".4" cy=".3" r=".8">
          <stop offset="0" stopColor="#f4f6f7" />
          <stop offset=".55" stopColor="#aeb4b8" />
          <stop offset="1" stopColor="#6b7176" />
        </radialGradient>
      </defs>
      <path d={LEAF} transform="translate(4 7)" fill="#1a0604" opacity=".45" />
      <path d={LEAF} fill="url(#p26-leaf)" />
      <g clipPath="url(#p26-leaf-clip)">
        <path d={veins.join(' ')} stroke="#7fae5a" strokeOpacity=".35" strokeWidth=".9" fill="none" />
        <path d="M0 120 C120 114 260 106 400 102" stroke="#a7cc84" strokeWidth="3.4" fill="none" />
        <path d="M0 117 C120 111 260 103 400 99" stroke="#dcefc4" strokeOpacity=".5" strokeWidth="1" fill="none" />
        <ellipse cx="150" cy="50" rx="130" ry="18" fill="#fff" opacity=".07" />
      </g>
      {[
        [58, 58, 4],
        [330, 82, 3.4],
        [304, 174, 4.2],
        [128, 150, 3],
        [224, 36, 3.6],
        [366, 132, 2.8],
      ].map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.8} fill="#e8f5dc" fillOpacity=".22" stroke="#f3fbe9" strokeOpacity=".55" strokeWidth=".6" />
          <circle cx={cx - r * 0.35} cy={cy - r * 0.3} r={r * 0.28} fill="#fff" opacity=".85" />
        </g>
      ))}
    </g>
  )
}

// A steel katori (small bowl) with something in it.
function Katori({ x, y, fill, rim = 30, children }) {
  return (
    <g>
      <ellipse cx={x + 3} cy={y + 8} rx={rim} ry={rim * 0.45} fill="#10240b" opacity=".35" />
      <ellipse cx={x} cy={y} rx={rim} ry={rim * 0.45} fill="url(#p26-steel)" />
      <ellipse cx={x} cy={y - 1} rx={rim * 0.84} ry={rim * 0.34} fill={fill} />
      {children}
      <ellipse cx={x} cy={y} rx={rim} ry={rim * 0.45} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
    </g>
  )
}

// A little heap of pieces for dry dishes.
function Heap({ x, y, colors, n = 26, spread = 22 }) {
  const bits = []
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996
    const r = Math.sqrt(i / n) * spread
    bits.push(
      <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * 0.7} r={3.4 - (r / spread) * 1.4} fill={colors[i % colors.length]} />
    )
  }
  return bits
}

const DISHES = {
  chapati: ({ x, y }) => (
    <g>
      <circle cx={x + 8} cy={y + 10} r="44" fill="#10240b" opacity=".35" />
      <circle cx={x + 6} cy={y + 6} r="44" fill="#b98145" />
      <circle cx={x + 3} cy={y + 3} r="44" fill="#d6a462" />
      <circle cx={x} cy={y} r="44" fill="#e8c083" />
      {[
        [-18, -12, 7],
        [12, -20, 5],
        [20, 8, 8],
        [-6, 18, 6],
        [-24, 14, 4],
        [4, -2, 3],
        [26, -6, 3.5],
      ].map(([dx, dy, r]) => (
        <ellipse key={`${dx}${dy}`} cx={x + dx} cy={y + dy} rx={r} ry={r * 0.7} fill="#8a5424" opacity=".55" />
      ))}
      <path d={`M${x - 30} ${y - 26} A44 44 0 0 1 ${x + 22} ${y - 38}`} stroke="#fff4dc" strokeOpacity=".35" strokeWidth="2" fill="none" />
    </g>
  ),
  sukka: ({ x, y }) => (
    <g>
      <ellipse cx={x + 3} cy={y + 8} rx="28" ry="15" fill="#10240b" opacity=".3" />
      <Heap x={x} y={y} colors={['#b5621d', '#d98c3a', '#8a4212', '#e7a95a']} n={34} spread={26} />
    </g>
  ),
  kabab: ({ x, y }) => (
    <g>
      <ellipse cx={x + 3} cy={y + 9} rx="30" ry="15" fill="#10240b" opacity=".3" />
      {[
        [-16, -6, -20],
        [4, -10, 15],
        [18, 4, -8],
        [-6, 8, 30],
        [-22, 10, 5],
      ].map(([dx, dy, rot]) => (
        <g key={`${dx}${dy}`} transform={`translate(${x + dx} ${y + dy}) rotate(${rot})`}>
          <rect x="-11" y="-7" width="22" height="14" rx="6" fill="#a8320f" />
          <rect x="-9" y="-6" width="16" height="6" rx="3" fill="#d4552a" opacity=".8" />
          <circle cx="4" cy="2" r="1.6" fill="#3f7a1e" />
        </g>
      ))}
    </g>
  ),
  bowl: ({ x, y }) => (
    <Katori x={x} y={y} fill="#8a4518">
      <path d={`M${x - 12} ${y - 2} q8 -6 16 0 q6 4 12 -1`} stroke="#c9752f" strokeWidth="2" fill="none" />
      <circle cx={x + 8} cy={y - 3} r="2" fill="#3f7a1e" />
    </Katori>
  ),
  curd: ({ x, y }) => (
    <Katori x={x} y={y} fill="#f7f4ec" rim={26}>
      <ellipse cx={x - 6} cy={y - 3} rx="8" ry="2.5" fill="#fff" />
    </Katori>
  ),
  gheeRice: ({ x, y }) => (
    <g>
      <ellipse cx={x + 3} cy={y + 12} rx="34" ry="14" fill="#10240b" opacity=".3" />
      <path d={`M${x - 34} ${y + 8} C${x - 30} ${y - 26} ${x + 30} ${y - 26} ${x + 34} ${y + 8} C${x + 18} ${y + 16} ${x - 18} ${y + 16} ${x - 34} ${y + 8} Z`} fill="#dca436" />
      <Heap x={x} y={y - 2} colors={['#f1c65a', '#e8b340', '#fbe39a']} n={30} spread={24} />
      <ellipse cx={x + 10} cy={y - 8} rx="4" ry="2.4" fill="#f4e3b8" />
      <ellipse cx={x - 12} cy={y + 2} rx="4" ry="2.4" fill="#f4e3b8" />
    </g>
  ),
  rice: ({ x, y }) => (
    <g>
      <ellipse cx={x + 3} cy={y + 12} rx="34" ry="14" fill="#10240b" opacity=".3" />
      <path d={`M${x - 34} ${y + 8} C${x - 30} ${y - 28} ${x + 30} ${y - 28} ${x + 34} ${y + 8} C${x + 18} ${y + 16} ${x - 18} ${y + 16} ${x - 34} ${y + 8} Z`} fill="#e9e4d6" />
      <Heap x={x} y={y - 3} colors={['#fbfaf5', '#f1ede2', '#ffffff']} n={34} spread={25} />
      <ellipse cx={x + 2} cy={y - 10} rx="7" ry="4" fill="#f2c94c" />
    </g>
  ),
  vada: ({ x, y }) => (
    <g>
      {[
        [-12, -2],
        [14, 4],
      ].map(([dx, dy]) => (
        <g key={dx}>
          <circle cx={x + dx + 2} cy={y + dy + 4} r="17" fill="#10240b" opacity=".3" />
          <circle cx={x + dx} cy={y + dy} r="17" fill="#b06a24" />
          <circle cx={x + dx - 3} cy={y + dy - 3} r="12" fill="#cf8a3a" opacity=".7" />
          <circle cx={x + dx} cy={y + dy} r="5" fill="#3a7a2c" />
        </g>
      ))}
    </g>
  ),
  sweet: ({ x, y }) => (
    <g>
      <ellipse cx={x + 3} cy={y + 9} rx="16" ry="8" fill="#10240b" opacity=".35" />
      <circle cx={x} cy={y} r="16" fill="#5e2f14" />
      <circle cx={x - 5} cy={y - 6} r="5" fill="#fff" opacity=".22" />
    </g>
  ),
}
