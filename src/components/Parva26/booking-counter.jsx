import { usePrefs } from './prefs'
import { MEAL, eventDay } from './data'
import { brass } from './fx/materials'
import { paper } from './fx/textures'
import { cn } from '../../lib/utils'

// The lobby's advance booking window (Scene 8). The Bhoori Bhojana coupon is
// sold here like a film ticket for the meal day: a painted board over a
// barred window, a warm-lit booking cabin behind the bars, and the coupon
// itself pushed out through the half-moon hole as the Book button, the
// brightest thing in the scene. A slate gives the price; a tin plate on the
// bars counts the coupons left; when they run out the HOUSEFULL board goes
// up across the window.

// Perforated edge of a coupon: half-circle bites along the left side.
export const PERFORATED = {
  WebkitMask: 'radial-gradient(circle at 0 50%, transparent 0.28rem, #000 0.3rem) 0 0 / 100% 0.85rem repeat-y',
  mask: 'radial-gradient(circle at 0 50%, transparent 0.28rem, #000 0.3rem) 0 0 / 100% 0.85rem repeat-y',
}

export function BookingCounter({ className }) {
  const { subtitles } = usePrefs()
  const left = Math.max(0, MEAL.coupons - MEAL.sold)
  const full = left === 0
  const few = !full && left / MEAL.coupons < 0.15
  const day = eventDay(MEAL.day)

  return (
    <div id="bhoori-bhojana" className={cn('relative flex scroll-mt-20 flex-col items-center', className)}>
      <BoardSign subtitles={subtitles} />

      {/* The window in the wall */}
      <div className="relative mt-4 w-full max-w-[21rem] rounded-[4px] p-3 shadow-[0_1rem_1.4rem_-0.6rem_rgba(20,30,20,.6)]" style={{ backgroundImage: 'linear-gradient(180deg, #6a4424, #4a2c14)' }}>
        <div className="relative aspect-[5/3.4] overflow-hidden rounded-[2px] shadow-[inset_0_0.6rem_1rem_rgba(0,0,0,.55)]">
          <Cabin />
          <Grille />
          {!full && <LeftPlate left={left} subtitles={subtitles} few={few} />}
          {full && <HousefullBoard subtitles={subtitles} />}
        </div>
      </div>

      {/* Granite ledge with the hole for money and tickets */}
      <div className="relative -mt-1 h-8 w-full max-w-[23rem] rounded-[3px] shadow-[0_0.5rem_0.8rem_-0.3rem_rgba(20,30,20,.6)]" style={GRANITE}>
        <span aria-hidden className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-full bg-[#1a120c] shadow-[inset_0_-3px_6px_rgba(0,0,0,.7)]" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 rounded-b-[3px] bg-black/25" />
      </div>

      <div className="relative -mt-4 flex w-full max-w-[23rem] items-start justify-center gap-4">
        {full ? (
          <p className="mt-6 text-center font-kn-display text-lg font-bold text-[#2b3a2e]">
            <span lang="kn">ಕೂಪನ್‌ಗಳು ಮುಗಿದಿವೆ</span>
            {subtitles && <span className="block text-base font-semibold">All coupons are gone</span>}
          </p>
        ) : (
          <Coupon data-coupon price={MEAL.price} href={MEAL.bookLink} subtitles={subtitles} />
        )}
      </div>

      <Slate day={day} subtitles={subtitles} />
    </div>
  )
}

const GRANITE = {
  backgroundImage:
    'radial-gradient(circle at 20% 30%, rgba(255,255,255,.18) 0 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, rgba(0,0,0,.35) 0 1.2px, transparent 1.8px), radial-gradient(circle at 45% 80%, rgba(210,190,170,.25) 0 1px, transparent 1.6px), linear-gradient(180deg, #5b5550, #3a3531)',
  backgroundSize: '9px 9px, 13px 11px, 7px 10px, auto',
}

// "ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆ · Advance Booking", painted on an enamel board.
function BoardSign({ subtitles }) {
  return (
    <p
      className="relative rounded-[3px] border-[3px] border-[#1d1a17] bg-[#f3ead5] px-5 py-2 text-center shadow-[0_0.4rem_0.6rem_rgba(20,30,20,.45),inset_0_0_0_2px_#f3ead5,inset_0_0_0_3px_#c8102e]"
      style={paper}
    >
      {['left-1 top-1', 'right-1 top-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((at) => (
        <span key={at} aria-hidden className={cn('absolute size-1.5 rounded-full shadow-[0_1px_1px_rgba(0,0,0,.5)]', at)} style={brass} />
      ))}
      <span lang="kn" className="block font-kn-display text-[1.7rem] font-extrabold leading-tight text-kumkuma">
        ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆ
      </span>
      <span className={cn('block font-poster text-xl leading-none tracking-[0.3em] text-[#1d1a17]', !subtitles && 'sr-only')}>Advance booking</span>
    </p>
  )
}

