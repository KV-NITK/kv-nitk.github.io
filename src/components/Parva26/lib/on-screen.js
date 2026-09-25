import { useEffect, useState } from 'react'

// Whether an element is on screen. Scenes use it to stop what moves while
// nobody can see it (spec §0, performance rule 6).
export function useOnScreen(ref, options) {
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    const seen = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), options)
    seen.observe(ref.current)
    return () => seen.disconnect()
    // The observer is set up once; options are fixed for a component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
  return onScreen
}

// Add to an element's classes while it is off screen: every CSS animation
// inside it pauses.
export const PAUSED = '[&_*]:[animation-play-state:paused]'
