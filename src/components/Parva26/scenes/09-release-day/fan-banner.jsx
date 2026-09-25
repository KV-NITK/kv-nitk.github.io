import { En } from '@p26/lib/prefs'
import { HOOMALE } from '@p26/content'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

const fmt = (n) => n.toLocaleString('en-IN')

// The fan-club banner between two bamboo poles: the shared count, your own,
// the milestone flag, and the basket you throw from.
// On a phone the banner sits at the top and the basket at the bottom of the
// street, in thumb reach; from a tablet up the basket hangs under the banner.
export function FanBanner({ shared, mine, flag, done, subtitles, onThrowStart, onThrowEnd, onThrowOnce }) {
  return (
    <div className="contents sm:absolute sm:right-[5%] sm:top-[33%] sm:z-30 sm:flex sm:w-[min(24rem,38%)] sm:flex-col sm:items-end">
      <div className="absolute inset-x-3 top-[4.6rem] z-30 px-3 sm:static sm:w-full sm:px-5">
        {/* Poles */}
        <span aria-hidden className="absolute -top-4 bottom-[-60vh] left-0 hidden w-2.5 rounded-full sm:block" style={{ backgroundImage: 'linear-gradient(90deg, #8a7040, #d8bd7c 45%, #9a7e46)' }} />
        <span aria-hidden className="absolute -top-4 bottom-[-60vh] right-0 hidden w-2.5 rounded-full sm:block" style={{ backgroundImage: 'linear-gradient(90deg, #8a7040, #d8bd7c 45%, #9a7e46)' }} />
        <div
          className="relative rounded-[2px] border-y-[6px] border-kumkuma bg-[#f6eedb] px-3 pb-3 pt-2 text-center text-[#1d1a17] shadow-[0_10px_20px_rgba(0,0,0,.45)] sm:px-4"
          style={{ ...paper, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 75% 97%, 50% 100%, 25% 97%, 0 100%)' }}
        >
          <p lang="kn" className="font-kn-display text-sm font-bold leading-tight text-kumkuma">
            {HOOMALE.hero.kn} ಅಭಿಮಾನಿಗಳ ಸಂಘ
          </p>
          <En as="p" className="font-poster text-xs leading-tight tracking-[0.2em] text-kumkuma/80">{HOOMALE.hero.en} fans’ association</En>
          <p className="flex items-baseline justify-center gap-3 sm:block">
            <span lang="kn" className="font-kn-display text-2xl font-extrabold leading-tight sm:block sm:text-4xl">
              ಹೂಮಳೆ
            </span>
            <span className="font-kn-display text-3xl font-extrabold leading-none text-kumkuma sm:mt-1 sm:block sm:text-5xl" aria-live="polite">
              {fmt(shared)}
            </span>
          </p>
          <p className={cn('text-sm font-semibold leading-tight sm:text-base', !subtitles && 'sr-only')}>flowers so far</p>
          <p className="mt-1 text-base font-semibold leading-tight">
            <span lang="kn" className="font-kn-display">
              ನಿಮ್ಮ ಹೂವು
            </span>
            <En> · Your flowers</En>: <span className="font-bold">{fmt(mine)}</span>
          </p>
          {/* On a phone the thank-you goes on the banner, clear of the hero */}
          {done && (
            <p className="-mx-3 mt-2 bg-kumkuma px-2 py-1 text-[#fff4dc] sm:hidden">
              <span lang="kn" className="font-kn-display text-base font-bold">
                ಧನ್ಯವಾದ ಅಭಿಮಾನಿಗಳೇ!
              </span>
              <En className="block text-sm font-semibold">10,000 flowers! Thank you, fans</En>
            </p>
          )}
          {flag && (
            <span className="absolute -right-2 -top-3 rotate-[8deg] bg-kumkuma px-2 py-0.5 font-kn-display text-lg font-extrabold text-[#fff4dc] shadow-[0_3px_6px_rgba(0,0,0,.4)] motion-safe:animate-tag-swing">
              {fmt(flag)}!
            </span>
          )}
        </div>
      </div>

      {/* The basket: tap to throw, hold for a stream */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          onThrowStart()
        }}
        onPointerUp={onThrowEnd}
        onPointerCancel={onThrowEnd}
        onClick={(e) => e.detail === 0 && onThrowOnce()}
        data-en="Throw flowers (hold for more)"
        className="group absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 touch-none select-none items-end gap-3 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina sm:static sm:mr-6 sm:mt-5 sm:translate-x-0"
      >
        <Basket />
        <span className="mb-1 whitespace-nowrap rounded-[3px] bg-arishina px-3 py-2 text-left text-theatre shadow-[0_4px_8px_rgba(0,0,0,.45)] transition-transform group-active:translate-y-0.5">
          <span lang="kn" className="block font-kn-display text-xl font-extrabold leading-none">
            ಹೂ ಎಸೆಯಿರಿ
          </span>
          <En className="mt-0.5 block font-poster text-base leading-none tracking-wider">Throw flowers</En>
        </span>
      </button>
    </div>
  )
}

// A woven bamboo basket heaped with marigold, rose and jasmine.
function Basket() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden className="w-16 drop-shadow-[0_6px_6px_rgba(0,0,0,.5)] transition-transform group-hover:-rotate-3 group-active:scale-95 sm:w-20">
      {[
        [18, 22, '#f08a1c'],
        [30, 16, '#f7c21e'],
        [42, 14, '#f08a1c'],
        [54, 17, '#c8102e'],
        [62, 23, '#f7c21e'],
        [24, 26, '#fbf8ef'],
        [36, 22, '#e86a10'],
        [48, 22, '#f7c21e'],
        [58, 27, '#f08a1c'],
        [40, 27, '#fbf8ef'],
      ].map(([cx, cy, fill]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="7" fill={fill} stroke="#7a3a08" strokeWidth="1" />
      ))}
      <path d="M8 28 L72 28 L64 60 L16 60 Z" fill="#c9a060" stroke="#6b4a22" strokeWidth="2" />
      {[36, 44, 52].map((y) => (
        <path key={y} d={`M${10 + (y - 28) / 4} ${y} L${70 - (y - 28) / 4} ${y}`} stroke="#8a6a36" strokeWidth="2" />
      ))}
      {[20, 30, 40, 50, 60].map((x) => (
        <path key={x} d={`M${x} 28 L${40 + (x - 40) * 0.75} 60`} stroke="#8a6a36" strokeWidth="1.6" />
      ))}
      <path d="M6 28 L74 28" stroke="#6b4a22" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
