import { Flower2 } from 'lucide-react'
import { Sub } from './prefs'

// Scene 9: ಬಿಡುಗಡೆ ದಿನ · Release Day cutout. Static placeholder for now —
// petal bursts, whistles and the flower counter arrive in the effects step
// (spec §3 Scene 9, step 13 of the build plan).
export function ReleaseDayScene() {
  return (
    <section id="release-day" className="flex min-h-[70vh] scroll-mt-14 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Sub
        as="h2"
        kn="ಬಿಡುಗಡೆ ದಿನ"
        en="Release Day"
        knClassName="font-kn-display text-4xl font-bold sm:text-5xl"
        enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
      />

      {/* Stand-in for the "Parva Hero" cutout illustration on bamboo scaffolding */}
      <div className="flex h-72 w-48 items-center justify-center rounded-t-full border-4 border-heartwood bg-heartwood/20 text-sandal">
        cutout art
      </div>

      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-full bg-arishina/50 px-5 py-2.5 font-poster text-lg tracking-wide text-theatre/70"
      >
        <Flower2 className="size-4" />
        Tap for flowers (coming soon)
      </button>

      <p className="text-sm text-gandha/60">
        <span lang="kn">ಹೂಮಳೆ</span> · 0 flowers so far
      </p>
    </section>
  )
}
