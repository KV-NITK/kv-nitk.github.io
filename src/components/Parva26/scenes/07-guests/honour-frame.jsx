import { useEffect, useId, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { eventDay } from '@p26/content'
import { gsap } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { reliefLayers } from '@p26/styles/carving'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// One portrait on the lobby's wall of honour (Scene 7, allscenes.md): a
// carved heartwood frame with an arched top like the stage arch, a brass
// picture lamp over it, a brass nameplate and a role ribbon under it.
// A guest not yet revealed is covered with kumkuma velvet, tied with a gold
// cord whose knot is sealed with wax, and a paper tag gives the unveiling
// date. The first time a visitor sees a newly revealed guest, the seal
// cracks, the cord drops, the velvet slides down and the lamp comes on.
// Everything is CSS and inline SVG; only small pieces ever move.

const HEARTWOOD =
  'linear-gradient(90deg, rgba(0,0,0,.3), transparent 14%, rgba(255,214,160,.1) 50%, transparent 86%, rgba(0,0,0,.34)), linear-gradient(180deg, #86532e, #62381c 50%, #45250f)'

const SEEN_KEY = 'parva26:unveiled'

function hasSeen(id) {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]').includes(id)
  } catch {
    return false
  }
}

function markSeen(id) {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
    if (!seen.includes(id)) localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]))
  } catch {
    // ignore: the unveiling will just play again next time
  }
}

export const revealTime = (iso) => new Date(`${iso}T00:00:00+05:30`).getTime()

// "2 ದಿನ · 2 days" until the unveiling; hours on the last day.
function timeLeft(iso, now) {
  const ms = revealTime(iso) - now
  if (ms <= 0) return null
  const hours = Math.ceil(ms / 3_600_000)
  if (hours <= 24) return hours <= 1 ? { kn: 'ಇನ್ನೇನು', en: 'Any minute' } : { kn: `${hours} ಗಂಟೆ`, en: `${hours} hours` }
  const days = Math.ceil(ms / 86_400_000)
  return { kn: `${days} ದಿನ`, en: days === 1 ? '1 day' : `${days} days` }
}

