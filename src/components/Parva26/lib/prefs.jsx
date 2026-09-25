import { createContext, useContext } from 'react'
import { useStoredState } from '@p26/lib/storage'
import { cn } from '@/lib/utils'

// Visitor preferences shared across the page, remembered between visits
// (spec §2, §4).
const PrefsContext = createContext(null)

export function PrefsProvider({ children }) {
  // Subtitles default ON so non-Kannada visitors aren't lost (spec §4).
  const [subtitles, setSubtitles] = useStoredState('parva26:subtitles', true)
  const [sound, setSound] = useStoredState('parva26:sound', true)

  // Older visits stored these as 1 and 0; keep them booleans so a stored 0
  // never renders as text.
  return (
    <PrefsContext.Provider value={{ subtitles: Boolean(subtitles), setSubtitles, sound: Boolean(sound), setSound }}>
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

// The English subtitle of a Kannada label: shown while subtitles are on,
// kept for screen readers when they're off (spec §4).
export function En({ as: Tag = 'span', className, children, ...props }) {
  const { subtitles } = usePrefs()
  return (
    <Tag lang="en" className={cn(className, !subtitles && 'sr-only')} {...props}>
      {children}
    </Tag>
  )
}
