import { Lock } from 'lucide-react'
import { Sub } from './prefs'
import { GUESTS } from './data'

function formatRevealDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
}

function GuestCard({ guest }) {
  const revealed = Boolean(guest.name)

  if (!revealed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-heartwood bg-heartwood/10 p-6 text-center">
        <Lock className="size-6 text-sandal" />
        <p className="text-sm text-gandha/70">Reveals {formatRevealDate(guest.revealDate)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border-2 border-heartwood bg-heartwood/20 p-6">
      <p lang="kn" className="font-kn-display text-2xl font-bold text-arishina">{guest.name}</p>
      <p className="font-poster text-sm tracking-wide text-sandal">{guest.role}</p>
      <p className="text-sm text-gandha/80">{guest.line}</p>
    </div>
  )
}

// Scene 7: ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance. Names come from GUESTS for
// now; step 16 moves this to a server call so unrevealed guests never ship
// in the page's own code (spec §3 Scene 7).
export function GuestsScene() {
  return (
    <section id="guests" className="scroll-mt-14 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <Sub
          as="h2"
          kn="ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ"
          en="Special Appearance"
          className="mb-10 text-center"
          knClassName="font-kn-display text-4xl font-bold sm:text-5xl"
          enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {GUESTS.map((guest) => (
            <GuestCard key={guest.id} guest={guest} />
          ))}
        </div>
      </div>
    </section>
  )
}