// `guest` is either this year's (covered until it has a name) or a past
// guest (`past`: always revealed, no velvet). `open` shows the teaser on a
// covered frame, or the info card on a revealed one.
export function GuestFrame({ guest, past = false, next = false, now, open, onToggle, className }) {
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const boxRef = useRef(null)
  const revealed = Boolean(guest.name)
  const [stage, setStage] = useState(() => {
    if (!revealed) return 'covered'
    return past || (hasSeen(guest.id) && !guest.preview) ? 'revealed' : 'waiting'
  })
  const veiled = stage !== 'revealed'
  const day = guest.revealDate ? eventDay(guest.revealDate) : null

  // A newly revealed guest is unveiled once, when the frame is well in view.
  useEffect(() => {
    if (stage !== 'waiting') return
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStage('unveiling')
      },
      { threshold: 0.7 }
    )
    seen.observe(boxRef.current)
    return () => seen.disconnect()
  }, [stage])

  useEffect(() => {
    if (stage !== 'unveiling') return
    const tl = unveil(boxRef.current, reduced, () => {
      markSeen(guest.id)
      setStage('revealed')
    })
    return () => tl.kill()
  }, [stage, reduced, guest.id])

  // Tapping a covered frame: the veil gives a small shake ("not yet!").
  const nudge = () => {
    if (reduced || stage !== 'covered' || open) return
    gsap.fromTo(
      boxRef.current.querySelector('[data-nudge]'),
      { rotate: 0 },
      { keyframes: { rotate: [0, -2.4, 2, -1.3, 0.6, 0] }, duration: 0.55, ease: 'none', transformOrigin: '50% 0%' }
    )
  }

  const label =
    stage === 'covered'
      ? `Covered portrait${guest.role ? `, ${guest.role.en}` : ''}. Unveiling on ${day.en}. ${open ? 'Showing a hint.' : 'Tap for a hint.'}`
      : `${guest.name.en}, ${guest.role?.en ?? 'Guest'}. ${open ? 'Showing details.' : 'Tap for details.'}`

  return (
    // Not <figure>: the site's Cards.css styles every figure on every page.
    <div data-open={open || undefined} className={cn('group/frame relative flex flex-col items-center data-open:z-30', className)}>
      {/* Above the nameplate, which the tag may hang over on short screens */}
      <div
        ref={boxRef}
        className="relative isolate z-10 mt-[calc(var(--fw)*0.26)] aspect-[5/7] w-(--fw) transition-transform duration-300 ease-out [container-type:inline-size] group-data-open/frame:-translate-y-1 group-data-open/frame:scale-[1.04]"
      >
        <PictureLamp on={stage === 'revealed'} />

        <button
          type="button"
          onClick={() => {
            if (stage === 'waiting') return setStage('unveiling')
            nudge()
            onToggle()
          }}
          aria-expanded={open}
          aria-label={label}
          className="absolute inset-0 rounded-t-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kumkuma"
        >
          <FrameBody photo={revealed ? guest.photo : null} />
        </button>

        {!past && (stage === 'revealed' || stage === 'unveiling') && <FoldedVelvet hidden={stage === 'unveiling'} />}
        {veiled && <Veil />}
        {veiled && <Tag guest={guest} day={day} next={next} now={now} hinted={open && stage === 'covered'} subtitles={subtitles} />}
        {stage === 'unveiling' && <Puff />}
      </div>

      <div className="flex flex-col items-center">
        <Nameplate name={stage === 'revealed' ? guest.name : null} subtitles={subtitles} />
        {/* Frames without a role keep the ribbon's space, so a row of frames
            the same size lines up */}
        <RoleRibbon role={guest.role ?? { kn: '—', en: '—' }} subtitles={subtitles} blank={!guest.role} />
      </div>

      <p aria-live="polite" className="sr-only">
        {open && stage === 'covered' ? (guest.teaser?.en ?? 'Wait and see.') : ''}
      </p>
      {open && stage === 'revealed' && guest.card && <InfoCard card={guest.card} subtitles={subtitles} />}
    </div>
  )
}

// The frame itself: heartwood with a beaded moulding, a gilt slip round the
// opening, a small carved finial on the arch, and glass over the photo.
function FrameBody({ photo }) {
  return (
    <span
      className="absolute inset-0 block rounded-t-full shadow-[0_1.1rem_1.3rem_-0.5rem_rgba(58,26,6,.7),inset_0_1px_0_rgba(255,222,170,.35),inset_0_0_0_1px_rgba(30,12,2,.6)] transition-shadow group-hover/frame:shadow-[0_1.5rem_1.6rem_-0.5rem_rgba(58,26,6,.75),inset_0_1px_0_rgba(255,222,170,.35),inset_0_0_0_1px_rgba(30,12,2,.6)]"
      style={{ backgroundImage: HEARTWOOD }}
    >
      <span aria-hidden className="absolute inset-[3.2cqw] rounded-t-full border-[1.5cqw] border-dotted border-[#d9ab6c]/70" />
      <span
        className="absolute inset-x-[9cqw] bottom-[9cqw] top-[9cqw] block overflow-hidden rounded-t-full bg-[#2a1a10] shadow-[0_0_0_1.1cqw_#c9a052,0_0_0_1.8cqw_#3a1f0e]"
      >
        {photo && (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-top contrast-105 saturate-75 sepia-70 transition-[filter] duration-700 group-hover/frame:saturate-100 group-hover/frame:sepia-0 group-data-open/frame:saturate-100 group-data-open/frame:sepia-0"
          />
        )}
        {/* Inner shadow of the slip, and the glass catching the lobby light */}
        <span aria-hidden className="absolute inset-0 rounded-t-full shadow-[inset_0_0.8cqw_2.4cqw_rgba(0,0,0,.6)]" />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(118deg, transparent 38%, rgba(255,250,235,.16) 42%, transparent 50%, transparent 58%, rgba(255,250,235,.08) 61%, transparent 66%)' }}
        />
      </span>
      <Finial />
    </span>
  )
}

