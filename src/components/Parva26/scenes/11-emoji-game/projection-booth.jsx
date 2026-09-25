import { usePrefs } from '@p26/lib/prefs'
import { paper } from '@p26/styles/textures'
import { brass } from '@p26/styles/materials'
import { cn } from '@/lib/utils'

// The projection booth (Scene 11, allscenes.md): the projector seen from the
// side, its footage counter running as the clock; the port window onto the
// hall, where the distant screen glows; the bare bulb over the bench; the
// shelf of labelled reels; and the operators' duty chart.

const METAL = '#3d4943'
const METAL_DARK = '#27302b'
const INK = '#141a17'

// The big projector, facing right. `seconds` rolls on the footage counter;
// the reels turn while `running`.
export function Projector({ seconds, running, className }) {
  const counter = String(Math.min(9999, seconds)).padStart(4, '0')
  return (
    <div aria-hidden className={cn('relative aspect-[300/360]', className)}>
      {/* Warm light leaking from the lamp house vents */}
      <span
        className="absolute left-[4%] top-[4%] h-[34%] w-[30%] opacity-70 motion-safe:animate-hum"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 9%, rgba(255,196,110,.22) 9% 13%)', maskImage: 'linear-gradient(0deg, #000, transparent)' }}
      />
      <svg viewBox="0 0 300 360" className="absolute inset-0 size-full">
        {/* Pedestal */}
        <path d="M40 350 L220 350 L208 334 L52 334 Z" fill={METAL_DARK} stroke={INK} strokeWidth="2" />
        <rect x="112" y="226" width="40" height="110" fill={METAL} stroke={INK} strokeWidth="2" />
        {/* Lamp house with its chimney and glowing vents */}
        <rect x="44" y="84" width="24" height="30" fill={METAL_DARK} stroke={INK} strokeWidth="2" />
        <rect x="18" y="110" width="84" height="112" rx="6" fill={METAL} stroke={INK} strokeWidth="2.4" />
        {[126, 138, 150, 162, 174, 186].map((y) => (
          <rect key={y} x="28" y={y} width="50" height="5" rx="2" fill="#ffcf7a" opacity=".85" />
        ))}
        <circle cx="86" cy="206" r="5" fill={METAL_DARK} stroke={INK} strokeWidth="1.5" />
        {/* Main body and mechanism */}
        <rect x="96" y="146" width="136" height="84" rx="4" fill={METAL} stroke={INK} strokeWidth="2.4" />
        <rect x="104" y="154" width="54" height="40" rx="3" fill={METAL_DARK} stroke={INK} strokeWidth="1.5" />
        <circle cx="131" cy="174" r="12" fill="#1c2420" stroke="#56645c" strokeWidth="2" />
        {[100, 228].flatMap((x) => [150, 226].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="#6b7a71" />))}
        {/* Lens, pointing at the port window */}
        <rect x="232" y="170" width="48" height="26" rx="3" fill={METAL_DARK} stroke={INK} strokeWidth="2" />
        <rect x="244" y="168" width="8" height="30" fill="#b8862b" stroke={INK} strokeWidth="1.5" />
        <rect x="278" y="166" width="12" height="34" rx="3" fill="#1c2420" stroke={INK} strokeWidth="2" />
        <ellipse cx="290" cy="183" rx="3" ry="14" fill="#9fb8c8" opacity=".8" />
        {/* Reel arms */}
        <path d="M172 146 L178 96 M186 230 L192 262" stroke={METAL} strokeWidth="10" strokeLinecap="round" />
        {/* Footage counter */}
        <rect x="166" y="200" width="58" height="22" rx="3" fill="#0d0f0e" stroke="#b8862b" strokeWidth="2" />
        <text x="195" y="216" textAnchor="middle" fontSize="15" fontFamily="'Bebas Neue', sans-serif" letterSpacing="2.5" fill="#f2e6c8">
          {counter}
        </text>
        <text x="195" y="236" textAnchor="middle" fontSize="7" fontFamily="'Bebas Neue', sans-serif" letterSpacing="1.5" fill="#9aa89f">
          FEET
        </text>
      </svg>
      {/* Feed and take-up reels, in their own layers so they can turn */}
      <Spool className={cn('left-[40%] top-[3%] w-[38%]', running && 'motion-safe:animate-[spin_4s_linear_infinite]')} />
      <Spool className={cn('left-[48%] top-[64%] w-[30%]', running && 'motion-safe:animate-[spin_3s_linear_infinite]')} />
    </div>
  )
}

function Spool({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('absolute aspect-square', className)}>
      <circle cx="50" cy="50" r="47" fill="#4b5751" stroke={INK} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="34" fill="#2b221a" />
      {[0, 120, 240].map((a) => (
        <circle key={a} cx={50 + Math.cos((a * Math.PI) / 180) * 26} cy={50 + Math.sin((a * Math.PI) / 180) * 26} r="9" fill="#141a17" />
      ))}
      <circle cx="50" cy="50" r="7" fill="#8a988f" stroke={INK} strokeWidth="2" />
    </svg>
  )
}

