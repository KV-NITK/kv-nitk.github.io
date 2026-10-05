import { useEffect } from 'react'
import { En } from '@p26/lib/prefs'
import { CHARACTERS } from '@p26/market/world/characters'
import { MARKET } from '@p26/content'
import { paper } from '@p26/styles/textures'

// "Choose your role": the casting call you see before the market opens, and
// again when you change role. Each role is a paper ticket with the walker on
// it, who takes a few steps when you point at it. `onClose` is given only
// when there is a role to go back to.
export function CharacterPicker({ onPick, onClose }) {
  useEffect(() => {
    if (!onClose) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-pick"
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-theatre/95 px-4 pb-10 pt-24"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(200,16,46,.22), transparent 70%)' }}
    >
      <div className="w-full max-w-xl text-center">
        <En as="p" className="block font-poster text-[clamp(2.6rem,10vw,4.2rem)] leading-tight tracking-[0.15em] text-arishina [text-shadow:0.05em_0.05em_0_#7e1424]">
          {MARKET.title.en}
        </En>
        <p lang="kn" className="font-kn-card text-xl text-gandha/80">
          {MARKET.title.kn}
        </p>
        <h1 id="market-pick" className="mt-8 font-kn-display text-2xl font-bold text-gandha sm:text-3xl">
          <En className="block">{MARKET.choose.en}</En>
          <span lang="kn" className="block text-lg font-semibold text-gandha/75">{MARKET.choose.kn}</span>
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-8">
          {CHARACTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              autoFocus={i === 0}
              onClick={() => onPick(c.id)}
              data-en={`Walk the market as the ${c.en.toLowerCase()}`}
              className="group relative flex flex-col items-center rounded-sm bg-arishina px-3 pb-4 pt-5 text-theatre shadow-[0_0.8rem_1.2rem_rgba(0,0,0,.55)] transition-transform duration-200 hover:-translate-y-1.5 hover:-rotate-1 focus-visible:-translate-y-1.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-kumkuma motion-reduce:transition-none"
            >
              <span
                aria-hidden
                className="relative block aspect-[2/3] w-[min(34vw,9.5rem)] bg-no-repeat motion-safe:group-hover:animate-walk-cycle motion-safe:group-focus-visible:animate-walk-cycle"
                style={{ backgroundImage: `url(${c.sheet})`, backgroundSize: '400% 400%', backgroundPosition: '0% 0%' }}
              />
              <En className="mt-2 font-poster text-2xl leading-none tracking-widest">{c.en}</En>
              <span lang="kn" className="font-kn-display text-lg font-extrabold leading-tight">
                {c.kn}
              </span>
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm opacity-40 mix-blend-multiply" style={paper} />
            </button>
          ))}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-8 font-kn-body text-base font-semibold text-gandha/70 underline underline-offset-4 hover:text-gandha focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina"
          >
            <En>Back · </En>
            <span lang="kn" className="text-sm">ಹಿಂದಕ್ಕೆ</span>
          </button>
        )}
      </div>
    </div>
  )
}