// A carved lotus bud on top of the arch, in sandalwood.
function Finial() {
  const bud = (
    <>
      <path d="M20 1 C25 7 28 12 26 18 C24 21 16 21 14 18 C12 12 15 7 20 1 Z" />
      <path d="M6 22 C11 16 16 18 20 22 C24 18 29 16 34 22 C30 25 10 25 6 22 Z" />
      <rect x="11" y="23.5" width="18" height="3.5" rx="1.5" />
    </>
  )
  return (
    <svg aria-hidden viewBox="0 0 40 28" className="absolute left-1/2 top-[-6.5cqw] w-[17cqw] -translate-x-1/2 overflow-visible">
      {reliefLayers(0.9).map((layer) => (
        <g key={layer.key} transform={`translate(0 ${layer.dy})`} fill={layer.fill}>
          {bud}
        </g>
      ))}
    </svg>
  )
}

// The brass picture lamp: a plate on the wall, a stem, and a hood over the
// frame. When on, the lip under the hood glows, light spills on the wall
// behind the frame and falls across the portrait, and dust drifts in it.
function PictureLamp({ on }) {
  const light = on ? 'opacity-100' : 'opacity-0'
  return (
    <>
      <span
        aria-hidden
        data-lamp-light
        className={cn(
          'pointer-events-none absolute -inset-x-[55%] -top-[48%] -z-10 h-[125%] bg-radial-[ellipse_50%_46%_at_50%_38%] from-[#fff3cc]/85 via-[#ffe2a0]/30 via-40% to-transparent to-70%',
          light
        )}
      />
      <span aria-hidden className="absolute left-1/2 top-[-25cqw] h-[4.6cqw] w-[11cqw] -translate-x-1/2 rounded-[1.2cqw] shadow-[0_0.4cqw_0.5cqw_rgba(50,24,6,.45)]" style={brass} />
      <span aria-hidden className="absolute left-1/2 top-[-21cqw] h-[9cqw] w-[1.8cqw] -translate-x-1/2 shadow-[0.4cqw_0_0.4cqw_rgba(50,24,6,.3)]" style={brass} />
      <span
        aria-hidden
        className="absolute left-1/2 top-[-13cqw] z-20 h-[5cqw] w-[52cqw] -translate-x-1/2 rounded-[50%/40%_40%_60%_60%] shadow-[0_0.6cqw_0.8cqw_rgba(50,24,6,.5)]"
        style={brass}
      >
        <span
          data-lamp-light
          className={cn('absolute inset-x-[7%] -bottom-[0.5cqw] h-[1.4cqw] rounded-full bg-[#fff8de] shadow-[0_0_1.6cqw_0.6cqw_rgba(255,226,150,.85)]', light)}
        />
      </span>
      <span
        aria-hidden
        data-lamp-light
        className={cn('pointer-events-none absolute -inset-x-[4%] top-[-9cqw] z-20 h-[74%]', light)}
        style={{ clipPath: 'polygon(26% 0, 74% 0, 100% 100%, 0 100%)', backgroundImage: 'linear-gradient(180deg, rgba(255,238,196,.34), rgba(255,230,180,.08) 60%, transparent)' }}
      >
        {on && (
          <>
            <span className="absolute left-[38%] top-[8%] size-[0.9cqw] min-h-0.5 min-w-0.5 rounded-full bg-[#fff6da] motion-safe:animate-mote" />
            <span className="absolute left-[58%] top-[20%] size-[0.7cqw] min-h-0.5 min-w-0.5 rounded-full bg-[#fff6da] motion-safe:animate-mote [animation-delay:-2.2s]" />
            <span className="absolute left-[47%] top-[36%] size-[0.8cqw] min-h-0.5 min-w-0.5 rounded-full bg-[#fff6da] motion-safe:animate-mote [animation-delay:-4.1s]" />
          </>
        )}
      </span>
    </>
  )
}

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
function Veil() {
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

// The paper tag on the cord: the unveiling date, and for the next guest a
// countdown stamp. Tapping the frame turns it over to the PR team's hint.
function Tag({ guest, day, next, now, hinted, subtitles }) {
  const left = next ? timeLeft(guest.revealDate, now) : null
  const teaser = guest.teaser ?? { kn: 'ಕಾದು ನೋಡಿ', en: 'Wait and see' }
  const face =
    'col-start-1 row-start-1 flex flex-col items-center rounded-[2px] bg-paper px-2 pb-2 pt-4 text-center text-pen shadow-[0_0.3rem_0.5rem_rgba(40,8,8,.45)] backface-hidden'
  const shape = { ...paper, clipPath: 'polygon(16% 0, 84% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)' }
  return (
    <div
      data-tag
      className={cn('pointer-events-none absolute left-1/2 top-[52.9%] z-10 w-[min(8.75rem,88cqw)] -translate-x-1/2 origin-top [perspective:700px]', next && 'motion-safe:animate-tremble')}
    >
      <div className={cn('grid rotate-[-3deg] transition-transform duration-500 transform-3d motion-reduce:transition-none', hinted && 'rotate-y-180')}>
        <div className={face} style={shape}>
          <Eyelet />
          <span lang="kn" className="font-kn-display text-[0.8rem] font-semibold leading-none text-pen/75">
            ಅನಾವರಣ
          </span>
          <span lang="kn" className="mt-0.5 font-kn-display text-base font-bold leading-tight">
            {day.kn}
          </span>
          <span className={cn('font-poster text-base leading-tight tracking-wider text-pen/80', !subtitles && 'sr-only')}>Unveiling {day.en}</span>
          {left && (
            <span className="mt-1 -rotate-3 rounded-[2px] border-2 border-kumkuma px-1.5 font-kn-display text-base font-bold leading-snug text-kumkuma [filter:url(#p26-ink)]">
              <span lang="kn">{left.kn}</span>
              {subtitles && <span> · {left.en}</span>}
            </span>
          )}
        </div>
        <div className={cn(face, 'justify-center rotate-y-180')} style={shape}>
          <Eyelet />
          <span lang="kn" className="font-kn-display text-[0.95rem] font-semibold leading-snug">
            {teaser.kn}
          </span>
          {subtitles && <span className="mt-1 text-[0.85rem] leading-snug text-pen/80">{teaser.en}</span>}
        </div>
      </div>
    </div>
  )
}

function Eyelet() {
  return <span aria-hidden className="absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full bg-[#5e0715] shadow-[0_0_0_2px_#c9962f]" />
}

// After the unveiling, the velvet lies bunched over the bottom of the frame.
function FoldedVelvet({ hidden }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      aria-hidden
      data-folded
      viewBox="0 0 108 24"
      className={cn('pointer-events-none absolute -left-[4%] bottom-[-7%] z-10 w-[108%] overflow-visible', hidden && 'invisible')}
    >
      <defs>
        <linearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d21b38" />
          <stop offset=".55" stopColor="#a30c26" />
          <stop offset="1" stopColor="#5e0715" />
        </linearGradient>
      </defs>
      <path
        d="M3 7 C11 1 19 6 27 2.5 C35 0 43 5.5 53 2.5 C63 0 71 5.5 81 2.5 C91 0 99 5 105 6 C107 12 105 18 101 22 Q93 19 87 22.5 Q79 19 71 22.5 Q63 19 55 22.5 Q47 19 39 22.5 Q31 19 23 22.5 Q15 19 7 22 C3 18 1.5 12 3 7 Z"
        fill={`url(#${id}f)`}
      />
      <g fill="none" strokeLinecap="round">
        {[15, 31, 47, 63, 79, 95].map((x) => (
          <path key={x} d={`M${x} 5 C${x - 1} 11 ${x + 1} 16 ${x - 1} 21`} stroke="#3e030c" strokeOpacity=".45" strokeWidth="2.6" />
        ))}
        {[22, 39, 55, 71, 87].map((x) => (
          <path key={x} d={`M${x} 4 C${x + 1} 10 ${x - 1} 15 ${x} 20`} stroke="#ff7084" strokeOpacity=".3" strokeWidth="1" />
        ))}
      </g>
      {/* The gold cord, coiled on top */}
      <path d="M62 6 C70 1 80 3 78 8 C76 12 66 10 68 5" fill="none" stroke="#d9ab45" strokeWidth="1.4" />
    </svg>
  )
}

