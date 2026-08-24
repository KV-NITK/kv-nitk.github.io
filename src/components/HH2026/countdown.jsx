import { useEffect, useState } from 'react'

const TARGET = new Date('2026-08-30T14:00:00+05:30').getTime()

function split(ms) {
  const clamped = Math.max(ms, 0)
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  }
}

export function Countdown() {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    setRemaining(TARGET - Date.now())
    const id = setInterval(() => setRemaining(TARGET - Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const parts = split(remaining ?? 0)
  const units = [
    { label: 'Days', value: parts.days },
    { label: 'Hrs', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Sec', value: parts.seconds },
  ]

  return (
    <div className="flex items-end gap-3">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center gap-1">
          <span className="min-w-14 border border-primary/30 bg-secondary/60 px-2 py-1.5 text-center font-serif text-2xl font-bold text-primary tabular-nums">
            {remaining === null ? '--' : String(unit.value).padStart(2, '0')}
          </span>
          <span className="font-serif text-[0.6rem] tracking-[0.22em] text-muted-foreground uppercase">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
