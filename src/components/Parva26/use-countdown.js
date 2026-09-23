import { useEffect, useState } from 'react'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Days, hours and minutes left until `target` (spec §3 Scene 2 "Countdown to
// Parva"). Updates on each minute boundary, so the show board flips at :00.
export function useCountdown(target) {
  const targetMs = new Date(target).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setTimeout(() => setNow(Date.now()), MINUTE - (now % MINUTE) + 50)
    return () => clearTimeout(id)
  }, [now])

  const diff = Math.max(0, targetMs - now)
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    done: diff === 0,
  }
}
