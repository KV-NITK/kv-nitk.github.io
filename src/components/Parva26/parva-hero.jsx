// The Parva Hero (Scene 9, allscenes.md): a hand-painted plywood cutout of an
// original hero, not a real star, in a Mysuru peta and a sandalwood shawl,
// one hand raised in greeting, against a painted halo of rays. Flat colours
// with one shade each and bold dark outlines, as cutout painters work; a
// cream border runs round the whole shape, and an offset copy in bare
// plywood shows the board's thickness. This is a stand-in for the artist's
// painting (allscenes.md, Scene 9 assets), drawn in a 400 × 600 box.
// TODO(content): replace with the commissioned cutout art.

const INK = '#2a1408'
const SKIN = '#c98652'
const SKIN_SHADE = '#a2653a'
const CLOTH = '#fbf5e6'
const CLOTH_SHADE = '#dccfb4'
const SHAWL = '#d9a462'
const SHAWL_SHADE = '#b3803f'
const GOLD = '#e2b043'
const PETA = '#b3122a'
const PETA_SHADE = '#7e0b1d'

// The outer shapes of the cutout: what the saw followed.
const HALO = 'M200 42 A170 170 0 1 1 199.9 42 Z'
const DHOTI = 'M122 440 C118 500 112 560 106 600 L294 600 C288 560 282 500 278 440 Z'
const TORSO = 'M132 252 C116 300 120 380 124 452 C170 462 230 462 276 452 C280 380 284 300 268 252 C240 238 160 238 132 252 Z'
const ARM_UP = 'M146 262 C120 250 98 228 86 198 L70 132 C68 122 98 116 102 126 L116 186 C124 206 140 222 162 236 Z'
const HAND_UP =
  'M68 136 C62 118 58 98 60 84 C61 77 69 77 70 84 L73 104 L72 70 C72 62 81 61 82 69 L84 100 L86 64 C87 56 96 56 96 64 L96 100 L100 72 C101 65 110 66 109 73 L106 108 C112 100 120 96 124 100 C126 104 116 116 110 128 C104 138 76 146 68 136 Z'
const ARM_HIP = 'M256 262 C286 272 314 300 322 336 C328 364 314 396 290 424 L270 412 C284 388 294 362 290 344 C286 322 270 300 250 290 Z'
const FIST = 'M266 402 C274 392 294 396 298 410 C302 424 290 436 276 434 C264 432 258 414 266 402 Z'
const NECK = 'M180 214 L220 214 L224 252 C210 260 190 260 176 252 Z'
const FACE = 'M200 108 C236 108 252 136 252 170 C252 206 232 232 200 234 C168 232 148 206 148 170 C148 136 164 108 200 108 Z'
const PETA_SHAPE = 'M142 136 C134 96 158 56 202 54 C246 56 268 92 260 136 C240 126 164 126 142 136 Z'
const PLUME = 'M204 86 C198 64 206 38 222 26 C218 46 224 64 214 86 Z'

const OUTLINE = [HALO, DHOTI, TORSO, ARM_UP, HAND_UP, ARM_HIP, FIST, NECK, FACE, PETA_SHAPE, PLUME]

