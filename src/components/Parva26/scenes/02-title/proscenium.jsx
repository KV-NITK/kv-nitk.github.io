import { RECESS, reliefLayers, vineAcross, vineDown } from '@p26/styles/carving'
import { cn } from '@/lib/utils'

// The stage (brief, Scene 1): a carved sandalwood arch with the Gandabherunda
// crest, parrots in the vine frieze and elephants at the base, a velvet drape
// across the top, the curtains gathered to both sides, and the stage floor
// with its footlights. Everything is lit from below by the footlights. The
// `lamp` spans shift with the mouse, as if someone walked past with a lamp.
//
// On phones the camera is closer: only the crest and a sliver of each side
// show, and the curtains and elephants are out of frame.
export function Proscenium({ children }) {
  return (
    <div className="relative">
      <Crest data-fade className="absolute bottom-[calc(100%-1.1rem)] left-1/2 z-10 w-[3.8rem] -translate-x-1/2 lg:bottom-[calc(100%-1.6rem)] lg:w-[5.4rem]" />

      <div data-fade className="relative h-[1.5rem] overflow-hidden rounded-t-[4px] lg:h-[2.5rem]" style={vineAcross}>
        <Lamp />
        <Parrot className="absolute left-[24%] top-1/2 hidden w-[2.4rem] -translate-y-1/2 lg:block" />
        <Parrot className="absolute right-[24%] top-1/2 hidden w-[2.4rem] -translate-y-1/2 -scale-x-100 lg:block" />
      </div>

      <div className="flex">
        <Jamb />
        <div className="relative flex-1 bg-[#0a0604]">
          <Valance />
          <div className="flex pt-[0.7rem] lg:pt-[1.5rem]">
            <Curtain side="left" />
            <div className="relative flex-1">{children}</div>
            <Curtain side="right" />
          </div>
          <StageFloor />
        </div>
        <Jamb />
      </div>

      <div data-fade>
        <Elephant className="absolute -bottom-1 right-full hidden w-[5.2rem] lg:block" />
        <Elephant className="absolute -bottom-1 left-full hidden w-[5.2rem] -scale-x-100 lg:block" />
      </div>
    </div>
  )
}

// Carved pieces get brighter toward the footlights and darker toward the ceiling.
const footlit = 'linear-gradient(180deg, rgba(10,4,0,.5), rgba(10,4,0,.15) 55%, rgba(255,190,110,.18))'

function Jamb() {
  return (
    <div data-fade className="relative w-[0.45rem] overflow-hidden lg:w-[2.3rem]" style={vineDown}>
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: footlit }} />
      <Lamp />
      <span aria-hidden className="absolute inset-y-0 right-0 w-[3px] bg-linear-to-r from-transparent to-black/50" />
    </div>
  )
}

// A soft warm pool that slides across the carving with the mouse (the parallax
// hook moves every [data-lamp]).
function Lamp() {
  return (
    <span
      aria-hidden
      data-lamp
      className="pointer-events-none absolute inset-y-0 -left-[150%] w-[400%] bg-radial-[ellipse_22%_120%_at_50%_100%] from-[#ffcf8a]/22 to-transparent"
    />
  )
}

function Carving({ viewBox, className, children, grooves }) {
  return (
    <svg viewBox={viewBox} aria-hidden className={cn('overflow-visible', className)}>
      {reliefLayers().map(({ key, dy, fill }) => (
        <g key={key} transform={`translate(0 ${dy})`} fill={fill}>
          {children}
        </g>
      ))}
      {grooves && (
        <g fill="none" stroke={RECESS} strokeWidth="1.1" strokeLinecap="round">
          {grooves}
        </g>
      )}
    </svg>
  )
}

