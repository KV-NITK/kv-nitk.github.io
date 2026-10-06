import { useEffect, useState } from 'react'
import { En } from '@p26/lib/prefs'
import { MARKET, PLACES } from '@p26/content'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

// The yellow ticket that rises when the walker stands at a place: a button
// with the E key on it where there is a keyboard. A place with nowhere to go
// yet says it is opening soon instead. It keeps the last place's words while
// it slides away.
export function PlacePrompt({ placeId, onUse }) {
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (placeId) setShown(PLACES.find((p) => p.id === placeId) ?? null)
  }, [placeId])

  const open = Boolean(placeId && shown)
  const go = shown?.go
  const body = (
    <>
      <span aria-hidden className="hidden size-8 shrink-0 place-items-center rounded-[5px] border-2 border-theatre/60 bg-theatre/10 font-poster text-xl leading-none pointer-fine:grid">
        E
      </span>
      <span className="text-left">
        <En className="block font-kn-display text-xl font-extrabold leading-tight">{go ? shown?.en : `${shown?.en} · ${MARKET.soon.en}`}</En>
        <span lang="kn" className="block font-kn-body text-sm font-bold leading-tight">
          {shown?.kn}
        </span>
        {!go && (
          <span lang="kn" className="block font-kn-body text-xs font-semibold leading-tight text-theatre/75">
            {MARKET.soon.kn}
          </span>
        )}
      </span>
    </>
  )
  const box = 'relative flex items-center gap-3 rounded-sm bg-arishina px-4 py-2.5 text-theatre shadow-[0_0.5rem_1rem_rgba(0,0,0,.55)]'

  return (
    <div
      inert={!open}
      aria-live="polite"
      className={cn(
        'fixed inset-x-0 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+9rem)] z-40 flex justify-center px-3 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[160%] opacity-0'
      )}
    >
      {go ? (
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
