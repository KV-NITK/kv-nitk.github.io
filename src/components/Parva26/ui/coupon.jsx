import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

// Perforated edge of a coupon: half-circle bites along the left side.
export const PERFORATED = {
  WebkitMask: 'radial-gradient(circle at 0 50%, transparent 0.28rem, #000 0.3rem) 0 0 / 100% 0.85rem repeat-y',
  mask: 'radial-gradient(circle at 0 50%, transparent 0.28rem, #000 0.3rem) 0 0 / 100% 0.85rem repeat-y',
}

// The yellow paper coupon that is the Book button: arishina paper with a
// perforated stub; it slides a little further out on hover. It pokes out of
// the booking window (Scene 8), waits at the bottom of a phone's screen,
// and comes back on the stage front at the end (Scene 12).
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