// The small square port the projector shines through; the screen far away
// glows in it. After a right answer the title flickers on it.
export function PortWindow({ title, className }) {
  return (
    <div aria-hidden className={cn('relative aspect-square rounded-[3px] p-2 shadow-[0_6px_12px_rgba(0,0,0,.6)]', className)} style={{ backgroundImage: 'linear-gradient(180deg, #5b4a34, #3a2e20)' }}>
      <div className="relative size-full overflow-hidden rounded-[2px] bg-[#07090d] shadow-[inset_0_4px_10px_rgba(0,0,0,.9)]">
        <span className="absolute inset-x-[18%] top-[30%] h-[34%] rounded-[2px] bg-[#dfe8f2] shadow-[0_0_18px_6px_rgba(200,220,255,.35)] motion-safe:animate-hum" />
        {title && (
          <span lang="kn" className="absolute inset-x-[18%] top-[30%] grid h-[34%] place-items-center font-kn-display text-[0.55rem] font-bold leading-none text-[#1d1a17] motion-safe:animate-jump-cut">
            {title}
          </span>
        )}
        <span className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(125deg, transparent 40%, rgba(255,255,255,.08) 46%, transparent 52%)' }} />
      </div>
    </div>
  )
}

// A bare bulb on its flex, swaying a little, with its pool of warm light.
export function BareBulb({ className }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute', className)}>
      <span className="absolute left-1/2 top-0 -z-10 h-[70vh] w-[60vw] max-w-[44rem] -translate-x-1/2 bg-radial-[ellipse_50%_45%_at_50%_8%] from-[#ffd68a]/35 via-[#ffc870]/10 via-45% to-transparent to-70%" />
      <div className="relative flex origin-top flex-col items-center motion-safe:animate-bulb-sway">
        <span className="h-16 w-px bg-black/70 sm:h-20" />
        <span className="h-3 w-3 rounded-t-[2px] bg-[#6b5a3a]" />
        <span className="-mt-0.5 size-6 rounded-full bg-[#fff4d0] shadow-[0_0_24px_10px_rgba(255,214,140,.7)]" />
      </div>
    </div>
  )
}

// The shelf for labelled reels: one slot for each of today's cans.
export function ReelShelf({ results, total, className }) {
  return (
    <div className={cn('relative', className)}>
      <ul className="flex items-end justify-center gap-2 px-3 pb-1" aria-label="Today's reels">
        {Array.from({ length: total }, (_, i) => {
          const r = results[i]
          return (
            <li key={i} className="relative">
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-full shadow-[0_3px_4px_rgba(0,0,0,.5)] sm:size-11',
                  r ? '' : 'border-2 border-dashed border-white/15'
                )}
                style={r ? { backgroundImage: 'radial-gradient(circle at 40% 35%, #c9ced2, #7e858b 60%, #4f555a)' } : undefined}
              >
                {r && (
                  <span className={cn('text-lg font-bold leading-none', r.solved ? 'text-[#2f7a2f]' : 'text-kumkuma')} aria-label={r.solved ? `Reel ${i + 1}: labelled` : `Reel ${i + 1}: missed`}>
                    {r.solved ? '✓' : '✕'}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      <span aria-hidden className="block h-2.5 rounded-[2px] shadow-[0_4px_6px_rgba(0,0,0,.5)]" style={{ backgroundImage: 'linear-gradient(180deg, #8a5a30, #5a3419)' }} />
    </div>
  )
}

// The operators' duty chart: today's top 10, typed on paper and pinned up.
// Your own row gets a yellow highlighter streak.
export function DutyChart({ rows, className }) {
  const { subtitles } = usePrefs()
  return (
    <div className={cn('relative rotate-[1.5deg] bg-paper px-4 pb-4 pt-5 text-pen shadow-[0_8px_14px_rgba(0,0,0,.55)]', className)} style={paper}>
      {['left-3', 'right-3'].map((at) => (
        <span key={at} aria-hidden className={cn('absolute top-1.5 size-2.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,.5)]', at)} style={brass} />
      ))}
      <h3 className="text-center leading-tight">
        <span lang="kn" className="block font-kn-display text-base font-bold">
          ಆಪರೇಟರ್ ಡ್ಯೂಟಿ ಚಾರ್ಟ್
        </span>
        {subtitles && <span className="block font-typewriter text-xs">Operators’ duty chart · today’s top 10</span>}
      </h3>
      <ol className="mt-2 space-y-0.5 font-typewriter text-sm">
        {rows.map((row, i) => (
          <li key={`${row.name}${i}`} className={cn('flex items-baseline gap-2 px-1', row.me && 'bg-[linear-gradient(transparent_20%,rgba(242,210,60,.75)_20%,rgba(242,210,60,.75)_85%,transparent_85%)]')}>
            <span className="w-5 text-right">{row.rank ?? i + 1}.</span>
            <span className="flex-1 truncate">{row.name}</span>
            <span className="font-bold">{row.score}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
