import { cn } from '@/lib/utils'

// Poster pictures for Scene 6, drawn in the flat, bold way of hand-painted
// film posters: one motif per kind of event, each with a small loop. Only
// posters on screen animate (the board pauses the rest). Real photos replace
// these for singers and guests only (the `photo` slot in data.js).

// Each poster's colours, all from the palette: ground, sunburst, title
// paint, its shadow, ink for small print, and the date band.
export const POSTER_STYLES = {
  music: { ground: '#c8102e', burst: '#e0334a', title: '#f2c12e', shade: '#5a0612', ink: '#fff4dc', band: '#140c08' },
  dj: { ground: '#2b2140', burst: '#3a2d58', title: '#ffe9a8', shade: '#c8102e', ink: '#f1dfc0', band: '#c8102e' },
  quiz: { ground: '#f2c12e', burst: '#f7d25e', title: '#c8102e', shade: '#6b3f22', ink: '#3b2a1a', band: '#6b3f22' },
  literature: { ground: '#f1dfc0', burst: '#e8d0a8', title: '#6b3f22', shade: '#c8955f', ink: '#3b2a1a', band: '#6b3f22' },
  drama: { ground: '#6b3f22', burst: '#7d4c2a', title: '#f1dfc0', shade: '#c8102e', ink: '#f1dfc0', band: '#140c08' },
  comedy: { ground: '#c8955f', burst: '#d6a672', title: '#c8102e', shade: '#3b2a1a', ink: '#3b2a1a', band: '#c8102e' },
  film: { ground: '#3e7b2e', burst: '#4a8a38', title: '#f2c12e', shade: '#140c08', ink: '#f1dfc0', band: '#140c08' },
  dance: { ground: '#c8102e', burst: '#d62a41', title: '#fff4dc', shade: '#3b0510', ink: '#fff4dc', band: '#f2c12e' },
  culture: { ground: '#b8862b', burst: '#c99a3e', title: '#fff4dc', shade: '#5a1c0a', ink: '#3b2a1a', band: '#5a1c0a' },
}

// Rotation and scaling about the shape's own middle.
const own = { transformBox: 'fill-box', transformOrigin: 'center' }
const base = { transformBox: 'fill-box', transformOrigin: '50% 100%' }

function Quiz({ c }) {
  return (
    <>
      <g className="motion-safe:animate-wobble" style={base}>
        <path d="M34 34 C34 16 66 14 66 32 C66 44 50 45 50 58 L50 63" fill="none" stroke={c.title} strokeWidth="10" strokeLinecap="round" />
        <path d="M34 34 C34 16 66 14 66 32 C66 44 50 45 50 58 L50 63" fill="none" stroke={c.shade} strokeWidth="3" strokeLinecap="round" transform="translate(2.5 2.5)" opacity=".5" />
        <circle cx="50" cy="75" r="6" fill={c.title} />
      </g>
      {/* The buzzer */}
      <ellipse cx="50" cy="95" rx="21" ry="4" fill={c.shade} />
      <path d="M36 94 C36 83 64 83 64 94 Z" fill="#c8102e" stroke={c.shade} strokeWidth="1.5" />
      <ellipse cx="45" cy="87" rx="4" ry="2" fill="#fff4dc" className="motion-safe:animate-blink" />
    </>
  )
}

function Music({ c }) {
  return (
    <>
      {[0, 0.7, 1.4].map((delay) => (
        <circle key={delay} cx="50" cy="32" r="24" fill="none" stroke={c.title} strokeWidth="2" className="motion-safe:animate-ring" style={{ ...own, animationDelay: `${delay}s` }} opacity="0" />
      ))}
      {/* A ribbon microphone on a stand */}
      <rect x="38" y="14" width="24" height="36" rx="12" fill={c.title} stroke={c.shade} strokeWidth="2" />
      {[22, 28, 34, 40].map((y) => (
        <line key={y} x1="40" x2="60" y1={y} y2={y} stroke={c.shade} strokeWidth="1.5" opacity=".6" />
      ))}
      <path d="M32 40 C32 58 68 58 68 40" fill="none" stroke={c.ink} strokeWidth="3" />
      <line x1="50" y1="56" x2="50" y2="90" stroke={c.ink} strokeWidth="3.5" />
      <path d="M36 96 L64 96 L58 90 L42 90 Z" fill={c.ink} />
    </>
  )
}

