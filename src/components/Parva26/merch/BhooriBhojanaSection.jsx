import { En, usePrefs } from '@p26/lib/prefs'
import { MEAL, MENU } from '@p26/content'
import { FeastPoster } from '@p26/ui/stalls/feast-poster'
import { cn } from '@/lib/utils'

// ── BhooriBhojanaSection ──────────────────────────────────────────────────────
//
// Self-contained visual card for the Bhoori Bhojana (ಭೂರಿ ಭೋಜನ) food-pass.
//
// Props
//   quantity    : number  – current pass count (controlled by parent)
//   onChange    : fn      – called with the next quantity
//   unitPrice   : number  – rupee price per pass (from catalog, not hardcoded)
//   maxQuantity : number  – upper bound from catalog (default 10 per spec §4)
//
// Spec references: §5.1 BhooriBhojanaSection, §4 Business Domain Logic Matrix
// Architectural invariant: NO direct cart or checkout state lives here.

export function BhooriBhojanaSection({ quantity, onChange, unitPrice, maxQuantity }) {
  const { subtitles } = usePrefs()

  const decrement = () => onChange(Math.max(0, quantity - 1))
  const increment = () => onChange(Math.min(maxQuantity, quantity + 1))

  const totalDisplay = unitPrice != null ? unitPrice * quantity : null

  return (
    <section aria-label="Bhoori Bhojana Food Pass" className="mb-10 flex flex-col items-center gap-6">

      {/* ── Section header — kumkuma tablet, same style as Parva Angadi banner ── */}
      <h2 className="w-fit rounded-[6px] bg-kumkuma px-8 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_0.5rem_1rem_rgba(0,0,0,.4)]">
        <span className={cn('block font-poster text-3xl leading-none tracking-[0.2em]', !subtitles && 'sr-only')}>
          Bhoori Bhojana · Food Pass
        </span>
        <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight text-arishina">
          ಭೂರಿ ಭೋಜನ · ಬಾಳೆ ಎಲೆ ಊಟ
        </span>
      </h2>

      {/* ── Two-column layout: poster left, booking panel right ── */}
      <div className="flex w-full flex-col items-center justify-center gap-10 px-4 xl:flex-row xl:items-start xl:gap-12">

        {/* ── Left: Banana-leaf FeastPoster with entrance animation ── */}
        <div className="w-full max-w-md shrink-0">
          {/*
            FeastPoster already contains the bilingual headings and the
            IntersectionObserver-driven dish-serving animation.
            It renders the date/venue banner at the bottom (from MEAL content).
          */}
          <FeastPoster />
        </div>

        {/* ── Right: menu slate + quantity counter + pricing ── */}
        <div className="flex w-full max-w-2xl shrink flex-col gap-6">

          {/* Menu slate — dark chalkboard panel listing each dish */}
          <div
            className="w-full rounded-[6px] p-1 shadow-[0_0.6rem_1rem_-0.3rem_rgba(20,30,20,.55)]"
            style={{ backgroundImage: 'linear-gradient(180deg, #6a4424, #4a2c14)' }}
          >
            <div
              className="rounded-[3px] px-5 py-4"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 80% 55% at 50% 10%, rgba(139,42,24,.45), transparent 70%), linear-gradient(180deg, #2f3531, #232826)',
              }}
            >
              <p className="mb-3 text-center font-poster text-base tracking-[0.2em] text-[#f6e3bc]">
                <En>MENU · </En>
                <span lang="kn" className="font-kn-display text-sm">ಇಂದಿನ ತಟ್ಟೆ</span>
              </p>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Today's menu">
                {MENU.map((item) => (
                  <li key={item.id} className="flex flex-col items-center text-center">
                    <span lang="kn" className="font-kn-display text-sm font-bold text-arishina">
                      {item.kn}
                    </span>
                    <span className="font-kn-body text-xs text-[#f6e3bc]/75">
                      {item.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing slate — quantity stepper + chalk-style total */}
          <div
            className="w-full rounded-[6px] p-1 shadow-[0_0.6rem_1rem_-0.3rem_rgba(20,30,20,.55)]"
            style={{ backgroundImage: 'linear-gradient(180deg, #6a4424, #4a2c14)' }}
          >
            <div
              className="flex flex-col items-center rounded-[3px] px-5 py-4 text-center"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 80% 55% at 50% 10%, rgba(139,42,24,.45), transparent 70%), linear-gradient(180deg, #2f3531, #232826)',
              }}
            >
              {/* Quantity row */}
              <div className="flex w-full items-center justify-between px-2 mb-4 mt-2">

                {/* Stepper — bounds [0, maxQuantity]; + greys out at limit (spec T6) */}
                <fieldset>
                  <legend className="mb-2 font-kn-display text-sm font-semibold text-[#f3ead5]">
                    <En>Quantity · </En>
                    <span lang="kn" className="font-kn-body text-sm">ಪ್ರಮಾಣ</span>
                  </legend>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={decrement}
                      disabled={quantity <= 0}
                      aria-label="Remove one food pass"
                      className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      −
                    </button>
                    <span
                      className="w-6 text-center font-poster text-2xl tabular-nums text-[#f3ead5]"
                      aria-live="polite"
                      aria-label={`${quantity} food pass${quantity !== 1 ? 'es' : ''}`}
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={increment}
                      disabled={quantity >= maxQuantity}
                      aria-label="Add one food pass"
                      /*
                       * Spec T6: disabled AND visually greyed when quantity === maxQuantity.
                       * `disabled:opacity-50` + `disabled:cursor-not-allowed` fulfils the
                       * "greys out" requirement without any alert banner.
                       */
                      className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </fieldset>

                {/* Chalk-style price display */}
                {unitPrice != null && (
                  <div className="flex flex-col items-end" aria-label={`Total: ₹${totalDisplay}`}>
                    <p
                      className="flex items-center text-[#f4f1e6]"
                      style={{ textShadow: '0 0 1px rgba(244,241,230,.9), 0 0 6px rgba(244,241,230,.25)' }}
                    >
                      <span className="mr-1 mt-1 font-sans text-5xl font-medium opacity-90">₹</span>
                      <span
                        className="text-6xl font-bold tracking-tight"
                        style={{ fontFamily: '"Chalkboard", "Chalkboard SE", "Comic Sans MS", "Akaya Kanadaka", cursive' }}
                      >
                        {totalDisplay}
                      </span>
                    </p>
                    <span className="mt-1 font-kn-body text-xs text-[#f6e3bc]/70">
                      {quantity > 0
                        ? `${quantity} × ₹${unitPrice}`
                        : `₹${unitPrice} per pass`}
                    </span>
                  </div>
                )}
              </div>

              {/* Date / venue reminder — mirrors spec §5.1 banner text */}
              <p className="mb-2 font-kn-display text-lg text-[#f6e3bc]">
                <span lang="kn" className="block">
                  {/* Uses MEAL content so it tracks the authoritative date/venue */}
                  ನವೆಂಬರ್ 1 · {MEAL.time.kn}
                </span>
                <span lang="kn" className="block text-base font-semibold leading-tight">
                  {MEAL.venue.kn}
                </span>
                <En className="mt-0.5 block font-kn-body text-sm opacity-90">
                  1 Nov, {MEAL.time.en} · {MEAL.venue.en}
                </En>
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
