import { Sub } from '@p26/lib/prefs'
import { ACTS } from '@p26/content'

// Scene 5, ನಿಮ್ಮ ಪಾಸ್ · Fan Pass: build order puts this after the theatre
// effects and transliteration work (build plan step 11), so it stays a
// placeholder for now.
export function FanPassScene() {
  return (
    <section
      id="fan-pass"
      className="flex min-h-[70vh] scroll-mt-14 flex-col items-center justify-center gap-3 border-b border-heartwood/40 px-4 py-20 text-center"
    >
      <p className="font-poster text-lg tracking-[0.2em] text-sandal">
        Scene 5 · {ACTS['first-half'].en}
      </p>
      <Sub
        as="h2"
        kn="ಅಭಿಮಾನಿ ಪಾಸ್"
        en="Fan Pass"
        knClassName="font-kn-display text-5xl font-bold leading-tight sm:text-7xl"
        enClassName="font-poster text-2xl tracking-wide text-sandal"
      />
      <p className="text-sm text-gandha/60">Coming soon</p>
    </section>
  )
}
