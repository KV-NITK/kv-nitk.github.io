import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'

const PUFFS = 14
const PUFF_EVERY_MS = 45
const CLICKABLE = 'a, button, [role="button"], label, select, summary'
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]'

// Desktop cursor (spec §2): the glowing tip of an agarbatti, trailing
// sandalwood smoke as it moves. It brightens over anything clickable and
// steps aside inside text fields, where the normal text cursor comes back.
// Smoke is a small pool of soft dots animated with transform and opacity
// only, so the compositor runs it without repainting the page, and nothing
// runs while the mouse is still. Touch devices keep their normal behaviour.
export function AgarbattiCursor({ onActiveChange }) {
  const tipRef = useRef(null)
  const smokeRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    onActiveChange(true)

    const tip = tipRef.current
    const puffs = Array.from(smokeRef.current.children)
    let x = 0
    let y = 0
    let raf = 0
    let next = 0
    let lastPuff = 0
    let smoking = false

    const frame = (now) => {
      raf = 0
      tip.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (reduced || !smoking || now - lastPuff < PUFF_EVERY_MS) return
      lastPuff = now
      const drift = (Math.random() - 0.5) * 24
      puffs[next++ % PUFFS].animate(
        [
          { transform: `translate3d(${x}px, ${y}px, 0) scale(.35)`, opacity: 0.35 },
          { transform: `translate3d(${x + drift}px, ${y - 46}px, 0) scale(1.7)`, opacity: 0 },
        ],
        { duration: 1100, easing: 'cubic-bezier(.2,.6,.4,1)' }
      )
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      const inField = Boolean(e.target.closest?.(TEXT_FIELD))
      smoking = !inField
      tip.dataset.hidden = String(inField)
      tip.dataset.hot = String(!inField && Boolean(e.target.closest?.(CLICKABLE)))
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onLeave = () => {
      smoking = false
      tip.dataset.hidden = 'true'
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      onActiveChange(false)
    }
  }, [reduced, onActiveChange])

  return (
    <div aria-hidden>
      <div ref={smokeRef}>
        {Array.from({ length: PUFFS }, (_, i) => (
          <span
            key={i}
            className="pointer-events-none fixed -left-2.5 -top-2.5 z-[70] size-5 rounded-full bg-radial from-[#e8e0d4]/70 to-transparent to-70% opacity-0"
          />
        ))}
      </div>
      <div
        ref={tipRef}
        data-hidden="true"
        className="group pointer-events-none fixed left-0 top-0 z-[70] transition-opacity duration-150 data-[hidden=true]:opacity-0"
      >
        {/* The stick, held at an angle below the ember */}
        <span className="absolute left-0 top-0 h-[2.5px] w-7 origin-left rotate-[52deg] rounded-full bg-linear-to-r from-[#5b5048] via-[#3a2416] to-[#2a180c]" />
        <span className="absolute -left-[3px] -top-[3px] size-1.5 rounded-full bg-[#ffb347] shadow-[0_0_6px_3px_rgba(255,120,30,.65)] transition-[scale,box-shadow] duration-150 group-data-[hot=true]:scale-150 group-data-[hot=true]:shadow-[0_0_10px_5px_rgba(255,150,40,.85)]" />
      </div>
    </div>
  )
}
