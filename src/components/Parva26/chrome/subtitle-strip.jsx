import { useEffect, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { useCurrentScene } from '@p26/lib/use-current-scene'
import { cn } from '@/lib/utils'

let speak = null
let strip = null

// While the hall is on screen, lines are subtitled on the screen itself: the
// title scene tells the strip how far the screen's foot is from the bottom of
// the window. Set on the strip alone, so it restyles one element, not the page.
export function anchorStrip(px) {
  strip?.style.setProperty('--p26-screen-bottom', px === null ? '' : `${px}px`)
}

// Puts a scene's line in the strip for a while, like a subtitle for what is
// on screen (the title's tagline, the lamp's "Light the lamp…"). Anything
// hovered or focused takes over the strip until it is left.
export function sayLine(text, ms = 6000) {
  speak?.(text, ms)
}

// Bottom-centre film subtitles: pale yellow with a thin black outline
// (spec §2). Anything carrying data-en shows that English here while it is
// hovered, focused or tapped. With subtitles off the strip stays hidden,
// except for elements marked data-en-always (the subtitles switch itself).
// It repeats labels that are already accessible names, so it's aria-hidden.
export function SubtitleStrip() {
  const { subtitles } = usePrefs()
  const scene = useCurrentScene()
  const [target, setTarget] = useState(null)
  const [text, setText] = useState('')
  const [line, setLine] = useState('')
  const [shown, setShown] = useState('')

  useEffect(() => {
    let clear = 0
    speak = (next, ms) => {
      clearTimeout(clear)
      setLine(next)
      clear = setTimeout(() => setLine(''), ms)
    }
    return () => {
      speak = null
      clearTimeout(clear)
    }
  }, [])

  useEffect(() => {
    let clear = 0
    const find = (node) => node?.closest?.('[data-en]') ?? null
    const show = (el, forMs) => {
      clearTimeout(clear)
      setTarget(el)
      if (forMs) clear = setTimeout(() => setTarget(null), forMs)
    }
    const hideSoon = () => {
      clearTimeout(clear)
      clear = setTimeout(() => setTarget(null), 150)
    }

    const onOver = (e) => {
      const el = find(e.target)
      if (el) show(el, e.pointerType === 'touch' ? 2500 : 0)
    }
    const onOut = (e) => {
      if (e.pointerType === 'touch') return
      const from = find(e.target)
      if (from && from !== find(e.relatedTarget)) hideSoon()
    }
    const onFocusIn = (e) => {
      const el = find(e.target)
      if (el) show(el)
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', hideSoon)
    return () => {
      clearTimeout(clear)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', hideSoon)
    }
  }, [])

  // Follow the target's text as it changes, e.g. "Subtitles: on" → "off".
  useEffect(() => {
    if (!target) return
    const read = () => setText(target.dataset.en)
    read()
    const observer = new MutationObserver(read)
    observer.observe(target, { attributes: true, attributeFilter: ['data-en'] })
    return () => observer.disconnect()
  }, [target])

  const hovering = Boolean(target) && (subtitles || target.hasAttribute('data-en-always'))
  const speaking = !hovering && Boolean(line) && subtitles
  // The last words stay on screen while the strip fades out.
  const current = hovering ? text : speaking ? line : ''
  if (current && current !== shown) setShown(current)

  return (
    <p
      ref={(el) => (strip = el)}
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-20 z-[65] mx-auto max-w-xl text-center font-kn-body text-base font-semibold leading-snug text-[#fff1a8] transition-opacity duration-200 sm:bottom-8 sm:text-xl',
        '[text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000,0_0_6px_rgba(0,0,0,.8)]',
        // In the hall, the seats and tickets fill the bottom of the view, so
        // lines are subtitled on the screen itself, as a film's would be.
        scene?.id === 'title' && 'bottom-[var(--p26-screen-bottom,11.5rem)] sm:bottom-[var(--p26-screen-bottom,2rem)]',
        hovering || speaking ? 'opacity-100' : 'opacity-0'
      )}
    >
      {shown}
    </p>
  )
}
