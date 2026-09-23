import { Sub } from './prefs'

const FRAMES = [
  {
    id: 'kaadu',
    kn: 'ಕಾಡು',
    en: 'The forest',
    text: 'Karnataka has long been called ಗಂಧದ ಗುಡಿ, the temple of sandalwood, home to some of the world’s most prized sandalwood trees.',
  },
  {
    id: 'kale',
    kn: 'ಕಲೆ',
    en: 'The craft',
    text: 'Carvers turned the wood into boxes and figures. In 1916, Mysuru built a factory that turned sandalwood oil into the famous Mysore Sandal soap.',
  },
  {
    id: 'cinema',
    kn: 'ಸಿನಿಮಾ',
    en: 'The cinema',
    text: 'The fragrance became a name. Kannada cinema is called Sandalwood. In 1973, the same year Mysore State became Karnataka, Dr. Rajkumar starred in Gandhada Gudi.',
  },
]

// Scene 4: three film-strip frames. The "smoke into the projector beam"
// visual transition (spec §3 Scene 4) arrives with the hero-effects step;
// this is the static, real-content version.
export function GandhadaGudiScene() {
  return (
    <section id="gandhada-gudi" className="scroll-mt-14 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <Sub
          as="h2"
          kn="ಗಂಧದ ಗುಡಿ"
          en="Why sandalwood"
          className="mb-10 text-center"
          knClassName="font-kn-display text-4xl font-bold sm:text-5xl"
          enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {FRAMES.map((frame) => (
            <article
              key={frame.id}
              className="flex flex-col gap-3 rounded-md border-4 border-heartwood/70 bg-black/30 p-5"
            >
              <div className="flex items-baseline gap-2">
                <span lang="kn" className="font-kn-display text-3xl font-bold text-arishina">{frame.kn}</span>
                <span className="font-poster text-sm tracking-wide text-sandal">{frame.en}</span>
              </div>
              <p className="text-sm leading-relaxed text-gandha/80">{frame.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
