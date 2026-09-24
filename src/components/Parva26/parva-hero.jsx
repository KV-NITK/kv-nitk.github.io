// Samudrappa (Scene 9, allscenes.md): the release-day hero as a
// hand-painted plywood cutout. An original character, a police officer in
// the khaki uniform and peaked cap, long curly hair spilling out from under
// it, a pistol raised in one hand and a lathi in the other, against a
// painted halo of rays. Flat colours with one shade each and bold dark
// outlines, as cutout painters work; a cream border runs round the whole
// shape, and an offset copy in bare plywood shows the board's thickness.
// Drawn in a 400 × 600 box. TODO(content): replace with the painted cutout.

const INK = '#2a1408'
const SKIN = '#c98652'
const SKIN_SHADE = '#a2653a'
const KHAKI = '#c2a86a'
const KHAKI_SHADE = '#97804a'
const KHAKI_LIGHT = '#d6bf84'
const HAIR_COLOUR = '#1b100a'
const GOLD = '#e2b043'
const GUN = '#2b2e31'

const circle = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`

// Long curls spilling from under the cap to the shoulders, both sides.
const CURLS = [
  [114, 168, 13], [106, 196, 14], [106, 226, 14], [112, 254, 14], [124, 278, 13], [146, 292, 12], [168, 290, 11],
  [286, 168, 13], [294, 196, 14], [294, 226, 14], [288, 254, 14], [276, 278, 13], [254, 292, 12], [232, 290, 11],
  [136, 146, 11], [264, 146, 11],
]

const HALO = 'M200 42 A170 170 0 1 1 199.9 42 Z'
const HAIR = 'M150 124 C124 132 108 164 108 204 C108 238 112 266 128 290 C146 300 170 296 180 286 L220 286 C230 296 254 300 272 290 C288 266 292 238 292 204 C292 164 276 132 250 124 Z'
const TROUSERS = 'M124 450 C120 510 114 560 110 600 L290 600 C286 560 280 510 276 450 Z'
const TORSO = 'M132 252 C116 300 120 380 124 452 C170 462 230 462 276 452 C280 380 284 300 268 252 C240 238 160 238 132 252 Z'
const ARM_UP = 'M146 262 C120 250 98 228 86 198 L74 138 C72 128 102 124 104 132 L116 186 C124 206 140 222 162 236 Z'
const FIST_UP = 'M70 112 C70 100 106 98 108 110 L110 130 C108 142 74 144 70 132 Z'
// The pistol in profile (barrel along +x), placed with its grip in the fist
// and the barrel pointing up at the sky.
const PISTOL = 'M-3 -10 L47 -10 L47 4 L17 4 L12 31 L-3 31 Z'
const PISTOL_AT = 'translate(88 126) rotate(-72) scale(1.55) translate(-6 -18)'
const ARM_DOWN = 'M256 262 C286 270 314 296 322 330 C328 356 322 384 312 408 L290 404 C298 382 302 358 296 340 C290 318 272 300 250 290 Z'
const FIST_DOWN = 'M284 404 C290 392 316 394 318 410 C320 424 306 436 292 432 C280 428 278 412 284 404 Z'
const LATHI = 'M346 316 L335 313 L257 572 L268 575 Z'
const NECK = 'M180 214 L220 214 L224 252 C210 260 190 260 176 252 Z'
const FACE = 'M200 112 C234 112 250 138 250 172 C250 206 230 232 200 234 C170 232 150 206 150 172 C150 138 166 112 200 112 Z'
const CAP = 'M128 110 C122 88 150 64 200 62 C250 64 278 88 272 110 C268 118 262 124 256 128 L144 128 C138 124 132 118 128 110 Z'
const VISOR = 'M140 134 L260 134 C255 152 145 152 140 134 Z'

const OUTLINE = [HALO, HAIR, ...CURLS.map(([x, y, r]) => circle(x, y, r)), TROUSERS, TORSO, ARM_UP, FIST_UP, ARM_DOWN, FIST_DOWN, LATHI, NECK, FACE, CAP, VISOR].map((d) => ({ d }))
OUTLINE.push({ d: PISTOL, t: PISTOL_AT })

export function ParvaHero({ className, silhouette }) {
  // Just the shape, for the shadow the up-light throws on the wall.
  if (silhouette) {
    return (
      <svg viewBox="-10 -10 424 624" aria-hidden className={className}>
        <g fill={silhouette} stroke={silhouette} strokeWidth="14" strokeLinejoin="round">
          {OUTLINE.map(({ d, t }) => (
            <path key={d} d={d} transform={t} />
          ))}
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="-10 -10 424 624" aria-hidden className={className}>
      <defs>
        <clipPath id="p26-hero-halo">
          <path d={HALO} />
        </clipPath>
      </defs>

      {/* Bare plywood edge, then the cream border round the cutout */}
      <g transform="translate(9 5)" fill="#8a5a2e" stroke="#8a5a2e" strokeWidth="14" strokeLinejoin="round">
        {OUTLINE.map(({ d, t }) => (
          <path key={d} d={d} transform={t} />
        ))}
      </g>
      <g transform="translate(9 5)" fill="none" stroke="#5e3a1a" strokeWidth="2" strokeLinejoin="round" opacity=".6">
        {OUTLINE.map(({ d, t }) => (
          <path key={d} d={d} transform={t} />
        ))}
      </g>
      <g fill="#f4ead2" stroke="#f4ead2" strokeWidth="14" strokeLinejoin="round">
        {OUTLINE.map(({ d, t }) => (
          <path key={d} d={d} transform={t} />
        ))}
      </g>

      <Halo />
      <Hair />

      {/* Khaki trousers with a crease down each leg */}
      <path d={TROUSERS} fill={KHAKI} stroke={INK} strokeWidth="3" />
      <path d="M206 460 C208 510 210 560 212 600 L236 600 C230 550 224 500 216 458 Z" fill={KHAKI_SHADE} opacity=".7" />
      <path d="M200 466 L201 600" stroke={INK} strokeWidth="2" />
      <path d="M160 470 L154 600 M244 470 L250 600" stroke={KHAKI_LIGHT} strokeWidth="2" opacity=".7" />

      <Shirt />

      {/* The lathi, held at the side */}
      <path d={LATHI} fill="#9a6a34" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M340 318 L262 572" stroke="#c9975a" strokeWidth="2" opacity=".8" />
      {[350, 400, 450, 500, 540].map((y) => {
        const t = (y - 314) / 260
        const x = 340 - t * 78
        return <path key={y} d={`M${x - 6} ${y - 2} L${x + 6} ${y + 2}`} stroke="#5e3a16" strokeWidth="2.4" />
      })}
      <path d="M257 572 L268 575 L266 584 L255 581 Z" fill={GOLD} stroke={INK} strokeWidth="2" />

      {/* The arm down, its fist round the lathi */}
      <path d={ARM_DOWN} fill={KHAKI} stroke={INK} strokeWidth="3" />
      <path d="M296 322 C302 346 298 372 286 398 L292 406 C314 380 326 356 322 332 Z" fill={KHAKI_SHADE} />
      <path d="M288 396 L316 400 L314 410 L286 406 Z" fill={KHAKI_SHADE} stroke={INK} strokeWidth="2" />
      <path d={FIST_DOWN} fill={SKIN} stroke={INK} strokeWidth="3" />
      <path d="M288 412 C296 408 306 410 312 416 M288 420 C296 418 304 420 310 424" fill="none" stroke={INK} strokeWidth="1.6" />

      {/* The raised arm, pistol pointing at the sky */}
      <path d={ARM_UP} fill={KHAKI} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M140 256 C120 244 104 226 94 202 L84 156 L96 154 L106 196 C114 216 130 232 152 242 Z" fill={KHAKI_SHADE} />
      <path d="M74 136 L104 130 L107 142 L77 148 Z" fill={KHAKI_SHADE} stroke={INK} strokeWidth="2" />
      <g transform={PISTOL_AT} strokeLinejoin="round">
        {/* Grip, frame, slide with its serrations, sights and trigger guard */}
        <path d="M2 2 L16 2 L12 30 L-2 30 Z" fill="#3b2a1c" stroke={INK} strokeWidth="2.4" />
        <path d="M3 10 L13 10 M2 16 L12 16 M1 22 L11 22" stroke="#2a1d12" strokeWidth="1.2" />
        <path d="M16 3 C17 13 27 13 29 3" fill="none" stroke={INK} strokeWidth="2.4" />
        <path d="M-2 -9 L46 -9 L46 3 L-2 3 Z" fill={GUN} stroke={INK} strokeWidth="2.4" />
        <path d="M0 -6 L44 -6" stroke="#6b7074" strokeWidth="1.6" />
        {[2, 6, 10].map((x) => (
          <path key={x} d={`M${x} -8 L${x} 1`} stroke="#15171a" strokeWidth="1.4" />
        ))}
        <path d="M41 -9 L41 -13 L45 -13 L45 -9 Z M-1 -9 L-1 -12 L4 -12 L4 -9 Z" fill={GUN} stroke={INK} strokeWidth="1.4" />
        <circle cx="46" cy="-3" r="1.8" fill="#0c0d0e" />
      </g>
      <path d={FIST_UP} fill={SKIN} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M74 116 C84 112 96 112 106 116 M74 124 C84 120 96 120 106 124" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M106 110 C116 108 118 120 110 124" fill="none" stroke={INK} strokeWidth="2" />

      <Head />
    </svg>
  )
}

// The painted halo behind him: alternating arishina and saffron rays, a
// kumkuma ring with gold dots at the rim.
function Halo() {
  const rays = []
  for (let i = 0; i < 28; i++) {
    const a0 = (i / 28) * Math.PI * 2
    const a1 = ((i + 1) / 28) * Math.PI * 2
    const p = (a, r) => `${(200 + Math.cos(a) * r).toFixed(1)} ${(212 + Math.sin(a) * r).toFixed(1)}`
    rays.push(<path key={i} d={`M200 212 L${p(a0, 200)} L${p(a1, 200)} Z`} fill={i % 2 ? '#f2c12e' : '#e8871e'} />)
  }
  const dots = []
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2
    dots.push(<circle key={i} cx={200 + Math.cos(a) * 160} cy={212 + Math.sin(a) * 160} r="3.2" fill={GOLD} />)
  }
  return (
    <g>
      <g clipPath="url(#p26-hero-halo)">{rays}</g>
      <path d={HALO} fill="none" stroke="#b3122a" strokeWidth="16" />
      <path d={HALO} fill="none" stroke={INK} strokeWidth="3" />
      {dots}
      <circle cx="200" cy="212" r="146" fill="none" stroke={INK} strokeWidth="2" opacity=".5" />
    </g>
  )
}

// Long curly hair: a dark mass with a ring of curls round its edge, each
// with a lighter swirl.
function Hair() {
  return (
    <g>
      <path d={HAIR} fill={HAIR_COLOUR} stroke={INK} strokeWidth="3" />
      {CURLS.map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={r} fill={HAIR_COLOUR} stroke={INK} strokeWidth="2.5" />
          <path d={`M${x - r * 0.45} ${y + r * 0.1} a${r * 0.45} ${r * 0.45} 0 1 1 ${r * 0.5} ${r * 0.35}`} fill="none" stroke="#5a3a22" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

// The khaki uniform shirt: collar, brass buttons, two flapped pockets, the
// name plate, shoulder straps with stars, a whistle cord and the belt.
function Shirt() {
  return (
    <g strokeLinejoin="round">
      <path d={NECK} fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <path d={TORSO} fill={KHAKI} stroke={INK} strokeWidth="3" />
      <path d="M232 256 C256 300 262 380 262 452 L276 452 C280 380 284 300 268 252 Z" fill={KHAKI_SHADE} />
      {/* Collar */}
      <path d="M174 248 L200 274 L186 284 L164 256 Z" fill={KHAKI_LIGHT} stroke={INK} strokeWidth="2.4" />
      <path d="M226 248 L200 274 L214 284 L236 256 Z" fill={KHAKI_LIGHT} stroke={INK} strokeWidth="2.4" />
      {/* Placket and buttons */}
      <path d="M200 276 L200 450" stroke={INK} strokeWidth="2" />
      {[300, 330, 362, 394, 424].map((y) => (
        <circle key={y} cx="206" cy={y} r="3.6" fill={GOLD} stroke={INK} strokeWidth="1.2" />
      ))}
      {/* Pockets with flaps */}
      {[150, 214].map((x) => (
        <g key={x}>
          <path d={`M${x} 312 L${x + 36} 312 L${x + 36} 352 L${x} 352 Z`} fill={KHAKI} stroke={INK} strokeWidth="2" />
          <path d={`M${x - 2} 306 L${x + 38} 306 L${x + 36} 322 L${x + 18} 328 L${x} 322 Z`} fill={KHAKI_LIGHT} stroke={INK} strokeWidth="2" />
          <circle cx={x + 18} cy="319" r="2.8" fill={GOLD} stroke={INK} strokeWidth="1" />
        </g>
      ))}
      {/* Name plate */}
      <rect x="146" y="288" width="46" height="13" rx="1.5" fill="#1b1b1b" stroke={INK} strokeWidth="1.2" />
      <text x="169" y="297.8" textAnchor="middle" fontSize="8.4" fontWeight="700" fontFamily="'Baloo Tamma 2 Variable', sans-serif" fill="#fbf5e6">
        ಸಮುದ್ರಪ್ಪ
      </text>
      {/* Shoulder straps, with stars */}
      <path d="M134 258 L174 250 L176 262 L137 270 Z" fill={KHAKI_LIGHT} stroke={INK} strokeWidth="2" />
      <path d="M266 258 L226 250 L224 262 L263 270 Z" fill={KHAKI_LIGHT} stroke={INK} strokeWidth="2" />
      {[
        [150, 261],
        [162, 258],
        [250, 261],
        [238, 258],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y - 1} L${x + 1.8} ${y + 0.8} L${x + 2.5} ${y + 3.8} L${x} ${y + 2} L${x - 2.5} ${y + 3.8} L${x - 1.8} ${y + 0.8} L${x - 4} ${y - 1} L${x - 1.2} ${y - 1.2} Z`} fill={GOLD} stroke={INK} strokeWidth=".8" />
      ))}
      {/* Whistle cord from the shoulder to the pocket */}
      <path d="M252 266 C262 292 258 316 240 326" fill="none" stroke="#efe4c8" strokeWidth="3.4" />
      <path d="M252 266 C262 292 258 316 240 326" fill="none" stroke={KHAKI_SHADE} strokeWidth="3.4" strokeDasharray="2 3" />
      {/* Belt and buckle */}
      <path d="M124 432 L276 432 L276 452 L124 452 Z" fill="#5a3616" stroke={INK} strokeWidth="2.4" />
      <rect x="184" y="427" width="32" height="30" rx="3" fill={GOLD} stroke={INK} strokeWidth="2.4" />
      <circle cx="200" cy="442" r="7" fill="none" stroke={INK} strokeWidth="1.6" />
    </g>
  )
}

