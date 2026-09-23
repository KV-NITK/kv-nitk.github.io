import { Captions, CaptionsOff, Ticket, Volume2, VolumeX } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePrefs } from './prefs'

const toggleClass = (on) =>
  cn(
    'inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
    on
      ? 'border-arishina/60 text-arishina'
      : 'border-heartwood text-gandha/60 hover:text-gandha'
  )

export function TopBar() {
  const { subtitles, setSubtitles, sound, setSound } = usePrefs()

  return (
    // Fixed rather than sticky: the site sets overflow-x: hidden on html, body
    // and #root, which stops position: sticky from working.
    <header className="fixed inset-x-0 top-0 z-50 border-b border-heartwood/60 bg-theatre/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <a href="#title" className="mr-auto flex items-baseline gap-1.5 rounded-sm focus-visible:outline-2 focus-visible:outline-arishina">
          {/* Text stand-in until the hand-lettered SVG logo is ready */}
          <span lang="kn" className="font-kn-display text-2xl font-bold text-arishina">ಪರ್ವ</span>
          <span className="font-poster text-lg tracking-wide text-gandha/80">2026</span>
        </a>

        <button
          type="button"
          aria-label="Subtitles"
          aria-pressed={subtitles}
          onClick={() => setSubtitles((on) => !on)}
          className={toggleClass(subtitles)}
        >
          {subtitles ? <Captions className="size-4" /> : <CaptionsOff className="size-4" />}
          <span className="hidden sm:inline">
            <span lang="kn">ಉಪಶೀರ್ಷಿಕೆ</span> · Subtitles: {subtitles ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Only stores the choice for now; audio is wired up with the diya intro */}
        <button
          type="button"
          aria-label="Sound"
          aria-pressed={sound}
          onClick={() => setSound((on) => !on)}
          className={toggleClass(sound)}
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>

        <a
          href="#interval"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-arishina px-4 font-poster text-lg tracking-wide text-theatre transition-colors hover:bg-projector focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
        >
          <Ticket className="size-4" />
          Book
        </a>
      </div>
    </header>
  )
}
