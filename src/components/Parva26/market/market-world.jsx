import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { En } from '@p26/lib/prefs'
import { MARKET, PLACES } from '@p26/content'
import { layoutFor } from '@p26/market/world/layout'
import { loadFonts } from '@p26/market/world/art/paint'

// Hosts the Phaser forecourt. Phaser is loaded here, on its own, once there
// is a role to play, so the picker appears at once and the game's code is
// fetched only for this page. The game is rebuilt when the role or the
// screen's orientation changes. `onNear(id | null)` says which place the
// walker stands at; `onAction(id)` says they used it.
export function MarketWorld({ character, portrait, onNear, onAction }) {
  const hostRef = useRef(null)
  const calls = useRef({ onNear, onAction })
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    calls.current = { onNear, onAction }
  })

  useEffect(() => {
    let game = null
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        await loadFonts()
        const { startGame } = await import('@p26/market/world/start-game')
        if (cancelled) return
        game = startGame({
          parent: hostRef.current,
          character,
          layout: layoutFor(portrait),
          onNear: (id) => calls.current.onNear(id),
          onAction: (id) => calls.current.onAction(id),
        })
        setStatus('ready')
      } catch (error) {
        console.error('The market could not start', error)
        if (!cancelled) setStatus('failed')
      }
    })()
    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [character, portrait])

  return (
    <>
      <div ref={hostRef} className="absolute inset-0 select-none [&_canvas]:touch-none" />
      {status === 'loading' && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-center font-kn-display text-xl font-bold text-gandha/80">
          <span>
            <span lang="kn" className="block">{MARKET.loading.kn}</span>
            <En className="block text-base font-semibold">{MARKET.loading.en}</En>
          </span>
        </p>
      )}
      {status === 'failed' && <Fallback />}
    </>
  )
}

// If the game can't start, the places are still there as plain links.
function Fallback() {
  return (
    <div className="absolute inset-0 grid place-items-center px-6 text-center">
      <div>
        <p lang="kn" className="font-kn-display text-2xl font-bold text-gandha">{MARKET.failed.kn}</p>
        <En as="p" className="mt-1 text-gandha/75">{MARKET.failed.en}</En>
        <Link to="/parva-26" className="mt-6 inline-block rounded-sm bg-arishina px-5 py-3 font-kn-display text-xl font-extrabold text-theatre">
          <span lang="kn">{PLACES[0].kn}</span>
          <En className="block text-base font-bold">{PLACES[0].en}</En>
        </Link>
      </div>
    </div>
  )
}