function Dj({ c }) {
  return (
    <>
      <g className="motion-safe:animate-spin [animation-duration:14s]" style={own} opacity=".35">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M50 50 L47 2 L53 2 Z" fill={c.title} transform={`rotate(${i * 30} 50 50)`} />
        ))}
      </g>
      <g className="motion-safe:animate-spin [animation-duration:2.4s]" style={own}>
        <circle cx="50" cy="52" r="32" fill="#120c14" stroke={c.shade} strokeWidth="2" />
        {[27, 22, 17].map((r) => (
          <circle key={r} cx="50" cy="52" r={r} fill="none" stroke="#3a3040" strokeWidth=".8" />
        ))}
        <circle cx="50" cy="52" r="10" fill={c.shade} />
        <rect x="47" y="44" width="6" height="3" fill={c.title} />
        <circle cx="50" cy="52" r="1.6" fill="#120c14" />
      </g>
      {/* Tonearm */}
      <path d="M86 16 L86 22 L66 60" fill="none" stroke={c.ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="86" cy="16" r="4" fill={c.ink} />
    </>
  )
}

function Literature({ c }) {
  return (
    <>
      {/* An open book */}
      <path d="M10 44 C24 38 40 40 50 48 L50 90 C40 82 24 80 10 86 Z" fill="#fff8e8" stroke={c.shade} strokeWidth="2" />
      <path d="M90 44 C76 38 60 40 50 48 L50 90 C60 82 76 80 90 86 Z" fill="#fff8e8" stroke={c.shade} strokeWidth="2" />
      {[54, 60, 66, 72].map((y, i) => (
        <path key={y} d={`M16 ${y - 4 + i} C26 ${y - 8} 38 ${y - 7} 46 ${y - 2}`} fill="none" stroke={c.shade} strokeWidth="1.2" opacity=".55" />
      ))}
      <path d="M56 56 C64 52 74 51 80 53" fill="none" stroke={c.title} strokeWidth="1.4" />
      {/* The quill, writing */}
      <g className="motion-safe:animate-quill" style={own}>
        <path d="M58 58 C66 36 80 18 92 10 C88 26 78 42 60 58 Z" fill={c.title} stroke={c.shade} strokeWidth="1.5" />
        <line x1="58" y1="58" x2="84" y2="22" stroke={c.shade} strokeWidth="1" />
      </g>
    </>
  )
}

function Drama({ c }) {
  const mask = (mouth) => (
    <>
      <path d="M22 18 C22 10 58 10 58 18 C58 44 50 60 40 60 C30 60 22 44 22 18 Z" fill="#fff4dc" stroke={c.shade} strokeWidth="2" />
      <ellipse cx="32" cy="28" rx="5" ry="3.5" fill={c.ground} />
      <ellipse cx="48" cy="28" rx="5" ry="3.5" fill={c.ground} />
      <path d={mouth} fill={c.ground} />
    </>
  )
  return (
    <>
      <g transform="translate(-6 8)">
        <g className="motion-safe:animate-tilt" style={own}>
          {mask('M31 44 C36 52 44 52 49 44 C44 47 36 47 31 44 Z')}
        </g>
      </g>
      <g transform="translate(26 22)">
        <g className="motion-safe:animate-tilt [animation-delay:-1.3s]" style={own}>
          {mask('M31 50 C36 43 44 43 49 50 C44 47 36 47 31 50 Z')}
        </g>
      </g>
    </>
  )
}

