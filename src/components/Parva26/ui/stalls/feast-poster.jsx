import { useEffect, useRef, useState } from 'react'
import { En, usePrefs } from '@p26/lib/prefs'
import { MEAL, MENU, eventDay } from '@p26/content'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// The Bhoori Bhojana poster in the lobby's glass display frame (Scene 8,
// allscenes.md). A banana leaf, sprinkled with water, fills the middle; when
// it comes into view the dishes are served onto it one at a time, in the
// menu's order. Hovering or tapping a dish names it in the subtitle strip.

// Where each dish sits on the 400 × 220 leaf, laid out the traditional way:
// salt and pickle at the left tip, salads, palya and the curries in katoris
// along the far half, rice, mudde, rotti and the fried things in front, and
// the sweets and buttermilk toward the right.
const PLACES = {
  uppu: [40, 62],
  uppinkai: [64, 50],
  kosambri: [100, 50],
  palya: [140, 46],
  ennegai: [182, 44],
  bassaru: [224, 44],
  rasa: [266, 48],
  payasa: [310, 58],
  majjige: [352, 88],
  happala: [44, 122],
  rotti: [96, 118],
  mudde: [150, 112],
  bajji: [150, 172],
  rice: [210, 142],
  chitranna: [278, 148],
  mysorePak: [336, 142],
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
            const Dish = DISHES[item.dish] ?? DISHES.palya
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
          <En className="mt-0.5 block text-base font-semibold leading-tight opacity-85">
              {day.en}, {MEAL.time.en} · {MEAL.venue.en}
            </En>
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
function Heap({ x, y, colors, n = 26, spread = 22, size = 3.4 }) {
  const bits = []
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996
    const r = Math.sqrt(i / n) * spread
    bits.push(
      <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * 0.7} r={size - (r / spread) * size * 0.4} fill={colors[i % colors.length]} />
    )
  }
  return bits
}

// A soft shadow under a dish served straight onto the leaf.
const Shadow = ({ x, y, rx, ry, dy = 8 }) => <ellipse cx={x + 3} cy={y + dy} rx={rx} ry={ry} fill="#10240b" opacity=".3" />