function Head() {
  return (
    <g strokeLinejoin="round">
      {/* Ears and the face */}
      <ellipse cx="150" cy="176" rx="9" ry="15" fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <ellipse cx="250" cy="176" rx="9" ry="15" fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <path d={FACE} fill={SKIN} stroke={INK} strokeWidth="3" />
      <path d="M226 122 C246 136 252 172 246 202 C240 222 224 232 208 234 C230 212 236 172 226 122 Z" fill={SKIN_SHADE} opacity=".8" />
      {/* Stern brows, eyes */}
      <path d="M160 152 C170 146 184 146 194 152 L192 158 C182 154 172 154 162 160 Z" fill={INK} />
      <path d="M240 152 C230 146 216 146 206 152 L208 158 C218 154 228 154 238 160 Z" fill={INK} />
      <path d="M166 170 C172 162 186 162 192 170 C186 176 172 176 166 170 Z" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M208 170 C214 162 228 162 234 170 C228 176 214 176 208 170 Z" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="180" cy="169.5" r="5" fill={INK} />
      <circle cx="221" cy="169.5" r="5" fill={INK} />
      <circle cx="181.6" cy="167.8" r="1.4" fill="#fff" />
      <circle cx="222.6" cy="167.8" r="1.4" fill="#fff" />
      {/* Nose */}
      <path d="M200 174 C198 186 194 194 196 198 C200 202 206 200 208 196" fill="none" stroke={INK} strokeWidth="2.4" />
      {/* A thick police moustache and a confident grin */}
      <path d="M186 218 C194 222 206 222 214 218 C212 226 206 228 200 228 C194 228 188 226 186 218 Z" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M200 203 C186 200 170 204 158 216 C162 222 176 220 188 213 C194 210 198 210 200 212 C202 210 206 210 212 213 C224 220 238 222 242 216 C230 204 214 200 200 203 Z" fill={INK} />

      {/* Peaked police cap: khaki crown, dark band, black peak, brass badge */}
      <path d={CAP} fill={KHAKI} stroke={INK} strokeWidth="3" />
      <path d="M232 70 C254 80 270 96 270 110 C266 118 262 124 256 128 L236 128 C244 108 244 86 232 70 Z" fill={KHAKI_SHADE} />
      <path d="M144 116 L256 116 L254 136 L146 136 Z" fill="#2a1d12" stroke={INK} strokeWidth="2.4" />
      <path d="M148 121 L252 121" stroke={KHAKI_LIGHT} strokeWidth="1.2" opacity=".6" />
      <path d={VISOR} fill="#121212" stroke={INK} strokeWidth="2.4" />
      <path d="M152 138 C170 146 230 146 248 138" fill="none" stroke="#4a4a4a" strokeWidth="2" />
      <path d="M150 131 L250 131" stroke="#6b4a22" strokeWidth="2.4" />
      <circle cx="150" cy="131" r="2.4" fill={GOLD} stroke={INK} strokeWidth="1" />
      <circle cx="250" cy="131" r="2.4" fill={GOLD} stroke={INK} strokeWidth="1" />
      <circle cx="200" cy="100" r="12" fill={GOLD} stroke={INK} strokeWidth="2.4" />
      <circle cx="200" cy="100" r="7.5" fill="none" stroke={INK} strokeWidth="1.2" />
      <path d="M200 94 L201.8 98.4 L206.4 98.6 L202.8 101.4 L204 106 L200 103.4 L196 106 L197.2 101.4 L193.6 98.6 L198.2 98.4 Z" fill="#b3122a" stroke={INK} strokeWidth=".8" />
    </g>
  )
}

