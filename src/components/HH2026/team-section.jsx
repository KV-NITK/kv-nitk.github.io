import { CrossedFlintlocks, DiamondBand, Plaque } from './ornaments'
import { Coin, Revolver, Roam, TreasureChest } from './roaming-assets'
import { cn } from '../../lib/utils'

const crew = [
  {
    name: 'Abhijit Sogal',
    role: 'Technical Head',
    note: 'Writes the ciphers. Sleeps very little.',
  },
  {
    name: 'Adarsh S',
    role: 'Technical Co-ordinator',
    note: 'Hides every token and remembers all of them.',
  },
  {
    name: 'Abhay Siri',
    role: 'Technical Co-ordinator',
    note: 'Turns a campus into a game board overnight.',
  },
  {
    name: 'Shreyas Y',
    role: 'Technical Team-Member',
    note: 'Responsible for the gold on this page.',
  },
  {
    name: 'Sumit G D',
    role: 'Technical Team-Member',
    note: 'Talks squads into signing up. Usually wins.',
  },
]

export function TeamSection() {
  return (
    <section id="team" className="relative border-b border-primary/15 bg-parchment">
      <DiamondBand />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-20">
        <Roam className="hidden top-0 right-[6%] w-32 xl:block" motion="float" duration="8.5s">
          <Coin />
        </Roam>
        <Roam className="hidden -top-4 left-[2%] w-32 lg:block" motion="sway" duration="7s" delay="0.5s">
          <TreasureChest className="drop-shadow-[0_14px_12px_oklch(0_0_0/50%)]" />
        </Roam>

        <div className="flex flex-col gap-4">
          <Plaque
            eyebrow="The Keepers"
            title="Five people who already know where everything is hidden"
          />
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Bribes have been attempted. All were declined.
          </p>
        </div>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {crew.map((person, i) => (
            <li
              key={person.name}
              className={cn(
                'flex flex-col gap-3 px-16 py-11 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]',
                i % 2 === 0 ? 'bg-pamphlet rotate-1' : 'bg-pamphlet-alt -rotate-1',
              )}
            >
              <CrossedFlintlocks className="text-ink-accent w-11" />
              <div className="flex flex-col gap-1">
                <p className="text-ink font-serif text-xl font-bold">{person.name}</p>
                <p className="text-ink-accent font-serif text-[0.7rem] font-bold tracking-[0.2em] uppercase">
                  {person.role}
                </p>
              </div>
              <p className="text-ink font-medium leading-relaxed">{person.note}</p>
            </li>
          ))}
          <li aria-hidden="true" className="hidden items-center justify-center sm:flex">
            <Roam className="w-48 lg:w-64" motion="float" duration="7s" delay="0.4s">
              <Revolver className="w-full -rotate-[16deg] opacity-90" />
            </Roam>
          </li>
        </ul>
      </div>
    </section>
  )
}
