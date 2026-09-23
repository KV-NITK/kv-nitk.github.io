import { useState } from 'react'
import { Sub } from './prefs'
import { toKannadaDigits } from './text'
import { TIMELINE } from './data'
import { cn } from '../../lib/utils'

// Scene 10: ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ. A horizontal, tap-to-select strip for now;
// drag-scroll and "projecting" the card onto the screen come with the
// hero-effects step (spec §3 Scene 10).
export function TimelineScene() {
  const [activeYear, setActiveYear] = useState(TIMELINE[TIMELINE.length - 1].year)
  const active = TIMELINE.find((t) => t.year === activeYear)

  return (
    <section id="timeline" className="scroll-mt-14 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Sub
          as="h2"
          kn="ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ"
          en="Sandalwood through the years"
          className="mb-8 text-center"
          knClassName="font-kn-display text-4xl font-bold sm:text-5xl"
          enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
        />

        {active && (
          <div className="mb-8 rounded-md border-2 border-heartwood bg-heartwood/10 p-6 text-center">
            <p className="font-poster text-3xl text-arishina">{toKannadaDigits(active.year)}</p>
            <p lang="kn" className="mt-1 font-kn-display text-xl font-semibold">{active.film}</p>
            <p className="mt-2 text-sm text-gandha/70">{active.line}</p>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-3">
          {TIMELINE.map((entry) => (
            <button
              key={entry.year}
              type="button"
              onClick={() => setActiveYear(entry.year)}
              aria-pressed={entry.year === activeYear}
              className={cn(
                'flex-none rounded-sm border-2 px-4 py-3 text-left transition-colors',
                entry.year === activeYear
                  ? 'border-arishina bg-arishina/10'
                  : 'border-heartwood/60 hover:border-heartwood'
              )}
            >
              <p className="font-poster text-lg text-sandal">{entry.year}</p>
              <p lang="kn" className="max-w-32 truncate text-sm">{entry.film}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