// A puff of arishina and kumkuma as the portrait appears.
function Puff() {
  return (
    <span aria-hidden className="pointer-events-none absolute bottom-[4%] left-1/2 z-30">
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          data-puff
          className={cn('absolute size-1.5 rounded-full opacity-0', i % 3 ? 'bg-arishina' : 'bg-kumkuma', i % 4 === 0 && 'size-2.5 blur-[1px]')}
        />
      ))}
    </span>
  )
}

// About two seconds: the seal cracks, the cord and tag drop, the velvet
// slides down and bunches at the base, the lamp clicks on with a stutter,
// and a puff of powder goes up. With reduced motion the veil just fades.
function unveil(box, reduced, onDone) {
  const q = gsap.utils.selector(box)
  const tl = gsap.timeline({ onComplete: onDone })
  if (reduced) {
    return tl.to(q('[data-veil], [data-tag]'), { autoAlpha: 0, duration: 0.4 }).set(q('[data-folded]'), { visibility: 'visible' })
  }
  const w = box.offsetWidth
  tl.to(q('[data-seal="l"]'), { rotate: -32, x: -4, y: 14, autoAlpha: 0, duration: 0.5, ease: 'power2.in', transformOrigin: '50% 50%' }, 0)
    .to(q('[data-seal="r"]'), { rotate: 26, x: 4, y: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.in', transformOrigin: '50% 50%' }, 0.03)
    .to(q('[data-cord]'), { y: 34, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.22)
    .to(q('[data-tag]'), { y: w * 0.5, rotate: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0.22)
    .to(q('[data-cloth]'), { scaleY: 0.12, duration: 0.75, ease: 'power2.in', transformOrigin: '50% 100%' }, 0.45)
    .to(q('[data-cloth]'), { autoAlpha: 0, duration: 0.12 }, 1.08)
    .fromTo(q('[data-folded]'), { visibility: 'visible', scaleY: 0.2, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: '50% 0%' }, 1.05)
    .fromTo(q('[data-lamp-light]'), { opacity: 0 }, { keyframes: { opacity: [0, 0.85, 0.15, 1] }, duration: 0.35, ease: 'none' }, 1.3)
  q('[data-puff]').forEach((dot) => {
    const a = gsap.utils.random(-Math.PI * 0.95, -Math.PI * 0.05)
    const r = gsap.utils.random(0.18, 0.6) * w
    tl.set(dot, { x: 0, y: 0, autoAlpha: 1, scale: gsap.utils.random(0.6, 1.4) }, 1.3)
      .to(dot, { x: Math.cos(a) * r, y: Math.sin(a) * r, duration: 0.55, ease: 'power2.out' }, 1.3)
      .to(dot, { y: `+=${w * 0.25}`, autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, 1.85)
  })
  return tl
}

// The brass nameplate: engraved letters, darker than the brass, with a thin
// highlight on their lower edge. Blank until the guest is revealed.
function Nameplate({ name, subtitles }) {
  return (
    <div
      className="relative mt-[0.6rem] flex min-h-[3.4rem] w-max min-w-[max(86%,9.5rem)] max-w-[15rem] flex-col justify-center rounded-[3px] px-4 py-1 text-center shadow-[0_2px_3px_rgba(50,24,6,.55),inset_0_1px_0_rgba(255,248,220,.6),inset_0_-1px_0_rgba(80,50,10,.5)]"
      style={brass}
    >
      <span aria-hidden className="absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#6b4a14] shadow-[inset_0_1px_1px_rgba(0,0,0,.6),0_1px_0_rgba(255,240,200,.5)]" />
      <span aria-hidden className="absolute right-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#6b4a14] shadow-[inset_0_1px_1px_rgba(0,0,0,.6),0_1px_0_rgba(255,240,200,.5)]" />
      {name && (
        <>
          <span lang="kn" className="block font-kn-serif text-[0.95rem] font-bold leading-tight text-[#3a2406] [text-shadow:0_1px_0_rgba(255,238,190,.65)]">
            {name.kn}
          </span>
          <span className={cn('block font-poster text-[0.95rem] leading-tight tracking-[0.12em] text-[#4a300c] [text-shadow:0_1px_0_rgba(255,238,190,.6)]', !subtitles && 'sr-only')}>
            {name.en}
          </span>
        </>
      )}
    </div>
  )
}

// A kumkuma ribbon under the nameplate with the guest's role.
function RoleRibbon({ role, subtitles, blank }) {
  return (
    <p
      aria-hidden={blank || undefined}
      className={cn('mt-1.5 whitespace-nowrap px-5 py-0.5 text-center leading-snug text-[#fff4dc] [text-shadow:0_1px_0_rgba(60,0,10,.6)]', blank && 'invisible')}
      style={{ backgroundImage: 'linear-gradient(180deg, #d4243e, #9e0c24)', clipPath: 'polygon(0 0, 100% 0, 93% 50%, 100% 100%, 0 100%, 7% 50%)' }}
    >
      <span lang="kn" className="font-kn-display text-sm font-semibold">
        {role.kn}
      </span>
      {subtitles && (
        <span className="block font-poster text-sm tracking-wider lg:inline">
          <span className="hidden lg:inline"> · </span>
          {role.en}
        </span>
      )}
    </p>
  )
}

// A small paper card tucked into the corner of the frame (under it on a
// phone), with when and where, one line, and a link to the event.
function InfoCard({ card, subtitles }) {
  return (
    <div
      className="relative z-20 mt-3 w-[min(100%,15rem)] rotate-[2deg] bg-paper px-3 pb-3 pt-2.5 text-pen shadow-[0_0.5rem_0.9rem_rgba(40,20,5,.5)] lg:absolute lg:left-[72%] lg:top-[42%] lg:mt-0 lg:w-[12.5rem] lg:rotate-[5deg]"
      style={paper}
    >
      <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rotate-[-4deg] bg-[#e8d9a8]/80 shadow-[0_1px_1px_rgba(0,0,0,.15)]" />
      <p lang="kn" className="font-kn-display text-base font-bold leading-snug">
        {card.when.kn}
      </p>
      {subtitles && <p className="text-base font-semibold leading-snug">{card.when.en}</p>}
      {card.line && <p className="mt-1 text-[0.9rem] leading-snug text-pen/85">{card.line}</p>}
      {card.link && (
        <a
          href={card.link}
          className="mt-2 flex min-h-11 flex-col justify-center font-kn-display text-base font-bold leading-tight text-kumkuma underline decoration-kumkuma/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumkuma"
        >
          <span lang="kn">ಕಾರ್ಯಕ್ರಮ ನೋಡಿ →</span>
          {subtitles && <span className="font-kn-body text-[0.9rem] font-semibold">See the event</span>}
        </a>
      )}
    </div>
  )
}
