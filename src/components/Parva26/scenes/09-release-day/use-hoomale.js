import { useEffect, useRef, useState } from 'react'
import { HOOMALE } from '@p26/content'
import { useStoredState, load, save } from '@p26/lib/storage'
import { getFlowers, sendFlowers } from '@/api/parva26'

// Taps go to the server in one batch every few seconds; the shared count is
// read again now and then while the street is on screen.
const SEND_EVERY_MS = 5000
const READ_EVERY_MS = 15000
const BATCH_MAX = 50
const SEEN_KEY = 'parva26:flowers-shared'

// A random id for this browser, so the server can cap one visitor's taps
// without a login.
function clientId() {
  let id = load('parva26:client', null)
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')
    save('parva26:client', id)
  }
  return id
}

// The shared count, your own (kept in this browser), and whether the first
// count has arrived, so the scene doesn't celebrate the jump to it.
// `?hoomale=9996` starts the count there and talks to no server (to try the
// milestones).
export function useHoomale(live) {
  const [preview] = useState(() => {
    const n = Number(new URLSearchParams(window.location.search).get('hoomale'))
    return Number.isFinite(n) && n > 0 ? n : null
  })
  // Until the server answers, the count last seen here
  const [server, setServer] = useState(() => preview ?? load(SEEN_KEY, 0))
  const [ready, setReady] = useState(preview !== null)
  const [unsent, setUnsent] = useState(0)
  const [mine, setMine] = useStoredState('parva26:flowers', 0)
  const recent = useRef([])
  const pending = useRef(0)
  const shown = useRef(0)

  const take = (total) => {
    setServer(total)
    save(SEEN_KEY, total)
  }

  // The first read, then every READ_EVERY_MS while the street is on screen
  useEffect(() => {
    if (preview !== null) return
    let cancelled = false
    const read = () => {
      if (document.visibilityState === 'hidden') return
      getFlowers()
        .then((total) => !cancelled && take(total))
        .catch(() => {})
        .finally(() => !cancelled && setReady(true))
    }
    if (!ready || live) read()
    if (!live) return () => (cancelled = true)
    const id = setInterval(read, READ_EVERY_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  // Taps not yet sent go every SEND_EVERY_MS, and when the page is hidden or
  // left; if the server can't be reached they wait for the next round.
  useEffect(() => {
    if (preview !== null) return
    const send = async () => {
      const count = Math.min(pending.current, BATCH_MAX)
      if (!count) return
      pending.current -= count
      try {
        const { total } = await sendFlowers(count, clientId())
        take(total)
      } catch {
        pending.current += count
      }
      setUnsent(pending.current)
    }
    const id = setInterval(send, SEND_EVERY_MS)
    const hidden = () => document.visibilityState === 'hidden' && send()
    document.addEventListener('visibilitychange', hidden)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', hidden)
      send()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const add = () => {
    const now = Date.now()
    recent.current = recent.current.filter((t) => now - t < 60_000)
    if (recent.current.length >= HOOMALE.perMinute) return
    recent.current.push(now)
    setMine((m) => m + 1)
    if (preview !== null) return setServer((s) => s + 1)
    pending.current++
    setUnsent(pending.current)
  }

  // Never counts down on screen, even when a read lands before a batch does
  const shared = Math.max(server + unsent, shown.current)
  shown.current = shared

  return { shared, mine, add, ready }
}
