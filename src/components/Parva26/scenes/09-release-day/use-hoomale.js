import { useEffect, useRef, useState } from 'react'
import { HOOMALE } from '@p26/content'
import { useStoredState } from '@p26/lib/storage'

// The shared count and your own. Your total is kept in this browser; the
// shared one will come from the server.
export function useHoomale() {
  const [base] = useState(() => {
    const preview = Number(new URLSearchParams(window.location.search).get('hoomale'))
    return Number.isFinite(preview) && preview > 0 ? preview : HOOMALE.base
  })
  const [session, setSession] = useState(0)
  const [mine, setMine] = useStoredState('parva26:flowers', 0)
  const recent = useRef([])
  const pending = useRef(0)

  // TODO(backend): send `pending` to the server in one batch every few
  // seconds; until then the flowers are only counted here.
  useEffect(() => {
    const id = setInterval(() => {
      pending.current = 0
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const add = () => {
    const now = Date.now()
    recent.current = recent.current.filter((t) => now - t < 60_000)
    if (recent.current.length >= HOOMALE.perMinute) return
    recent.current.push(now)
    pending.current++
    setSession((s) => s + 1)
    setMine((m) => m + 1)
  }

  return { shared: base + session, mine, add }
}