// Gandabherunda, the two-headed bird of Karnataka, carved over a shield.
// One half is drawn and mirrored.
function Crest({ className, ...props }) {
  const half = (
    <>
      <path d="M60 36 C69 36 74 46 73 58 C72 70 66 78 60 84 Z" />
      <path d="M62 42 C63 29 70 20 78 17 C84 15 89 18 89 22 C89 25 86 27 82 26 C76 26 71 31 69 42 Z" />
      <circle cx="83" cy="19" r="6.5" />
      <path d="M88 15 C97 14 100 20 95 24 C94 22 92 21 89 21 Z" />
      <path d="M78 13 C76 7 79 2 84 1 C83 5 84 8 87 12 Z" />
      <path d="M70 46 C78 34 92 24 114 20 C109 25 110 28 116 30 C108 33 107 37 113 41 C104 43 101 47 106 52 C95 52 86 55 72 61 Z" />
      <path d="M60 82 C66 86 72 91 77 96 L60 93 Z" />
    </>
  )
  const grooves = (
    <>
      <path d="M78 50 C88 42 98 34 110 27" />
      <path d="M76 56 C88 49 98 45 108 42" />
      <circle cx="84.5" cy="18" r="1.3" fill={RECESS} stroke="none" />
    </>
  )

  return (
    <div {...props} className={className}>
      <svg viewBox="0 0 120 100" aria-hidden className="absolute inset-0 overflow-visible">
        <path
          d="M60 4 C80 4 95 12 102 26 L98 70 C90 84 76 92 60 97 C44 92 30 84 22 70 L18 26 C25 12 40 4 60 4 Z"
          fill={RECESS}
          stroke="#e8bf85"
          strokeOpacity=".5"
          strokeWidth="2"
        />
      </svg>
      <Carving viewBox="0 0 120 100" className="relative block w-full" grooves={<>{grooves}<g transform="translate(120 0) scale(-1 1)">{grooves}</g></>}>
        {half}
        <g transform="translate(120 0) scale(-1 1)">{half}</g>
      </Carving>
    </div>
  )
}

function Parrot({ className }) {
  return (
    <Carving viewBox="0 0 40 36" className={className} grooves={<path d="M13 18 C18 20 22 24 24 28" />}>
      <path d="M8 30 C6 20 11 11 20 9 C27 8 31 12 31 16 C31 24 25 31 16 33 Z" />
      <circle cx="27" cy="11" r="6" />
      <path d="M32 8 C37 8 39 13 35 16 C34 14 33 13 31 13 Z" />
      <path d="M10 29 L1 36 L4 36 L14 31 Z" />
    </Carving>
  )
}

// An elephant in a caparison at the foot of each side, facing outward.
function Elephant({ className }) {
  return (
    <Carving
      viewBox="0 0 100 72"
      className={className}
      grooves={
        <>
          <path d="M34 22 C42 22 46 30 44 40 C38 42 33 36 32 28" />
          <path d="M50 16 C54 34 70 36 80 20" />
          <path d="M53 26 L57 30 M62 31 L64 34 M71 30 L72 33" />
          <circle cx="27" cy="28" r="1.4" fill={RECESS} stroke="none" />
        </>
      }
    >
      <path d="M30 22 C40 14 64 12 80 18 C92 22 96 32 95 42 L95 66 L86 66 L85 50 L78 50 L77 66 L68 66 L67 50 C58 52 50 52 44 50 L44 66 L35 66 L34 48 C30 44 28 38 28 32 Z" />
      <path d="M36 18 C28 16 18 20 16 30 C15 36 18 42 22 44 C20 50 17 56 16 62 C16 66 20 67 22 64 C24 58 27 52 30 46 C34 44 38 38 38 30 Z" />
      <path d="M24 43 C20 47 16 48 12 46 L13 44 C17 45 20 44 23 41 Z" />
      <rect x="10" y="66" width="90" height="6" rx="1.5" />
    </Carving>
  )
}

// The short drape across the top: velvet with a scalloped hem, a gold braid
// and a row of embroidered lotuses.
const LOTUS = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><g fill="#e2b650"><path d="M20 17 C16 13 16 7 20 2 C24 7 24 13 20 17 Z"/><path d="M20 17 C14 15 10 11 8 6 C14 7 18 11 20 17 Z"/><path d="M20 17 C26 15 30 11 32 6 C26 7 22 11 20 17 Z"/><rect x="12" y="17" width="16" height="1.6" rx=".8"/></g></svg>'
)}")`

