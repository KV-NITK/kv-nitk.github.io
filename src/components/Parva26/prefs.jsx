import { createContext, useContext, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

// Visitor preferences shared across the page. Both are remembered between
// visits (spec §2, §4); storage can be unavailable (private mode), so every
// access is guarded and the defaults still work without it.
const PrefsContext = createContext(null)

function usePersistentFlag(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? initial : stored === '1'
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, value ? '1' : '0')
    } catch {
      // ignore: preference just won't persist
    }
  }, [key, value])

  return [value, setValue]
}

export function PrefsProvider({ children }) {
  // Subtitles default ON so non-Kannada visitors aren't lost (spec §4).
  const [subtitles, setSubtitles] = usePersistentFlag('parva26:subtitles', true)
  const [sound, setSound] = usePersistentFlag('parva26:sound', true)

  return (
    <PrefsContext.Provider value={{ subtitles, setSubtitles, sound, setSound }}>
      {children}
    </PrefsContext.Provider>
  )
}

export function usePrefs() {
  return useContext(PrefsContext)
}

// Kannada line that is always shown, with its English subtitle under it.
// With subtitles OFF the English stays in the DOM as sr-only, so screen
// readers still get it.
export function Sub({ as: Tag = 'div', kn, en, className, knClassName, enClassName }) {
  const { subtitles } = usePrefs()

  return (
    <Tag className={className}>
      <span lang="kn" className={cn('block', knClassName)}>{kn}</span>
      <span lang="en" className={cn('block', enClassName, !subtitles && 'sr-only')}>{en}</span>
    </Tag>
  )
}
