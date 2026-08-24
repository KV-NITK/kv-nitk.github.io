import { Compass, KeyRound, Map, Trophy } from 'lucide-react'
import { Plaque } from '@/components/ornaments'

const acts = [
  {
    icon: Map,
    act: 'Act I',
    title: 'The Torn Map',
    copy: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet consectetur adipiscing elit quisque faucibus ex. Adipiscing elit quisque faucibus ex sapien vitae pellentesque.',
  },
  {
    icon: Compass,
    act: 'Act II',
    title: 'The Long Chase',
    copy: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet consectetur adipiscing elit quisque faucibus ex. Adipiscing elit quisque faucibus ex sapien vitae pellentesque.',
  },
  {
    icon: KeyRound,
    act: 'Act III',
    title: 'The Vault',
    copy: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet consectetur adipiscing elit quisque faucibus ex. Adipiscing elit quisque faucibus ex sapien vitae pellentesque.',
  },
]

const rules = [
  'Squads of exactly 4 — mix your branches, you will need every brain.',
  'Phones allowed, but stolen answers are disqualification.',
  'No damaging property, no climbing where you should not.',
  'Volunteers in khaki are the referees. Their word is final.',
]

export function LegendSection() {
  return (
    <section id="about" className="border-b border-primary/15">
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Plaque
            eyebrow="The Legend"
            title="A treasure was buried. Then it was forgotten."
          />
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-muted-foreground">
            <p className="text-pretty">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <p className="text-pretty">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <p className="text-pretty">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet consectetur adipiscing elit quisque faucibus ex. Adipiscing elit quisque faucibus ex sapien vitae pellentesque.
            </p>
          </div>
        </div>

        <div id="hunt" className="mt-20 flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-primary/20 pb-4">
            <h3 className="font-serif text-2xl font-bold tracking-[0.06em] uppercase">
              How the hunt runs
            </h3>
            <p className="font-serif text-xs tracking-[0.2em] text-muted-foreground uppercase">
              09:00 → 21:00 · one day only
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {acts.map((act) => (
              <article
                key={act.act}
                className="flex flex-col gap-4 border border-primary/25 bg-card p-6 transition-colors hover:border-primary/60"
              >
                <act.icon
                  className="size-6 text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-[0.65rem] tracking-[0.24em] text-primary uppercase">
                    {act.act}
                  </span>
                  <h4 className="font-serif text-xl font-bold">{act.title}</h4>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {act.copy}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-8 border border-primary/25 bg-secondary/30 p-7 md:grid-cols-[1.3fr_0.7fr]">
            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-lg font-bold tracking-[0.16em] uppercase">
                Hunter&apos;s code
              </h4>
              <ul className="flex flex-col gap-3">
                {rules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-3 leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rotate-45 bg-primary"
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 border-t border-primary/20 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <Trophy
                className="size-6 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="font-serif text-3xl font-black text-primary">
                Rs 67,000
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Split across the first three squads to open the vault, plus
                merch for every finisher.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
