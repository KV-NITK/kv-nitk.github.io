import { useEffect, useState } from 'react'
import { SCENES } from '@p26/content'

// The scene crossing the middle of the viewport.
export function useCurrentScene() {
  const [current, setCurrent] = useState(SCENES[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setCurrent(SCENES.find((s) => s.id === hit.target.id))
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )
    for (const s of SCENES) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return current
}
