import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// For JS-driven animation. CSS animations use Tailwind's motion-safe: instead.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