function Comedy({ c }) {
  return (
    <>
      {/* A mime: white face, finger on the lips */}
      <ellipse cx="44" cy="46" rx="22" ry="28" fill="#fff4dc" stroke={c.shade} strokeWidth="2" />
      <path d="M32 38 L40 38 M48 38 L56 38" stroke={c.shade} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 60 C40 64 48 64 52 60" fill="none" stroke="#c8102e" strokeWidth="3" strokeLinecap="round" />
      <rect x="42" y="52" width="5" height="22" rx="2.5" fill="#f1dfc0" stroke={c.shade} strokeWidth="1.5" />
      {/* A speech bubble with nothing in it */}
      <path d="M68 14 C84 14 92 20 92 28 C92 36 84 42 72 42 L66 50 L67 41 C60 39 56 34 56 28 C56 20 60 14 68 14 Z" fill="#fff4dc" stroke={c.shade} strokeWidth="1.5" />
      {[66, 74, 82].map((x, i) => (
        <circle key={x} cx={x} cy="28" r="2.4" fill={c.shade} className="motion-safe:animate-blink" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
    </>
  )
}

function Film({ c }) {
  return (
    <>
      <path d="M8 84 C30 70 60 92 94 70" fill="none" stroke="#120c08" strokeWidth="12" />
      <path d="M8 84 C30 70 60 92 94 70" fill="none" stroke={c.title} strokeWidth="1.5" strokeDasharray="3 4" />
      <g className="motion-safe:animate-spin [animation-duration:5s]" style={own}>
        <circle cx="50" cy="44" r="30" fill={c.ink} stroke={c.shade} strokeWidth="2" />
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx="50" cy="26" r="7" fill={c.ground} transform={`rotate(${i * 72} 50 44)`} />
        ))}
        <circle cx="50" cy="44" r="5" fill={c.shade} />
      </g>
    </>
  )
}

function Dance({ c }) {
  return (
    <>
      {/* A string of ghungroo bells swinging */}
      <g className="motion-safe:animate-swing" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
        <path d="M14 20 C34 36 66 36 86 20" fill="none" stroke={c.shade} strokeWidth="4" />
        {Array.from({ length: 7 }, (_, i) => {
          const t = i / 6
          const x = 14 + t * 72
          const y = 20 + Math.sin(t * Math.PI) * 13
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x} y2={y + 12} stroke={c.shade} strokeWidth="1.5" />
              <circle cx={x} cy={y + 17} r="6" fill={c.title} stroke={c.shade} strokeWidth="1.5" />
              <line x1={x - 3} y1={y + 19} x2={x + 3} y2={y + 19} stroke={c.shade} strokeWidth="1.2" />
            </g>
          )
        })}
      </g>
      <path d="M26 92 C30 70 40 64 50 64 C60 64 70 70 74 92 Z" fill={c.shade} opacity=".5" />
    </>
  )
}

function Culture({ c }) {
  return (
    <>
      {/* A Yakshagana crown, catching the light */}
      <path d="M14 82 C14 40 86 40 86 82 Z" fill={c.title} stroke={c.shade} strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d="M50 80 L47 34 L53 34 Z" fill={c.shade} opacity=".35" transform={`rotate(${-64 + i * 16} 50 80)`} />
      ))}
      <circle cx="50" cy="62" r="9" fill="#c8102e" stroke={c.shade} strokeWidth="2" />
      <rect x="18" y="80" width="64" height="8" rx="2" fill={c.shade} />
      <circle cx="30" cy="54" r="2.2" fill="#fff4dc" className="motion-safe:animate-blink" />
      <circle cx="70" cy="54" r="2.2" fill="#fff4dc" className="motion-safe:animate-blink [animation-delay:-.5s]" />
    </>
  )
}

const MOTIFS = { music: Music, dj: Dj, quiz: Quiz, literature: Literature, drama: Drama, comedy: Comedy, film: Film, dance: Dance, culture: Culture }

export function PosterMotif({ type, className }) {
  const Motif = MOTIFS[type] ?? Film
  const c = POSTER_STYLES[type] ?? POSTER_STYLES.film
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn('overflow-visible', className)}>
      <Motif c={c} />
    </svg>
  )
}
