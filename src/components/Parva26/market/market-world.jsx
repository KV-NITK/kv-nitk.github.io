import { useEffect, useRef, useState } from 'react'
import { En } from '@p26/lib/prefs'
import { MARKET } from '@p26/content'
import { layoutFor } from '@p26/market/world/layout'
import { loadFonts } from '@p26/market/world/art/paint'

// Hosts the Phaser forecourt. Phaser is loaded here, on its own, once there
// is a role to play, so the game's code is fetched only when the market is
// near. The game is rebuilt when the role or the box's shape changes, and
// paused while `running` is false (off screen, or behind the doors).
// `onNear(id | null)` says which place the walker stands at; `onAction(id)`
// says they used it. `keyTarget` is the element whose focus gives the game
// the keyboard, and `apiRef` gets `releaseKeys()` for when it loses it.
export function MarketWorld({ character, portrait, visited, running, keyTarget, apiRef, onNear, onAction }) {
  const hostRef = useRef(null)
  const gameRef = useRef(null)
  const calls = useRef({ onNear, onAction })
  const visitedRef = useRef(visited)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    calls.current = { onNear, onAction }
    visitedRef.current = visited
  })

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        await loadFonts()
        const { startGame } = await import('@p26/market/world/start-game')
        if (cancelled) return
        gameRef.current = startGame({
          parent: hostRef.current,
          keyTarget: keyTarget.current,
          character,
          layout: layoutFor(portrait),
          visited: visitedRef.current,
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
      gameRef.current?.destroy(true)
      gameRef.current = null
      calls.current.onNear(null)
    }
  }, [character, portrait, keyTarget])

  useEffect(() => {
    const game = gameRef.current
    if (!game) return
    if (running) game.resume()
    else game.pause()
  }, [running, status])

  useEffect(() => {
    apiRef.current = {
      releaseKeys: () => gameRef.current?.scene.getScene('forecourt')?.releaseKeys(),
    }
  }, [apiRef])

  return (
    <>
      <div ref={hostRef} className="absolute inset-0 select-none [&_canvas]:touch-pan-y" />
      {status === 'loading' && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-center font-kn-display text-xl font-bold text-gandha/80">
          <span>
            <En className="block">{MARKET.loading.en}</En>
            <span lang="kn" className="block text-base font-semibold">{MARKET.loading.kn}</span>
          </span>
        </p>
      )}
      {/* The stalls are still there as the buttons under the box */}
      {status === 'failed' && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <En as="p" className="font-kn-display text-xl font-bold text-gandha">{MARKET.failed.en}</En>
            <p lang="kn" className="mt-1 text-gandha/75">{MARKET.failed.kn}</p>
          </div>
        </div>
      )}
    </>
  )
}
