import { toKannadaDigits } from './text'
import { brass } from './fx/materials'
import { wood } from './fx/textures'
import { cn } from '../../lib/utils'

// The inauguration lamp at the stage edge (brief, Scene 0): a tall brass
// lamp with five wicks round its oil dish, three agarbatti sticks smoking
// beside it, and an engraved brass plate on its plinth counting the lamps
// lit so far. `wicks` is how many are burning (0–5). It stays lit at the edge
// of the stage for the rest of the show.

// The dish rim is an ellipse centred at (30, 46); five wicks sit round it.
const WICKS = [90, 18, 162, 306, 234].map((deg) => {
  const a = (deg * Math.PI) / 180
  return { x: 30 + 29.5 * Math.cos(a), y: 44.5 + 6 * Math.sin(a), front: Math.sin(a) > -0.2 }
})

export function Lamp({ wicks, count, className }) {
  return (
    <div className={cn('pointer-events-none flex items-end', className)}>
      <div className="relative">
        {/* Warm pool on the stage floor, breathing with the flames */}
        <div
          aria-hidden
          className={cn(
            'absolute -bottom-3 left-1/2 h-10 w-[420%] -translate-x-1/2 rounded-[50%] bg-radial from-[#ffbe6a]/45 via-[#ff9a3a]/12 to-transparent to-70% transition-opacity duration-700 motion-safe:animate-lamp-pool',
            wicks ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div className="relative isolate w-[2rem] lg:w-[3.4rem]">
          <LampBody />
          <span aria-hidden data-lamp-light className="absolute left-[8%] right-[8%] top-[20%] h-[10%]" />
          {WICKS.map((w, i) => (
            <Flame key={i} x={w.x} y={w.y} lit={i < wicks} index={i} behind={!w.front} />
          ))}
        </div>
        <CounterPlate count={count} />
      </div>
      <Agarbatti className="-ml-1 mb-3 w-[0.8rem] lg:mb-5 lg:w-[1.3rem]" />
    </div>
  )
}

function LampBody() {
  return (
    <svg viewBox="0 0 60 170" aria-hidden className="relative block w-full overflow-visible drop-shadow-[0_3px_4px_rgba(0,0,0,.6)]">
      <defs>
        <linearGradient id="p26-lamp-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#5a3a10" />
          <stop offset=".22" stopColor="#c99a3e" />
          <stop offset=".4" stopColor="#fff0b8" />
          <stop offset=".58" stopColor="#d7a647" />
          <stop offset="1" stopColor="#4a300c" />
        </linearGradient>
      </defs>
      <g fill="url(#p26-lamp-brass)">
        <path d="M30 2 C36 9 36 15 30 21 C24 15 24 9 30 2 Z" />
        <rect x="28.5" y="19" width="3" height="27" />
        <path d="M2 45 C2 57 17 61 30 61 C43 61 58 57 58 45 Z" />
        <ellipse cx="30" cy="45" rx="28" ry="5.8" />
        <path d="M24 60 L36 60 L33.5 67 L26.5 67 Z" />
        <rect x="26.8" y="66" width="6.4" height="86" />
        <ellipse cx="30" cy="74" rx="5.8" ry="3.2" />
        <ellipse cx="30" cy="94" rx="7.2" ry="4.4" />
        <ellipse cx="30" cy="114" rx="6.2" ry="3.6" />
        <ellipse cx="30" cy="134" rx="7.4" ry="4.4" />
        <ellipse cx="30" cy="151" rx="9.5" ry="5.5" />
        <path d="M8 166 C8 159 18 155 30 155 C42 155 52 159 52 166 Z" />
        <rect x="5" y="164" width="50" height="5" rx="2" />
      </g>
      {/* Oil catching the light, and the engraved rings */}
      <ellipse cx="30" cy="45" rx="24" ry="3.9" fill="#6b4810" />
      <ellipse cx="24" cy="44.2" rx="8" ry="1" fill="#fff4cf" opacity=".55" />
      <g fill="none" stroke="#3c2606" strokeOpacity=".55" strokeWidth=".7">
        <path d="M24.2 94 h11.6 M24.8 134 h10.4 M21.5 151 h17 M11 162 h38 M4 49 C16 55 44 55 56 49" />
      </g>
      {WICKS.map((w, i) => (
        <path key={i} d={`M${w.x - 2} ${w.y + 1} L${w.x} ${w.y - 1.6} L${w.x + 2} ${w.y + 1} Z`} fill="#f4dfa0" opacity={w.front ? 1 : 0.6} />
      ))}
    </svg>
  )
}

// A flame in layers: a blue root, a pale yellow core, an orange edge, and a
// soft round glow. Each flickers on its own rhythm.
function Flame({ x, y, lit, index, behind }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute w-[15%] -translate-x-1/2 -translate-y-full transition-[opacity,scale] duration-300 ease-[cubic-bezier(.3,1.6,.5,1)]',
        behind && 'z-[-1]',
        lit ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )}
      style={{ left: `${(x / 60) * 100}%`, top: `${(y / 170) * 100}%`, transformOrigin: '50% 100%' }}
    >
      <span
        className="relative block aspect-[1/2.1] origin-bottom motion-safe:animate-flame"
        style={{ animationDuration: `${0.78 + index * 0.13}s`, animationDelay: `${-index * 0.37}s` }}
      >
        <span className="absolute left-1/2 top-[62%] size-[520%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-[#ffc46a]/50 via-[#ff9a3a]/14 via-40% to-transparent to-70%" />
        <span
          className="absolute inset-0 rounded-[50%_50%_46%_46%/64%_64%_36%_36%]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 30% 14% at 50% 90%, #8ab8ff, transparent), radial-gradient(ellipse 50% 72% at 50% 70%, #fffbe2 0 20%, #ffd35a 40%, #ff9a2c 66%, rgba(255,120,30,0) 72%)',
          }}
        />
      </span>
    </span>
  )
}