export function ParvaHero({ className, silhouette }) {
  // Just the shape, for the shadow the up-light throws on the wall.
  if (silhouette) {
    return (
      <svg viewBox="-10 -10 424 624" aria-hidden className={className}>
        <g fill={silhouette} stroke={silhouette} strokeWidth="14" strokeLinejoin="round">
          {OUTLINE.map((d) => (
            <path key={d} d={d} />
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
        {OUTLINE.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g transform="translate(9 5)" fill="none" stroke="#5e3a1a" strokeWidth="2" strokeLinejoin="round" opacity=".6">
        {OUTLINE.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="#f4ead2" stroke="#f4ead2" strokeWidth="14" strokeLinejoin="round">
        {OUTLINE.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <Halo />

      {/* Dhoti with a gold border and a front pleat */}
      <path d={DHOTI} fill={CLOTH} stroke={INK} strokeWidth="3" />
      <path d="M200 452 C204 500 206 550 208 600 L236 600 C230 550 224 500 214 452 Z" fill={CLOTH_SHADE} />
      <path d="M110 580 L290 580 L292 596 L108 596 Z" fill={GOLD} stroke={INK} strokeWidth="2" />
      <path d="M205 460 L212 600" stroke={GOLD} strokeWidth="5" />

      {/* Jubba (kurta) */}
      <path d={TORSO} fill={CLOTH} stroke={INK} strokeWidth="3" />
      <path d="M232 256 C256 300 262 380 262 452 L276 452 C280 380 284 300 268 252 Z" fill={CLOTH_SHADE} />
      {[292, 318, 344].map((y) => (
        <circle key={y} cx="200" cy={y} r="3.4" fill={GOLD} stroke={INK} strokeWidth="1.2" />
      ))}

      {/* Arm on the hip, with its fist */}
      <path d={ARM_HIP} fill={CLOTH} stroke={INK} strokeWidth="3" />
      <path d="M296 322 C302 346 298 372 284 398 L290 424 C314 396 328 364 322 336 Z" fill={CLOTH_SHADE} />
      <path d={FIST} fill={SKIN} stroke={INK} strokeWidth="3" />
      <path d="M276 410 C282 408 290 410 292 416" fill="none" stroke={INK} strokeWidth="1.6" />

      {/* Neck and the shawl round the shoulders, one end falling in front */}
      <path d={NECK} fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <path
        d="M128 262 C150 236 176 240 200 256 C224 240 250 236 272 262 C280 300 276 340 268 380 L248 470 L226 462 L240 380 C246 330 244 296 232 280 C218 290 182 290 168 280 C150 296 140 290 128 262 Z"
        fill={SHAWL}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M244 300 C252 340 250 380 238 430 L248 470 L268 380 C276 340 280 300 272 262 Z" fill={SHAWL_SHADE} />
      <path d="M232 470 L250 474 M236 462 L240 482 M244 466 L246 484 M228 460 L230 478" stroke={INK} strokeWidth="1.6" />
      <path d="M134 262 C154 244 178 248 198 262 M202 262 C222 248 246 244 266 262" fill="none" stroke={GOLD} strokeWidth="5" />
      <path d="M262 290 C266 330 262 380 244 456" fill="none" stroke={GOLD} strokeWidth="4" />

      {/* The raised arm, greeting */}
      <path d={ARM_UP} fill={CLOTH} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M140 256 C120 244 104 226 94 202 L82 150 L94 148 L106 196 C114 216 130 232 152 242 Z" fill={CLOTH_SHADE} />
      <path d="M70 132 L102 124 L106 136 L74 144 Z" fill={GOLD} stroke={INK} strokeWidth="2" />
      <path d={HAND_UP} fill={SKIN} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M76 120 C84 116 94 116 102 122" fill="none" stroke={SKIN_SHADE} strokeWidth="3" />

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
      <path d={HALO} fill="none" stroke={PETA} strokeWidth="16" />
      <path d={HALO} fill="none" stroke={INK} strokeWidth="3" />
      {dots}
      <circle cx="200" cy="212" r="146" fill="none" stroke={INK} strokeWidth="2" opacity=".5" />
    </g>
  )
}

function Head() {
  return (
    <g strokeLinejoin="round">
      {/* Ears and the face */}
      <ellipse cx="148" cy="174" rx="9" ry="15" fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <ellipse cx="252" cy="174" rx="9" ry="15" fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <path d={FACE} fill={SKIN} stroke={INK} strokeWidth="3" />
      <path d="M226 118 C246 132 252 170 246 200 C240 220 224 230 208 233 C230 212 236 170 226 118 Z" fill={SKIN_SHADE} opacity=".8" />
      {/* Sideburns and hair under the peta */}
      <path d="M150 140 C148 152 150 168 156 176 L160 150 Z M250 140 C252 152 250 168 244 176 L240 150 Z" fill={INK} />
      {/* Brows, eyes */}
      <path d="M162 150 C172 142 186 142 194 148 L192 154 C182 150 172 150 164 156 Z" fill={INK} />
      <path d="M238 150 C228 142 214 142 206 148 L208 154 C218 150 228 150 236 156 Z" fill={INK} />
      <path d="M166 166 C172 158 186 158 192 166 C186 172 172 172 166 166 Z" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M208 166 C214 158 228 158 234 166 C228 172 214 172 208 166 Z" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="180" cy="165.5" r="5" fill={INK} />
      <circle cx="221" cy="165.5" r="5" fill={INK} />
      <circle cx="181.6" cy="163.8" r="1.4" fill="#fff" />
      <circle cx="222.6" cy="163.8" r="1.4" fill="#fff" />
      {/* Nose */}
      <path d="M200 170 C198 182 194 190 196 194 C200 198 206 196 208 192" fill="none" stroke={INK} strokeWidth="2.4" />
      {/* Moustache and the smile */}
      <path d="M200 211 C190 214 180 220 168 216 C168 222 176 228 190 224 C204 220 214 226 224 226 C230 224 234 220 232 214 C222 220 210 214 200 211 Z" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M200 200 C188 198 174 200 162 210 C164 216 176 214 188 208 C194 206 198 206 200 208 C202 206 206 206 212 208 C224 214 236 216 238 210 C226 200 212 198 200 200 Z" fill={INK} />
      <path d="M184 230 C194 234 206 234 216 230" fill="none" stroke={SKIN_SHADE} strokeWidth="2.4" />
      {/* Sandal paste and kumkuma on the forehead */}
      <path d="M196 124 L204 124 L203 146 L197 146 Z" fill="#f1dfc0" stroke={INK} strokeWidth="1" />
      <circle cx="200" cy="137" r="3.6" fill="#c8102e" />

      {/* The Mysuru peta: kumkuma silk wound in folds, bands of gold zari,
          a jewelled sarpech with a white plume at the front */}
      <path d={PLUME} fill="#fbf5e6" stroke={INK} strokeWidth="2.4" />
      <path d="M208 80 C206 64 210 46 218 36" fill="none" stroke={CLOTH_SHADE} strokeWidth="2" />
      <path d={PETA_SHAPE} fill={PETA} stroke={INK} strokeWidth="3" />
      <path d="M232 62 C252 76 262 104 258 132 C248 128 240 126 232 125 C240 102 240 80 232 62 Z" fill={PETA_SHADE} />
      <g fill="none" stroke={GOLD} strokeLinecap="round">
        <path d="M146 124 C172 110 232 108 258 122" strokeWidth="6" />
        <path d="M150 104 C176 92 226 90 254 102" strokeWidth="4" />
        <path d="M160 82 C182 72 220 70 244 80" strokeWidth="3.5" />
        <path d="M152 130 C156 110 168 88 186 70" strokeWidth="2.5" opacity=".7" />
      </g>
      <path d={PETA_SHAPE} fill="none" stroke={INK} strokeWidth="3" />
      <path d="M190 90 L210 90 L214 104 L200 114 L186 104 Z" fill={GOLD} stroke={INK} strokeWidth="2" />
      <circle cx="200" cy="100" r="4.6" fill="#c8102e" stroke={INK} strokeWidth="1.2" />
      <circle cx="200" cy="112" r="2.4" fill="#fbf5e6" stroke={INK} strokeWidth="1" />
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
