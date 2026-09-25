import { useEffect } from 'react'

// When you stop scrolling for three seconds, the credits carry on rolling
// by themselves, slowly, like a real roll: they wait a moment on each of
// the stop cards (thank you, and the stinger) and stop when ಶುಭಂ comes up. Any wheel, touch or key
// hands control straight back.
export function useCreditsDrift({ listRef, stops, endRef, reduced }) {
  useEffect(() => {
    if (reduced) return
    let idle = 0
    let raf = 0
    let last = 0
    let carry = 0
    const waited = new Set()
    let pauseUntil = 0

    const rolling = () => {
      const r = listRef.current.getBoundingClientRect()
      return r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4
    }
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      for (const stop of stops) {
        const card = stop.current
        if (!card || waited.has(card)) continue
        const t = card.getBoundingClientRect()
        if (t.top + t.height / 2 <= innerHeight / 2) {
          waited.add(card)
          pauseUntil = now + 2500
        }
      }
      if (endRef.current.getBoundingClientRect().top <= innerHeight * 0.05) return (raf = 0)
      if (now >= pauseUntil) {
        carry += 38 * dt
        const px = Math.floor(carry)
        if (px) {
          window.scrollBy(0, px)
          carry -= px
        }
      }
      raf = requestAnimationFrame(step)
    }
    const wait = () => {
      clearTimeout(idle)
      idle = setTimeout(() => {
        if (rolling() && document.visibilityState === 'visible' && !raf) {
          last = performance.now()
          raf = requestAnimationFrame(step)
        } else wait()
      }, 3000)
    }
    const takeOver = () => {
      cancelAnimationFrame(raf)
      raf = 0
      wait()
    }
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    events.forEach((type) => window.addEventListener(type, takeOver, { passive: true }))
    // Scrolling by hand resets the three seconds; our own scrolling doesn't.
    const onScroll = () => !raf && wait()
    window.addEventListener('scroll', onScroll, { passive: true })
    wait()
    return () => {
      clearTimeout(idle)
      cancelAnimationFrame(raf)
      events.forEach((type) => window.removeEventListener(type, takeOver))
      window.removeEventListener('scroll', onScroll)
    }
    // The stop cards are fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef, endRef, reduced])
}