const DISHES = {
  // A pinch of salt
  uppu: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="7" ry="3.5" dy={3} />
      <Heap x={x} y={y} colors={['#ffffff', '#eef0f2', '#dfe3e6']} n={10} spread={5} size={2} />
    </g>
  ),
  // A dab of mango pickle: red masala with a piece of mango
  uppinkai: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="10" ry="5" dy={4} />
      <Heap x={x} y={y} colors={['#b3260f', '#d4421a', '#8f1c0b']} n={12} spread={7} size={2.6} />
      <path d={`M${x - 3} ${y - 4} q5 -3 8 1 q-3 4 -8 -1 Z`} fill="#e9b949" stroke="#8f1c0b" strokeWidth=".6" />
    </g>
  ),
  // Kosambri: soaked moong dal with cucumber, carrot and coconut
  kosambri: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="17" ry="8" dy={5} />
      <Heap x={x} y={y} colors={['#f2d16b', '#e8c04f', '#9ccb6a', '#f08a3c', '#fbf6e8']} n={26} spread={15} size={2.6} />
    </g>
  ),
  // Palya: chopped beans and carrot with grated coconut
  palya: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="17" ry="8" dy={5} />
      <Heap x={x} y={y} colors={['#4f8f2a', '#6ea83a', '#f3ecd6', '#e07a2e', '#3f7a1e']} n={26} spread={15} size={2.8} />
    </g>
  ),
  // Ennegai: whole small brinjals in a dark masala gravy
  ennegai: ({ x, y }) => (
    <Katori x={x} y={y} fill="#7a2e12" rim={19}>
      {[
        [-6, -1],
        [5, -2],
      ].map(([dx, dy]) => (
        <g key={dx}>
          <ellipse cx={x + dx} cy={y + dy} rx="5.5" ry="3.4" fill="#4b1d4f" />
          <ellipse cx={x + dx - 1.5} cy={y + dy - 1.2} rx="2" ry="1" fill="#a06aa6" opacity=".6" />
          <path d={`M${x + dx + 4.5} ${y + dy} l3 -1.5`} stroke="#4f7a2a" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </Katori>
  ),
  // Bassaru: thin lentil and greens curry
  bassaru: ({ x, y }) => (
    <Katori x={x} y={y} fill="#7d7a2c" rim={19}>
      <path d={`M${x - 9} ${y - 1} q4 -3 8 0 q4 3 8 0`} stroke="#4f6a1a" strokeWidth="1.6" fill="none" />
      <circle cx={x + 6} cy={y - 3} r="1.4" fill="#2f5a14" />
    </Katori>
  ),
  // Rasam: clear and tomato red, with a curry leaf and mustard seeds
  rasa: ({ x, y }) => (
    <Katori x={x} y={y} fill="#c2461d" rim={19}>
      <ellipse cx={x - 3} cy={y - 2} rx="4.5" ry="1.6" fill="#3f7a1e" transform={`rotate(-20 ${x - 3} ${y - 2})`} />
      {[
        [4, -1],
        [7, 1],
        [2, 2],
      ].map(([dx, dy]) => (
        <circle key={dx} cx={x + dx} cy={y + dy} r=".9" fill="#2a1408" />
      ))}
    </Katori>
  ),
  // Payasa: creamy, with a cashew and raisins
  payasa: ({ x, y }) => (
    <Katori x={x} y={y} fill="#efd9a8" rim={19}>
      <path d={`M${x - 5} ${y - 2} a2.6 2.6 0 1 1 4 2`} stroke="#c9a062" strokeWidth="2" fill="none" />
      <circle cx={x + 5} cy={y - 1} r="1.6" fill="#5a2a14" />
      <circle cx={x + 1} cy={y + 2} r="1.4" fill="#5a2a14" />
    </Katori>
  ),
  // Majjige: buttermilk in a steel tumbler, seen from above
  majjige: ({ x, y }) => (
    <g>
      <circle cx={x + 3} cy={y + 4} r="15" fill="#10240b" opacity=".35" />
      <circle cx={x} cy={y} r="15" fill="url(#p26-steel)" />
      <circle cx={x} cy={y} r="12" fill="#f4f1e6" />
      <circle cx={x - 3} cy={y + 2} r="1.2" fill="#3f7a1e" />
      <circle cx={x + 3} cy={y - 2} r="1" fill="#3f7a1e" />
      <circle cx={x} cy={y} r="15" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
    </g>
  ),
  // Happala: a big crisp disc with blisters
  happala: ({ x, y }) => (
    <g>
      <circle cx={x + 4} cy={y + 5} r="22" fill="#10240b" opacity=".3" />
      <circle cx={x} cy={y} r="22" fill="#ecd59a" />
      {[
        [-9, -8, 3],
        [7, -11, 2.4],
        [11, 4, 3.2],
        [-4, 9, 2.6],
        [-13, 5, 2],
        [2, -1, 1.8],
      ].map(([dx, dy, r]) => (
        <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r={r} fill="#fbeec4" stroke="#c9a85c" strokeWidth=".5" />
      ))}
    </g>
  ),
  // Jolada rotti: a pale jowar flatbread with light char spots
  rotti: ({ x, y }) => (
    <g>
      <circle cx={x + 5} cy={y + 6} r="25" fill="#10240b" opacity=".35" />
      <circle cx={x + 2} cy={y + 2} r="25" fill="#cbb487" />
      <circle cx={x} cy={y} r="25" fill="#ece0c2" />
      {[
        [-10, -7, 3.4],
        [8, -12, 2.6],
        [12, 5, 3.8],
        [-4, 11, 3],
        [-14, 7, 2],
        [3, -1, 1.8],
      ].map(([dx, dy, r]) => (
        <ellipse key={`${dx}${dy}`} cx={x + dx} cy={y + dy} rx={r} ry={r * 0.7} fill="#8a6a3a" opacity=".45" />
      ))}
    </g>
  ),
  // Ragi mudde: a smooth dark ball
  mudde: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="16" ry="7" dy={11} />
      <circle cx={x} cy={y} r="16" fill="#6a4a3c" />
      <circle cx={x - 2} cy={y - 2} r="14" fill="#7d5a4a" />
      <ellipse cx={x - 6} cy={y - 7} rx="5" ry="3" fill="#fff" opacity=".18" />
    </g>
  ),
  // Menasinakai bajji: two long chillies fried in golden batter
  bajji: ({ x, y }) => (
    <g>
      {[
        [-10, -2, -12],
        [10, 3, 8],
      ].map(([dx, dy, rot]) => (
        <g key={dx} transform={`translate(${x + dx} ${y + dy}) rotate(${rot})`}>
          <ellipse cx="2" cy="4" rx="17" ry="6" fill="#10240b" opacity=".3" />
          <ellipse cx="0" cy="0" rx="17" ry="6" fill="#c98a2e" />
          <ellipse cx="-2" cy="-1.5" rx="12" ry="3" fill="#e2aa4a" opacity=".8" />
          <path d="M16 -1 q4 -1 6 -4" stroke="#3f7a1e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
  // Anna: a mound of white rice with a spoon of ghee
  rice: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="34" ry="14" dy={12} />
      <path d={`M${x - 34} ${y + 8} C${x - 30} ${y - 28} ${x + 30} ${y - 28} ${x + 34} ${y + 8} C${x + 18} ${y + 16} ${x - 18} ${y + 16} ${x - 34} ${y + 8} Z`} fill="#e9e4d6" />
      <Heap x={x} y={y - 3} colors={['#fbfaf5', '#f1ede2', '#ffffff']} n={34} spread={25} />
      <ellipse cx={x + 2} cy={y - 10} rx="7" ry="4" fill="#f2c94c" />
    </g>
  ),
  // Mavinakai chitranna: turmeric rice with raw mango, peanuts and curry leaves
  chitranna: ({ x, y }) => (
    <g>
      <Shadow x={x} y={y} rx="28" ry="12" dy={10} />
      <path d={`M${x - 28} ${y + 6} C${x - 25} ${y - 22} ${x + 25} ${y - 22} ${x + 28} ${y + 6} C${x + 15} ${y + 13} ${x - 15} ${y + 13} ${x - 28} ${y + 6} Z`} fill="#e3b72e" />
      <Heap x={x} y={y - 2} colors={['#f6d34a', '#f0c63a', '#fbe17a']} n={30} spread={20} />
      {[
        [-8, -6, 20],
        [9, -2, -30],
      ].map(([dx, dy, rot]) => (
        <ellipse key={dx} cx={x + dx} cy={y + dy} rx="4.5" ry="1.8" fill="#2f6a1a" transform={`rotate(${rot} ${x + dx} ${y + dy})`} />
      ))}
      <circle cx={x + 2} cy={y - 9} r="2" fill="#c08a4a" />
      <circle cx={x - 12} cy={y + 2} r="2" fill="#c08a4a" />
      <rect x={x + 10} y={y - 11} width="5" height="3.4" rx="1" fill="#d9e8a0" />
    </g>
  ),
  // Mysore pak: a golden, porous square
  mysorePak: ({ x, y }) => (
    <g>
      <rect x={x - 11} y={y - 7} width="24" height="22" rx="3" fill="#10240b" opacity=".35" />
      <rect x={x - 13} y={y - 11} width="24" height="22" rx="3" fill="#c98a1e" />
      <rect x={x - 13} y={y - 11} width="24" height="7" rx="3" fill="#e9b13a" />
      {[
        [-7, 0],
        [0, 3],
        [5, -1],
        [-3, 6],
        [6, 6],
      ].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r="1.2" fill="#8a5a12" opacity=".6" />
      ))}
    </g>
  ),
}
