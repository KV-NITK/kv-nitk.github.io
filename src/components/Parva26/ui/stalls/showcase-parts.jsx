import { En } from '@p26/lib/prefs'
import { TEE } from '@p26/content'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// A paper tag on a string from the rod: the price, struck through when the
// early price is running.
export function PriceTag({ price, early }) {
  return (
    <div className="pointer-events-none absolute right-[5%] top-[7%] flex flex-col items-center">
      <span aria-hidden className="h-10 w-px bg-[#e9dcc0]/80" />
      <p className="rotate-[6deg] rounded-[3px] bg-[#f3ead5] px-2 pb-1.5 pt-2 text-center text-[#1d1a17] shadow-[0_3px_5px_rgba(0,0,0,.5)]" style={{ ...paper, clipPath: 'polygon(20% 0, 80% 0, 100% 16%, 100% 100%, 0 100%, 0 16%)' }}>
        {early ? (
          <>
            <span className="block font-kn-body text-base font-semibold leading-none line-through decoration-kumkuma decoration-2">₹{price}</span>
            <span className="block font-kn-display text-xl font-extrabold leading-tight text-kumkuma">₹{early}</span>
          </>
        ) : (
          <span className="block font-kn-display text-xl font-extrabold leading-tight">₹{price}</span>
        )}
      </p>
    </div>
  )
}

// A red paper flag: the First Day First Show price, and how many are left.
export function EarlyFlag({ subtitles }) {
  return (
    <p className="-rotate-2 bg-kumkuma px-3 py-1.5 text-[#fff4dc] shadow-[0_3px_5px_rgba(0,0,0,.4)]" style={{ clipPath: 'polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%)' }}>
      <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight">
        ಮೊದಲ ದಿನ ಮೊದಲ ಆಟ
      </span>
      <En className="block text-[0.8rem] font-semibold leading-tight">First Day First Show price</En>
      <span className="block text-base font-bold leading-tight">
        {TEE.earlySold}/{TEE.earlyQuota} <span lang="kn">ಮಾರಾಟ</span>
        {subtitles && ' · sold'}
      </span>
    </p>
  )
}

export function SizeChart({ subtitles }) {
  return (
    <div className="mt-3 rotate-[-0.6deg] bg-paper px-3 py-2 text-pen shadow-[0_3px_6px_rgba(0,0,0,.4)]" style={paper}>
      <table className="w-full text-center text-base">
        <caption className="text-left font-kn-display text-sm font-semibold">
          <span lang="kn">ಅಳತೆ (ಇಂಚುಗಳಲ್ಲಿ)</span>
          <En className="font-kn-body"> · Size, in inches</En>
        </caption>
        <thead>
          <tr className="font-kn-display text-sm">
            <th scope="col" className="font-semibold">
              {subtitles ? 'Size' : <span lang="kn">ಅಳತೆ</span>}
            </th>
            <th scope="col" className="font-semibold">
              {subtitles ? 'Chest' : <span lang="kn">ಎದೆ</span>}
            </th>
            <th scope="col" className="font-semibold">
              {subtitles ? 'Length' : <span lang="kn">ಉದ್ದ</span>}
            </th>
          </tr>
        </thead>
        <tbody className="font-semibold">
          {TEE.sizes.map((s) => (
            <tr key={s.id} className="border-t border-pen/15">
              <th scope="row" className="font-poster text-lg font-normal">
                {s.id}
              </th>
              <td>{s.chest}</td>
              <td>{s.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ClosedBoard({ subtitles }) {
  return (
    <p className="absolute inset-x-[10%] top-[38%] z-20 rotate-[-4deg] rounded-[3px] border-[3px] border-[#fff4dc] bg-kumkuma px-3 py-2 text-center text-[#fff4dc] shadow-[0_6px_10px_rgba(0,0,0,.5)]">
      <span lang="kn" className="block font-kn-display text-2xl font-extrabold leading-none">
        ಬುಕಿಂಗ್ ಮುಗಿದಿದೆ
      </span>
      <En className="block font-poster text-xl leading-none tracking-[0.2em]">Booking closed</En>
    </p>
  )
}

// The showcase's glass door, hinged on the left, with a brass handle. A tap
// swings it open toward you, with a small overshoot like a stiff hinge; with
// reduced motion it just fades.
export function GlassDoor({ open, onOpen, subtitles }) {
  const reduced = usePrefersReducedMotion()
  return (
    <button
      type="button"
      onClick={onOpen}
      inert={open}
      aria-label="Open the showcase"
      data-en="Open the showcase"
      className={cn(
        'group/door absolute inset-2.5 z-20 origin-left rounded-[2px] border-[5px] border-[#6e4322] shadow-[inset_0_0_0_1px_rgba(255,220,170,.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
        reduced ? 'transition-opacity duration-300' : 'transition-[rotate,opacity] duration-700 ease-[cubic-bezier(.3,1.35,.5,1)]',
        open ? cn('pointer-events-none', reduced ? 'opacity-0' : '[rotate:y_-100deg]') : 'hover:[rotate:y_-5deg]'
      )}
      style={{
        backgroundImage:
          'linear-gradient(120deg, transparent 12%, rgba(255,255,255,.16) 16%, transparent 22%, transparent 68%, rgba(255,255,255,.09) 71%, transparent 76%), linear-gradient(rgba(200,235,230,.06), rgba(200,235,230,.06))',
      }}
    >
      {/* Handle, and a small brass plate that says what to do */}
      <span aria-hidden className="absolute right-1 top-1/2 h-9 w-2.5 -translate-y-1/2 rounded-[3px] shadow-[0_2px_3px_rgba(0,0,0,.5)]" style={brass} />
      <span aria-hidden className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[2px] px-2 py-0.5 text-center shadow-[0_2px_3px_rgba(0,0,0,.45)]" style={brass}>
        <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight text-[#4a3208]">
          ತೆರೆಯಿರಿ
        </span>
        <En className="block font-poster text-xs leading-none tracking-widest text-[#4a3208]">Open</En>
      </span>
    </button>
  )
}