// The booking cabin behind the bars: warm bulb, pigeon-hole rack with
// bundles of coupons, a rubber stamp and its pad on the desk.
function Cabin() {
  return (
    <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 70% 80% at 50% 12%, #f5c877, #a8672c 45%, #4b2a12 90%)' }}>
      <div
        className="absolute inset-x-[12%] top-[16%] h-[42%] rounded-[2px] shadow-[0_4px_8px_rgba(0,0,0,.4)]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #4a2c14 0 3px, transparent 3px 20%), repeating-linear-gradient(0deg, #4a2c14 0 3px, transparent 3px 33.3%), linear-gradient(180deg, #2c1a0c, #3b2412)',
        }}
      >
        {[
          ['left-[4%] top-[12%]', '#f2c12e'],
          ['left-[24%] top-[45%]', '#e9e2cf'],
          ['left-[44%] top-[12%]', '#f2c12e'],
          ['left-[64%] top-[78%]', '#c8102e'],
          ['left-[84%] top-[45%]', '#f2c12e'],
          ['left-[24%] top-[78%]', '#9fc4a0'],
        ].map(([at, color]) => (
          <span key={at} className={cn('absolute h-[18%] w-[12%] rounded-[1px]', at)} style={{ backgroundColor: color, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.25)' }} />
        ))}
      </div>
      {/* Bulb on its flex */}
      <span className="absolute left-1/2 top-0 h-[10%] w-px bg-black/60" />
      <span className="absolute left-1/2 top-[9%] size-4 -translate-x-1/2 rounded-full bg-[#fff6d6] shadow-[0_0_14px_6px_rgba(255,210,120,.75)]" />
      {/* Desk, stamp and pad */}
      <span className="absolute inset-x-0 bottom-0 h-[26%]" style={{ backgroundImage: 'linear-gradient(180deg, #6b4020, #3e230f)' }} />
      <span className="absolute bottom-[12%] left-[16%] h-[7%] w-[16%] rounded-[2px] bg-[#1f2f5a] shadow-[0_2px_2px_rgba(0,0,0,.4)]" />
      <span className="absolute bottom-[16%] left-[36%] h-[12%] w-[5%] rounded-t-full bg-[#2a1a0c]" />
    </div>
  )
}

// Iron bars, with the half-moon opening at the bottom.
function Grille() {
  const hole = 'radial-gradient(circle at 50% 100%, transparent 2.9rem, #000 2.95rem)'
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(180deg, transparent 47%, #2b2f2c 47% 50%, rgba(255,255,255,.18) 50% 50.6%, transparent 50.6%), repeating-linear-gradient(90deg, transparent 0 1.05rem, #232725 1.05rem 1.25rem, rgba(255,255,255,.22) 1.25rem 1.32rem, transparent 1.32rem 1.6rem)',
        WebkitMaskImage: hole,
        maskImage: hole,
      }}
    />
  )
}

// A tin plate wired to the bars: coupons left, in normal digits (A5).
function LeftPlate({ left, few, subtitles }) {
  return (
    <div className="absolute right-[5%] top-[7%] rotate-[2deg] rounded-[3px] bg-[#f3ead5] px-2.5 py-1 text-center text-[#1d1a17] shadow-[0_3px_5px_rgba(0,0,0,.45)]" style={paper}>
      <p className="font-kn-display text-base font-bold leading-tight">
        <span lang="kn">ಇನ್ನು {left} ಕೂಪನ್</span>
      </p>
      {subtitles && <p className="text-[0.95rem] font-semibold leading-tight">{left} coupons left</p>}
      {few && (
        <p className="absolute -bottom-7 -left-4 rotate-[-6deg] bg-[#fdf6c9] px-2 py-0.5 font-kn-display text-base font-bold text-kumkuma shadow-[0_2px_3px_rgba(0,0,0,.35)]">
          <span lang="kn">ಕೆಲವೇ ಕೂಪನ್</span>
          {subtitles && <span className="font-kn-body"> · Few left</span>}
        </p>
      )}
    </div>
  )
}

