import { useEffect, useState } from 'react'
import { En } from '@p26/lib/prefs'
import { MARKET, PLACES } from '@p26/content'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

// The yellow ticket that rises from the bottom of the game when the walker
// stands at a place: a button that says where it goes, with "Press E or
// click" where there is a keyboard. A stall with nowhere to go yet says it
// is coming soon instead. It keeps the last place's words while it slides
// away.
export function PlacePrompt({ placeId, onUse }) {
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (placeId) setShown(PLACES.find((p) => p.id === placeId) ?? null)
  }, [placeId])

  const open = Boolean(placeId && shown)
  const usable = Boolean(shown?.go || shown?.scroll)
  const body = (
    <>
      {usable && (
        <span aria-hidden className="hidden size-9 shrink-0 place-items-center rounded-[5px] border-2 border-theatre/70 bg-theatre/10 font-poster text-2xl leading-none shadow-[inset_0_-2px_0_rgba(43,10,14,.35)] pointer-fine:grid">
          E
        </span>
      )}
      <span className="min-w-0 text-left">
        <En className="block font-kn-display text-lg font-extrabold leading-tight sm:text-xl">
          {usable ? shown?.en : `${shown?.en} · ${MARKET.soon.en}`}
          {usable && <span aria-hidden> →</span>}
        </En>
        <span lang="kn" className="block font-kn-body text-sm font-bold leading-tight">
          {shown?.kn}
          {!usable && ` · ${MARKET.soon.kn}`}
        </span>
        {usable && (
          <span className="hidden font-kn-body text-xs font-semibold leading-tight text-theatre/75 pointer-fine:block">
            <En>{MARKET.pressE.en} · </En>
            <span lang="kn">{MARKET.pressE.kn}</span>
          </span>
        )}
      </span>
    </>
  )
  const box = 'relative flex max-w-full items-center gap-3 rounded-sm bg-arishina px-4 py-2 text-theatre shadow-[0_0.5rem_1rem_rgba(0,0,0,.55)]'

  return (
    <div
      inert={!open}
      aria-live="polite"
      className={cn(
        'absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[160%] opacity-0'
      )}
    >
      {!shown ? null : usable ? (
        <button type="button" onClick={() => onUse(shown.id)} className={cn(box, 'cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-kumkuma')}>
          {body}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm opacity-40 mix-blend-multiply" style={paper} />
        </button>
      ) : (
        <div className={cn(box, 'opacity-90')}>
          {body}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm opacity-40 mix-blend-multiply" style={paper} />
        </div>
      )}
    </div>
  )
}