function Valance() {
  return (
    <div
      aria-hidden
      data-fade
      className="absolute inset-x-0 top-0 z-10 h-[1.3rem] lg:h-[2.5rem]"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(0,0,0,.35), transparent 45%, rgba(255,170,100,.12)), repeating-linear-gradient(90deg, #7a0a1c 0, #a80e26 6px, #c81d34 9px, #95102a 14px, #7a0a1c 18px)',
        maskImage:
          'radial-gradient(circle at 50% 0, #000 0.62rem, transparent 0.66rem), linear-gradient(#000, #000)',
        maskSize: '1.3rem 0.65rem, 100% calc(100% - 0.65rem)',
        maskPosition: '0 100%, 0 0',
        maskRepeat: 'repeat-x, no-repeat',
      }}
    >
      <span className="absolute inset-x-0 top-[0.3rem] hidden h-[0.85rem] lg:block" style={{ backgroundImage: LOTUS, backgroundSize: '1.6rem 100%' }} />
      <span className="absolute inset-x-0 bottom-[0.8rem] h-[3px] bg-[repeating-linear-gradient(90deg,#f2cf6a_0_3px,#a87a24_3px_5px)] lg:bottom-[0.9rem]" />
    </div>
  )
}

// A curtain drawn aside and tied back: full at the top and the hem, pinched
// at the tie-back. Folds are vertical bands, darker in the dips.
const GATHER = [
  [0, 0], [100, 0], [97, 18], [86, 36], [62, 54], [48, 60], [58, 68], [80, 82], [96, 94], [100, 100], [0, 100],
]
const gather = (flip) => `polygon(${GATHER.map(([x, y]) => `${flip ? 100 - x : x}% ${y}%`).join(', ')})`

function Curtain({ side }) {
  const left = side === 'left'
  return (
    <div
      aria-hidden
      data-fade
      className={cn('relative hidden w-[4.2vw] shrink-0 origin-top motion-safe:animate-curtain-sway lg:block', !left && '[animation-delay:-4.5s]')}
    >
      <div
        className="absolute inset-0"
        style={{
          clipPath: gather(!left),
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,.5), transparent 28%, transparent 72%, rgba(255,170,90,.22)), repeating-linear-gradient(90deg, #7a0a1c 0, #a50d25 30%, #d8283f 42%, #9c0c24 58%, #7a0a1c 100%)',
          backgroundSize: '100% 100%, 0.9rem 100%',
        }}
      />
      {/* Gold fringe along the hem */}
      <div
        className="absolute inset-x-0 bottom-0 h-2"
        style={{ clipPath: gather(!left), backgroundImage: 'repeating-linear-gradient(90deg, #e9c05a 0 1px, #9a6e20 1px 3px)' }}
      />
      {/* Tie-back: a gold rope and tassel at the pinch */}
      <span className={cn('absolute top-[57%] h-2 w-[70%] rounded-full bg-linear-to-b from-[#f4d27a] to-[#9a6e20] shadow-[0_2px_3px_rgba(0,0,0,.6)]', left ? 'left-0' : 'right-0')} />
      <span className={cn('absolute top-[59%] h-5 w-1.5 rounded-b-full bg-[repeating-linear-gradient(90deg,#f0c860_0_1px,#9a6e20_1px_2px)]', left ? 'left-[62%]' : 'right-[62%]')} />
    </div>
  )
}

// Wooden stage apron with a row of footlights along its edge. They throw a
// warm glow up onto the hem of the curtains and the foot of the screen.
function StageFloor() {
  return (
    <div aria-hidden data-fade className="relative h-[0.8rem] lg:h-[1.5rem]">
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-16 bg-linear-to-t from-[#ffbf70]/18 to-transparent" />
      <div
        className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,210,150,.35)]"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3.5rem), linear-gradient(180deg, #5a3a22, #2e1c10)' }}
      />
      <div
        className="absolute inset-x-[3%] -top-1 h-2.5 lg:h-3"
        style={{
          backgroundImage: 'radial-gradient(ellipse 40% 60% at 50% 100%, #fff4d0 0 25%, #ffc466 45%, rgba(255,170,80,.35) 70%, transparent 100%)',
          backgroundSize: '2.2rem 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />
    </div>
  )
}
