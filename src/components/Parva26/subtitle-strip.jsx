import { useEffect, useState } from 'react'
import { usePrefs } from './prefs'
import { cn } from '../../lib/utils'

// Bottom-centre film subtitles: pale yellow with a thin black outline
// (spec §2). Anything carrying data-en shows that English here while it is
// hovered, focused or tapped. With subtitles off the strip stays hidden,
// except for elements marked data-en-always (the subtitles switch itself).
// It repeats labels that are already accessible names, so it's aria-hidden.
export function SubtitleStrip() {
  const { subtitles } = usePrefs()
  const [target, setTarget] = useState(null)
  const [text, setText] = useState('')

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

  const visible = Boolean(target) && (subtitles || target.hasAttribute('data-en-always'))

  return (
    <p
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-20 z-[65] mx-auto max-w-xl text-center font-kn-body text-base font-semibold leading-snug text-[#fff1a8] transition-opacity duration-200 sm:bottom-8 sm:text-xl',
        '[text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000,0_0_6px_rgba(0,0,0,.8)]',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {text}
    </p>
  )
}
