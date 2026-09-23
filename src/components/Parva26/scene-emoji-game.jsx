import { Sub } from './prefs'

// Scene 11: ಯಾವ ಸಿನಿಮಾ? · Which film? Layout only — answer checking,
// scoring and the leaderboard are server-backed (steps 17–18); this shows
// the shape of the game with one sample puzzle, locked.
const SAMPLE_PUZZLE = { emoji: '🌧️🐰💔', index: 1, total: 5 }

export function EmojiGameScene() {
  return (
    <section id="emoji-game" className="flex min-h-[70vh] scroll-mt-14 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Sub
        as="h2"
        kn="ಯಾವ ಸಿನಿಮಾ?"
        en="Which film?"
        knClassName="font-kn-display text-4xl font-bold sm:text-5xl"
        enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
      />

      <div className="w-full max-w-sm rounded-md border-2 border-heartwood bg-heartwood/10 p-6">
        <p className="text-xs text-sandal">
          Puzzle {SAMPLE_PUZZLE.index} of {SAMPLE_PUZZLE.total}
        </p>
        <p className="my-4 text-5xl">{SAMPLE_PUZZLE.emoji}</p>
        <input
          type="text"
          disabled
          placeholder="Your guess (coming soon)"
          className="w-full rounded-sm border border-heartwood bg-theatre px-3 py-2 text-sm text-gandha/70 placeholder:text-gandha/40"
        />
        <p className="mt-3 text-xs text-gandha/50">3 tries · hints cost points · daily leaderboard</p>
      </div>
    </section>
  )
}
