import { useEffect, useState } from 'react'

// Days/hours remaining until `target` (spec §3 Scene 2 "Countdown to Parva").
export function useCountdown(target) {
  const targetMs = new Date(target).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, targetMs - now)
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  return { days, hours, done: diff === 0 }
}
