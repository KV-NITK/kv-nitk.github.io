import { Sub } from './prefs'
import { CREDITS } from './data'

// Scene 12: credits roll, ಶುಭಂ, and the footer (spec §3 Scene 12).
export function CreditsScene() {
  return (
    <section id="credits" className="scroll-mt-14 px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <dl className="mb-16 space-y-4 text-center">
          {CREDITS.map((row) => (
            <div key={row.role}>
              <dt lang="kn" className="font-kn-display text-sm tracking-wide text-sandal">{row.role}</dt>
              <dd className="text-lg text-gandha/90">{row.people.join(', ')}</dd>
            </div>
          ))}
        </dl>

        <p lang="kn" className="mb-16 text-center text-base text-gandha/80">
          ಅಭಿಮಾನಿ ದೇವರುಗಳಿಗೆ ಧನ್ಯವಾದ
        </p>

        <div className="text-center">
          <p lang="kn" className="font-kn-display text-7xl font-extrabold text-arishina sm:text-8xl">ಶುಭಂ</p>
          <p lang="kn" className="mt-2 text-lg text-sandal">ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ</p>
        </div>

        <footer className="mt-20 flex flex-col items-center gap-2 border-t border-heartwood/40 pt-8 text-sm text-gandha/60">
          <p>Kannada Vedike, NITK Surathkal</p>
          <div className="flex gap-4">
            <a href="/" className="hover:text-gandha">Home</a>
            <a href="/events" className="hover:text-gandha">Events</a>
            <a href="/social" className="hover:text-gandha">Social</a>
          </div>
        </footer>
      </div>
    </section>
  )
}
