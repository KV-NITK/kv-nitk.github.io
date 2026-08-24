import { cn } from '../../lib/utils'

/* A simplified antique flintlock silhouette, used purely as ornament. */
function Flintlock({ className }) {
  return (
    <svg
      viewBox="0 0 64 34"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11 10h45l4 2.5-4 2.5H11z" />
      <path d="M16 15h15l-1.5 5.5H17.5z" />
      <path d="M23 10c.8-3.2 3.6-4.2 5.6-2.2L26.4 10z" />
      <path d="M14.5 15c-1 6.4-4.4 11.8-9.5 16l6.4 2.2c5.2-4.4 8.4-10.6 9.4-18.2z" />
      <path
        d="M20.5 20.5c-.2 4 2.6 6.2 6 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Crossed flintlocks with a brass medallion, as on the film's sign art. */
export function CrossedFlintlocks({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex items-center justify-center text-primary',
        className,
      )}
    >
      <Flintlock className="w-full rotate-[-28deg] text-current/80" />
      <Flintlock className="absolute w-full -scale-x-100 rotate-28 text-current/60" />
      <span className="absolute size-2.5 rounded-full bg-current shadow-[0_0_10px_2px_oklch(0.79_0.135_79/45%)]" />
    </span>
  )
}

/** A row of brass rivets, like the ones punched along a lorry board. */
export function Rivets({
  count = 12,
  className,
  curved = false,
  bowDepth = 14, // px the corner dots drop relative to the center, tune to your arch
}) {
  if (!curved) {
    return (
      <span
        aria-hidden="true"
        className={cn('flex items-center justify-between', className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-primary/70 shadow-[inset_0_-1px_1px_oklch(0_0_0/60%)]"
          />
        ))}
      </span>
    )
  }

  return (
    <span aria-hidden="true" className={cn('relative block h-4', className)}>
      {Array.from({ length: count }).map((_, i) => {
        const x = (i / (count - 1)) * 2 - 1 // -1 (left) to 1 (right)
        const norm = Math.min(Math.abs(x), 1)
        const yOffset = bowDepth * (1 - Math.sqrt(1 - norm * norm))

        return (
          <span
            key={i}
            style={{ left: `${((x + 1) / 2) * 100}%`, top: `${yOffset}px` }}
            className="absolute size-1.5 -translate-x-1/2 rounded-full bg-primary/70 shadow-[inset_0_-1px_1px_oklch(0_0_0/60%)]"
          />
        )
      })}
    </span>
  )
}

/** Painted diamond ribbon used as a section divider. */
export function DiamondBand({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'h-4.5 w-full border-y border-primary/30 bg-diamond-band opacity-70',
        className,
      )}
    />
  )
}

/**
 * Curved wooden signboard with gold signwriting, flanked by crossed
 * flintlocks — the centrepiece lockup.
 */
export function ArchSign({ eyebrow, children, footnote, className }) {
  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <CrossedFlintlocks className="absolute -top-4 left-1/2 w-20 -translate-x-1/2" />

      <div className="relative mt-7 rounded-t-[48%_36%] rounded-b-sm border-2 border-primary/55 bg-wood px-8 pt-9 pb-6 shadow-[0_18px_40px_-12px_oklch(0_0_0/85%)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1.5 rounded-t-[47%_34%] rounded-b-sm border border-primary/25"
        />

        <Rivets count={9} curved bowDepth={28} className="absolute inset-x-8 top-3" />

        <div className="relative flex flex-col items-center gap-2 text-center">
          {eyebrow ? (
            <span className="font-serif text-[0.6rem] tracking-[0.32em] text-primary/75 uppercase">
              {eyebrow}
            </span>
          ) : null}
          {children}
        </div>

        <Rivets count={9} className="absolute inset-x-8 bottom-3" />
      </div>

      {footnote ? (
        <div className="mx-auto -mt-px w-fit border-x-2 border-b-2 border-primary/45 bg-wood px-5 py-1.5">
          <span className="font-serif text-[0.62rem] tracking-[0.26em] text-primary/85 uppercase">
            {footnote}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/** Smaller carved plaque for section headings. */
export function Plaque({ eyebrow, title, className }) {
  return (
    <div className={cn('flex flex-col items-start gap-4', className)}>
      <div className="relative inline-flex items-center gap-3 rounded-sm border border-primary/45 bg-wood px-4 py-2">
        <CrossedFlintlocks className="w-10" />
        <span className="font-serif text-[0.62rem] tracking-[0.28em] text-primary uppercase">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-serif text-4xl leading-tight font-bold text-balance text-carved sm:text-5xl">
        {title}
      </h2>
    </div>
  )
}
