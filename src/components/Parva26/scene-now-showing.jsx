import { useState } from 'react'
import { Sub } from './prefs'
import { EVENTS } from './data'
import { cn } from '../../lib/utils'

function PosterCard({ event }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-expanded={flipped}
      className="group [perspective:1000px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
    >
      <div
        className={cn(
          'relative h-64 rounded-md border-2 border-heartwood shadow-lg transition-transform duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* front */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-md bg-heartwood/20 p-4 [backface-visibility:hidden]">
          <span className="self-start rounded-full bg-kumkuma px-2 py-0.5 text-xs font-semibold text-projector">
            {event.genre}
          </span>
          <div>
            <p lang="kn" className="font-kn-display text-2xl font-bold text-arishina">{event.title}</p>
            <p className="font-poster text-sm tracking-wide text-sandal">{event.titleEn}</p>
          </div>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex flex-col justify-center gap-2 rounded-md bg-theatre p-4 text-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-gandha/90">{event.time}</p>
          <p className="text-gandha/70">{event.venue}</p>
          <a
            href={event.registerLink}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-block rounded-full bg-arishina px-3 py-1.5 text-center font-poster text-base text-theatre"
          >
            Register
          </a>
        </div>
      </div>
    </button>
  )
}

// Scene 6: ಇಂದೇ ನೋಡಿ · Now Showing. Tapping a poster flips it (spec §3 Scene 6).
export function NowShowingScene() {
  return (
    <section id="now-showing" className="scroll-mt-14 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Sub
          as="h2"
          kn="ಇಂದೇ ನೋಡಿ"
          en="Now Showing"
          className="mb-10 text-center"
          knClassName="font-kn-display text-4xl font-bold sm:text-5xl"
          enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((event) => (
            <PosterCard key={event.id} event={event} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="/events" className="text-sm text-sandal underline underline-offset-4 hover:text-arishina">
            See all events
          </a>
        </div>
      </div>
    </section>
  )
}