// Three sticks in a small brass holder, their tips glowing. The smoke is
// drawn by the canvases, which find the tips by [data-ember].
function Agarbatti({ className }) {
  const tips = [
    [8, 9],
    [15, 5],
    [22, 10],
  ]
  return (
    <div className={cn('relative', className)} aria-hidden>
      <svg viewBox="0 0 30 70" className="block w-full overflow-visible">
        {tips.map(([x, y], i) => (
          <g key={i}>
            <line x1="15" y1="62" x2={x} y2={y} stroke="#2a1a0c" strokeWidth="1.3" />
            <line x1={15 + (x - 15) * 0.45} y1={62 + (y - 62) * 0.45} x2={x} y2={y} stroke="#5c3b22" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
        <path d="M6 66 C6 59 24 59 24 66 Z" fill="#b8862b" />
        <rect x="4" y="65" width="22" height="3.5" rx="1.5" fill="#8a6420" />
      </svg>
      {tips.map(([x, y], i) => (
        <span
          key={i}
          data-ember
          className="absolute size-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-[#fff0b0] via-[#ff8a2a] to-transparent to-70% motion-safe:animate-ember"
          style={{ left: `${(x / 30) * 100}%`, top: `${(y / 70) * 100}%`, animationDelay: `${-i * 0.9}s` }}
        />
      ))}
    </div>
  )
}

// Engraved brass plate on a small wooden plinth. The digits sit on drums that
// roll when the count goes up, like an odometer.
function CounterPlate({ count }) {
  const digits = toKannadaDigits(count.toLocaleString('en-IN'))

  return (
    <div
      className="pointer-events-auto relative -mx-3 mt-0.5 rounded-[2px] p-[3px] shadow-[0_3px_5px_rgba(0,0,0,.6)] lg:-mx-5"
      style={wood}
      data-en={`${count.toLocaleString('en-IN')} lamps lit so far`}
    >
      <div className="rounded-[1px] px-1.5 py-0.5 text-center text-[#3a2606] shadow-[inset_0_1px_0_rgba(255,245,210,.6)]" style={brass}>
        <span className="flex justify-center font-kn-serif text-[0.5rem] font-bold leading-none [text-shadow:0_.5px_0_rgba(255,240,200,.6)] lg:text-[0.7rem]" lang="kn">
          {Array.from(digits).map((ch, i) => (/\d|[೦-೯]/.test(ch) ? <Drum key={`${i}-${digits.length}`} digit={ch} /> : <span key={i}>{ch}</span>))}
        </span>
        <span lang="kn" className="block whitespace-nowrap font-kn-serif text-[0.34rem] font-semibold leading-tight lg:text-[0.46rem]">
          ದೀಪಗಳು ಬೆಳಗಿವೆ
        </span>
      </div>
    </div>
  )
}

const NUMERALS = Array.from('೦೧೨೩೪೫೬೭೮೯')

function Drum({ digit }) {
  const value = NUMERALS.indexOf(digit)
  return (
    <span className="relative inline-block h-[1.1em] w-[0.62em] overflow-hidden">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]"
        style={{ transform: `translateY(${-value * 1.1}em)` }}
      >
        {NUMERALS.map((n) => (
          <span key={n} className="block h-[1.1em] text-center leading-[1.1em]">
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}
