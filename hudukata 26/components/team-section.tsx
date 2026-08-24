import { CrossedFlintlocks, DiamondBand, Plaque } from '@/components/ornaments'

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
    <section id="team" className="border-b border-primary/15 bg-grain">
      <DiamondBand />
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="flex flex-col gap-4">
          <Plaque
            eyebrow="The Keepers"
            title="Five people who already know where everything is hidden"
          />
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Bribes have been attempted. All were declined.
          </p>
        </div>

        <ul className="mt-12 grid gap-px border border-primary/25 bg-primary/20 sm:grid-cols-2 lg:grid-cols-3">
          {crew.map((person) => (
            <li
              key={person.name}
              className="flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-secondary/60"
            >
              <CrossedFlintlocks className="w-11" />
              <div className="flex flex-col gap-1">
                <p className="font-serif text-xl font-bold">{person.name}</p>
                <p className="font-serif text-[0.7rem] tracking-[0.2em] text-primary uppercase">
                  {person.role}
                </p>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {person.note}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