// The marigold garland on his shoulders, in its own SVG over the cutout so
// it can sway without repainting him. It grows one section per 1,000
// flowers (1 to 10 sections).
export function Garland({ sections = 1, className }) {
  const dip = 290 + Math.min(10, Math.max(1, sections)) * 18
  const beads = []
  const n = 22 + sections * 5
  for (let i = 0; i <= n; i++) {
    const t = i / n
    // Quadratic from shoulder to shoulder, dipping to `dip` at the middle.
    const x = (1 - t) * (1 - t) * 146 + 2 * (1 - t) * t * 200 + t * t * 254
    const y = (1 - t) * (1 - t) * 254 + 2 * (1 - t) * t * (2 * dip - 254) + t * t * 254
    const accent = i % 7 === 3
    beads.push(
      <g key={i}>
        <circle cx={x} cy={y} r={accent ? 7.5 : 8.5} fill={accent ? (i % 14 === 3 ? '#c8102e' : '#fbf5e6') : i % 2 ? '#f7c21e' : '#f08a1c'} stroke="#7a3a08" strokeWidth="1.6" />
        {!accent && <circle cx={x - 2} cy={y - 2.5} r="2.4" fill="#fff4c0" opacity=".55" />}
      </g>
    )
  }
  return (
    <svg viewBox="-10 -10 424 624" aria-hidden className={className}>
      {beads}
      {/* A tassel at the bottom */}
      <g transform={`translate(200 ${dip + 8})`}>
        <path d="M-8 0 L8 0 L12 26 L-12 26 Z" fill="#f08a1c" stroke="#7a3a08" strokeWidth="1.6" />
        <path d="M-6 8 L-8 24 M0 8 L0 26 M6 8 L8 24" stroke="#c8102e" strokeWidth="2" />
      </g>
    </svg>
  )
}
