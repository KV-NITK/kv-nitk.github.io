import { useEffect, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { SCENES } from '@p26/content'
import { useCurrentScene } from '@p26/lib/use-current-scene'
import { cn } from '@/lib/utils'

// "Skip scene", like a streaming app's Skip intro: on a long scene (one
// marked `skip` in SCENES that takes more than ~1.3 screens of scrolling
// here) a button in the bottom-right corner cuts straight to the next scene.
// The credits' button says Skip credits and lands on the thank-you card,
// just before the contact and links. Nothing is hidden or removed: people
// who want the scene scroll through it as before.

const LONG = 1.3

// What a section takes up in the scroll: a pinned one sits in a pin spacer
// as tall as its hold.
const box = (el) => (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el)
const top = (el) => el.getBoundingClientRect().top + window.scrollY

// Where the skip lands for `scene`, as a scroll position, or null.
function landing(scene) {
  const section = document.getElementById(scene.id)
  if (!section) return null
  const mark = section.querySelector('[data-skip-to]')
  if (mark) {
    // The card in the middle of the screen
    const r = mark.getBoundingClientRect()
    return r.top + window.scrollY - Math.max(0, (window.innerHeight - r.height) / 2)
  }
  const next = SCENES[SCENES.indexOf(scene) + 1]
  const after = next && document.getElementById(next.id)
  return after ? top(box(after)) : null
}

export function SkipScene() {
  const { subtitles } = usePrefs()
  const current = useCurrentScene()
  const [shown, setShown] = useState(null)

  // Shown while you are in a long scene and the landing is still ahead.
  useEffect(() => {
    const scene = current?.skip ? current : null
    if (!scene) {
      setShown(null)
      return
    }
    let raf = 0
    const check = () => {
      raf = 0
      const section = document.getElementById(scene.id)
      const to = section && landing(scene)
      const long = section && box(section).offsetHeight > window.innerHeight * LONG
      setShown(long && to != null && to > window.scrollY + window.innerHeight * 0.3 ? scene : null)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [current])

  // Keep the last wording while the button fades out
  const [last, setLast] = useState(null)
  if (shown && shown !== last) setLast(shown)
  const scene = shown ?? last
  const words = scene?.skip === true ? { kn: 'ಮುಂದಿನ ದೃಶ್ಯ', en: 'Skip scene' } : scene?.skip

  // A cut, not a pan: the scenes in between don't play on the way.
  const skip = () => {
    const to = scene && landing(scene)
    if (to != null) window.scrollTo({ top: to, behavior: 'instant' })
  }

  return (
    <button
      type="button"
      onClick={skip}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      data-en={words ? `${words.en} · jump ahead` : undefined}
      className={cn(
        'fixed bottom-4 right-4 z-50 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[3px] border border-[#f2e6c8]/45 bg-black/70 py-1.5 pl-4 pr-3 text-[#f2e6c8] shadow-[0_6px_16px_rgba(0,0,0,.55)] backdrop-blur-[2px] transition-[opacity,transform,background-color,border-color] duration-300 hover:border-arishina hover:bg-black/85 sm:bottom-5 sm:right-5',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
        shown ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      {words && (
        <span className="flex flex-col items-start leading-none">
          <span lang="kn" className="font-kn-display text-[0.95rem] font-bold">
            {words.kn}
          </span>
          <span lang="en" className={cn('mt-0.5 font-poster text-[0.7rem] tracking-[0.2em] text-[#f2e6c8]/70', !subtitles && 'sr-only')}>
            {words.en}
          </span>
        </span>
      )}
      {/* Skip-forward: two triangles and a bar */}
      <svg aria-hidden viewBox="0 0 20 14" className="h-3.5 w-5 fill-current">
        <path d="M1 1.5 L8.5 7 L1 12.5 Z M9 1.5 L16.5 7 L9 12.5 Z" />
        <rect x="17" y="1.5" width="2.2" height="11" rx=".6" />
      </svg>
    </button>
  )
}
