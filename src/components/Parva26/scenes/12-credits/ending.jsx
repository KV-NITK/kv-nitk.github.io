import { En } from '@p26/lib/prefs'
import { MEAL } from '@p26/content'
import { Flourish } from '@p26/ui/flourish'
import { Coupon } from '@p26/ui/coupon'
import { velvet } from '@p26/styles/materials'
import { cn } from '@/lib/utils'

// The end card: ಶುಭಂ, hand-lettered with a flourish, cream on black with a
// warm glow, and ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ under it.
export function Shubham() {
  return (
    <div className="relative text-center">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-0 h-[140%] w-[160%] -translate-1/2 bg-radial from-[#ffcf80]/12 to-transparent to-65%" />
      <Flourish className="mx-auto w-24 rotate-[135deg] opacity-80" />
      <p lang="kn" className="relative font-kn-card text-[clamp(6rem,24vw,14rem)] leading-none text-[#f6e3b8] [text-shadow:0_0_14px_rgba(255,214,140,.55),0_0_40px_rgba(255,190,100,.25)]">
        ಶುಭಂ
      </p>
      <p lang="kn" className="relative mt-4 font-kn-display text-2xl font-semibold text-[#f1dfc0]/90 [text-shadow:0_0_8px_rgba(241,223,192,.35)] sm:text-3xl">
        ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ
      </p>
      <Flourish className="mx-auto mt-4 w-24 -rotate-45 opacity-80" />
    </div>
  )
}

// One half of the stage curtain, drawing across the screen at the end. Its
// starting place is set by the animation alone: a transform in the style
// as well would be added to it.
export function Curtain({ ref, side }) {
  const left = side === 'left'
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('absolute inset-y-0 z-10 w-[51%]', left ? 'left-0' : 'right-0')}
      style={{
        ...velvet,
        backgroundImage: `linear-gradient(${left ? '90deg' : '270deg'}, rgba(0,0,0,.45), transparent 30%, rgba(255,120,140,.06) 60%, rgba(0,0,0,.35)), ${velvet.backgroundImage}`,
      }}
    >
      {/* A gold fringe along the bottom */}
      <span className="absolute inset-x-0 bottom-0 h-3" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #c9a052 0 3px, #7a5a1c 3px 5px)' }} />
    </div>
  )
}

// Below the screen, the stage front: watch again, or one last Book.
export function StageFront({ reduced, subtitles }) {
  return (
    <div className="relative bg-theatre px-4 pb-16 pt-10 text-center">
      {reduced && (
        <div aria-hidden className="mx-auto -mt-10 mb-8 h-24 max-w-5xl" style={velvet} />
      )}
      <div aria-hidden className="mx-auto mb-10 h-4 max-w-5xl rounded-[2px]" style={{ backgroundImage: 'linear-gradient(180deg, #8a5a30, #4a2c14)' }} />
      <div className="flex flex-wrap items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0 })}
          className="min-h-12 -rotate-1 rounded-[4px] border-[3px] border-[#f1dfc0] bg-kumkuma px-6 py-2 text-[#fff4dc] shadow-[0_6px_12px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina"
        >
          <span lang="kn" className="block font-kn-display text-xl font-bold leading-tight">
            ಮತ್ತೊಮ್ಮೆ ನೋಡಿ
          </span>
          <En className="block font-poster text-base tracking-[0.2em]">Watch again</En>
        </button>
        <Coupon price={MEAL.price} href="#interval" subtitles={subtitles} className="rotate-[2deg]" />
      </div>
    </div>
  )
}
