import { useEffect } from 'react'
import { En } from '@p26/lib/prefs'
import { CHARACTERS } from '@p26/market/world/characters'
import { MARKET } from '@p26/content'
import { paper } from '@p26/styles/textures'

// The game's start screen, inside the game box: "Pick who walks", two paper
// tickets with a walker on each (who takes a few steps when you point at
// it), and what to do next. It comes back when you change role. Sizes follow
// the box (cq units), so it fits a phone's box and a laptop's alike.
// `onClose` is given only when there is a role to go back to.
export function CharacterPicker({ onPick, onClose }) {
  useEffect(() => {
    if (!onClose) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="group"
      aria-labelledby="market-pick"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto bg-theatre/92 px-4 py-[4cqh] text-center"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(200,16,46,.22), transparent 70%)' }}
    >
      <h3 id="market-pick" className="font-kn-display font-bold leading-tight text-gandha">
        <span lang="kn" className="block text-[clamp(1.25rem,6cqh,2.25rem)]">{MARKET.choose.kn}</span>
        <En className="block font-poster text-[clamp(1rem,4.5cqh,1.75rem)] tracking-widest text-arishina">{MARKET.choose.en}</En>
      </h3>

      <div className="mt-[3cqh] flex justify-center gap-[max(1rem,4cqw)]">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            data-en={`Walk the market as ${c.en}`}
            className="group relative flex cursor-pointer flex-col items-center rounded-sm bg-arishina px-[max(0.5rem,2cqw)] pb-[1.5cqh] pt-[2cqh] text-theatre shadow-[0_0.8rem_1.2rem_rgba(0,0,0,.55)] transition-transform duration-200 hover:-translate-y-1.5 hover:-rotate-1 focus-visible:-translate-y-1.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-kumkuma motion-reduce:transition-none"
          >
            <span
              aria-hidden
              className="relative block aspect-[2/3] h-[34cqh] bg-no-repeat motion-safe:group-hover:animate-walk-cycle motion-safe:group-focus-visible:animate-walk-cycle"
              style={{ backgroundImage: `url(${c.sheet})`, backgroundSize: '400% 400%', backgroundPosition: '0% 0%' }}
            />
            <span lang="kn" className="mt-1 font-kn-display text-[clamp(1rem,4.5cqh,1.5rem)] font-extrabold leading-tight">
              {c.kn}
            </span>
            <En className="font-poster text-[clamp(0.9rem,3.5cqh,1.25rem)] leading-none tracking-widest">{c.en}</En>
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm opacity-40 mix-blend-multiply" style={paper} />
          </button>
        ))}
      </div>

      <p className="mt-[3cqh] font-kn-body text-[clamp(0.85rem,3.5cqh,1.1rem)] font-semibold leading-snug text-gandha/85">
        <span lang="kn" className="block">{MARKET.chooseNext.kn}</span>
        <En className="block text-gandha/70">{MARKET.chooseNext.en}</En>
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-[2cqh] cursor-pointer font-kn-body text-sm font-semibold text-gandha/70 underline underline-offset-4 hover:text-gandha focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina"
        >
          <span lang="kn">ಹಿಂದಕ್ಕೆ</span>
          <En> · Back</En>
        </button>
      )}
    </div>
  )
}
