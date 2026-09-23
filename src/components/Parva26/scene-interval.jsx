import { Sub } from './prefs'
import { MEAL_SLOTS, MENU_ITEMS, MERCH_ITEMS } from './data'
import { cn } from '../../lib/utils'

function SlotBar({ slot }) {
  const full = slot.booked >= slot.capacity
  const pct = Math.min(100, Math.round((slot.booked / slot.capacity) * 100))

  return (
    <div className="rounded-md border border-heartwood bg-heartwood/10 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gandha/90">{slot.label}</span>
        {full ? (
          <span className="rounded-sm bg-kumkuma px-2 py-0.5 font-poster text-xs tracking-widest text-projector">
            HOUSEFULL
          </span>
        ) : (
          <span className="text-sandal">{slot.capacity - slot.booked} seats left</span>
        )}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
        <div
          className={cn('h-full rounded-full', full ? 'bg-kumkuma' : 'bg-arishina')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!full && (
        <button
          type="button"
          className="mt-3 w-full rounded-full bg-arishina py-1.5 font-poster text-base text-theatre hover:bg-projector"
        >
          Book
        </button>
      )}
    </div>
  )
}

function MerchCard({ item }) {
  return (
    <div className="relative flex flex-col gap-1 rounded-md border-2 border-heartwood bg-heartwood/10 p-4">
      {item.soldOut && (
        <span className="absolute right-3 top-3 rounded-sm bg-kumkuma px-2 py-0.5 font-poster text-xs tracking-widest text-projector">
          HOUSEFULL
        </span>
      )}
      <p className="font-kn-display text-lg font-semibold text-gandha">{item.name}</p>
      <p className="text-sm">
        <span className="text-arishina">{item.price}</span>
        {item.fdfsPrice && (
          <span className="ml-2 text-xs text-sandal">FDFS price {item.fdfsPrice}</span>
        )}
      </p>
    </div>
  )
}

// Scene 8: ವಿರಾಮ · Interval — Bhoori Bhojana meal slots and Parva Angadi
// merch (spec §3 Scene 8).
export function IntervalScene() {
  return (
    <section id="interval" className="scroll-mt-14 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <Sub
          as="h2"
          kn="ವಿರಾಮ"
          en="Interval"
          className="mb-12 text-center"
          knClassName="font-kn-display text-5xl font-bold sm:text-6xl"
          enClassName="mt-1 font-poster text-lg tracking-wide text-sandal"
        />

        <div className="mb-16">
          <Sub
            as="h3"
            kn="ಬಾಳೆ ಎಲೆ ಊಟ"
            en="A full meal on a banana leaf"
            className="mb-4"
            knClassName="font-kn-display text-2xl font-bold text-arishina"
            enClassName="text-sm text-sandal"
          />
          <ul className="mb-6 flex flex-wrap gap-2">
            {MENU_ITEMS.map((item) => (
              <li key={item} lang="kn" className="rounded-full border border-heartwood px-3 py-1 text-sm text-gandha/80">
                {item}
              </li>
            ))}
          </ul>
          <div className="grid gap-4 sm:grid-cols-3">
            {MEAL_SLOTS.map((slot) => (
              <SlotBar key={slot.id} slot={slot} />
            ))}
          </div>
        </div>

        <div>
          <Sub
            as="h3"
            kn="ಪರ್ವ ಅಂಗಡಿ"
            en="Merch"
            className="mb-4"
            knClassName="font-kn-display text-2xl font-bold text-arishina"
            enClassName="text-sm text-sandal"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {MERCH_ITEMS.map((item) => (
              <MerchCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