// The board every theatre hangs up when the show is sold out.
function HousefullBoard({ subtitles }) {
  return (
    <div className="absolute inset-x-[8%] top-[26%] rotate-[-3deg]">
      <span aria-hidden className="absolute -top-8 left-[12%] h-9 w-px bg-[#3a3a3a]" />
      <span aria-hidden className="absolute -top-8 right-[12%] h-9 w-px bg-[#3a3a3a]" />
      <p className="rounded-[3px] border-[3px] border-[#fff4dc] bg-kumkuma px-3 py-2 text-center text-[#fff4dc] shadow-[0_6px_10px_rgba(0,0,0,.5)] outline outline-2 outline-kumkuma">
        <span lang="kn" className="block font-kn-display text-3xl font-extrabold leading-none">
          ಹೌಸ್‌ಫುಲ್
        </span>
        {subtitles && <span className="block font-poster text-2xl leading-none tracking-[0.25em]">Housefull</span>}
      </p>
    </div>
  )
}

// The coupon, pushed out through the hole: the Book button. Arishina paper
// with a perforated stub; it slides a little further out on hover. The
// phone's sticky Book button is a second copy of it.
export function Coupon({ price, href, subtitles, className, ...props }) {
  return (
    <a
      href={href}
      data-en="Book a Bhoori Bhojana coupon"
      className={cn(
        'group relative z-10 block rotate-[-2deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(40,20,5,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-kumkuma',
        className
      )}
      {...props}
    >
      {/* The mask would clip a box shadow, so the shadow is a drop shadow on
          the (small) link instead */}
      <span
        className="relative flex min-h-16 items-stretch bg-arishina text-theatre transition-transform duration-200 group-hover:translate-y-1.5 group-focus-visible:translate-y-1.5"
        style={PERFORATED}
      >
        <span className="flex flex-col justify-center border-r-2 border-dashed border-theatre/35 py-2 pl-4 pr-3 text-center">
          <span className="font-poster text-[0.8rem] leading-none tracking-widest text-theatre/70">No.</span>
          <span className="font-poster text-xl leading-none">017</span>
        </span>
        <span className="flex flex-col justify-center px-4 py-2">
          <span lang="kn" className="font-kn-display text-2xl font-extrabold leading-none">
            ಬುಕ್ ಮಾಡಿ
          </span>
          <span className="mt-1 font-kn-body text-base font-bold leading-none">
            {subtitles ? 'Book · ' : ''}₹{price}
          </span>
        </span>
        <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
      </span>
    </a>
  )
}

// Chalk on a slate propped on the ledge: the price per coupon, and the day.
function Slate({ day, subtitles }) {
  const chalk = 'text-[#f4f1e6] [text-shadow:0_0_1px_rgba(244,241,230,.9),0_0_6px_rgba(244,241,230,.25)]'
  return (
    <div className="relative mt-5 w-full max-w-[17rem] rotate-[1.5deg] rounded-[4px] p-2 shadow-[0_0.6rem_1rem_-0.3rem_rgba(20,30,20,.55)]" style={{ backgroundImage: 'linear-gradient(180deg, #8a5a30, #5a3419)' }}>
      <div
        className="rounded-[2px] px-4 py-3 text-center"
        style={{ backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.07), transparent 60%), linear-gradient(180deg, #2f3531, #232826)' }}
      >
        <p className={cn('font-kn-display text-lg font-semibold leading-tight', chalk)}>
          <span lang="kn">ಒಂದು ಕೂಪನ್</span>
          {subtitles && <span className="font-kn-body text-base"> · one coupon</span>}
        </p>
        <p className={cn('font-kn-display text-5xl font-bold leading-none', chalk)}>₹{MEAL.price}</p>
        <p className={cn('mt-1 font-kn-display text-base font-semibold leading-snug', chalk)}>
          <span lang="kn">
            {day.kn} · {MEAL.time.kn}
          </span>
          {subtitles && (
            <span className="block font-kn-body">
              {day.en}, {MEAL.time.en}, one meal
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
