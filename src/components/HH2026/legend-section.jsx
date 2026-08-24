import {
  ArrowRight,
  Gem,
  KeyRound,
  Map,
  MapPin,
  Puzzle,
  Search,
  Trophy,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Plaque, Rivets } from './ornaments'
import {
  FootprintTrail,
  Key,
  Revolver,
  Roam,
  Rope,
  TreasureChest,
  TreasureMap,
} from './roaming-assets'

const steps = [
  { icon: Map, label: 'Get a clue' },
  { icon: Search, label: 'Solve it' },
  { icon: MapPin, label: 'Find the location' },
  { icon: Puzzle, label: 'Next clue' },
  { icon: Gem, label: 'Reach the treasure' },
]

const acts = [
  {
    icon: Map,
    act: 'Round I',
    title: 'West Campus',
    copy: 'Every squad starts here. Crack the trail across West Campus — only the top twenty squads make it through to Round II.',
  },
  {
    icon: KeyRound,
    act: 'Round II',
    title: 'East Campus',
    copy: 'The top twenty squads cross over. The vault is somewhere on East Campus — find it first to take the bounty.',
  },
]

const rules = [
  'Squads of 3 to 4 — mix your branches, you will need every brain.',
  'Phones allowed, but stolen answers are disqualification.',
  'No damaging property, no climbing where you should not.',
  'Volunteers in khaki are the referees. Their word is final.',
]

export function LegendSection() {
  return (
    <section id="about" className="relative border-b border-primary/15">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-4 h-8 overflow-hidden opacity-70"
      >
        <FootprintTrail className="animate-drift" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col gap-8">
            <Plaque eyebrow="The Legend" title="A treasure was buried. Then it was forgotten." />
            <Roam className="relative mx-auto w-full max-w-sm" motion="sway" duration="7s">
              <div className="-rotate-2 border-2 border-primary/50 bg-wood p-2 shadow-xl shadow-black/60">
                <Rivets count={7} className="px-1 pb-2" />
                <TreasureMap className="w-full border border-primary/25" />
              </div>
            </Roam>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-serif text-xl text-primary/90 italic text-pretty">
              &ldquo;Rama Rama&hellip; Thusu Daksha Vrutha Jaripa!&rdquo;
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              The hunt begins with a single clue. Solve it, and it leads you
              to a location — and waiting there is the next one. Every
              answer takes you deeper into a trail of riddles, secrets, and
              surprises, inspired by the adventurous spirit of{' '}
              <span className="text-primary">Avane Srimannarayana</span>.
            </p>
            <p className="font-serif text-xl font-bold text-balance text-foreground text-pretty">
              Follow the clues. Find the locations. Keep the trail alive.
              And uncover where the treasure lies.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-6 border-y border-primary/15 py-7">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-2 px-3 text-center">
                <step.icon className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-serif text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <ArrowRight className="size-4 shrink-0 text-primary/35" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>

        <div id="hunt" className="relative mt-20 flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-primary/20 pb-4">
            <h3 className="font-serif text-2xl font-bold tracking-[0.06em] uppercase">
              How the hunt runs
            </h3>
            <p className="font-serif text-xs tracking-[0.2em] text-muted-foreground uppercase">
              14:00 → 19:00 · one day only
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {acts.map((act, i) => (
              <article
                key={act.act}
                className={cn(
                  'flex flex-col gap-4 px-18 py-12 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]',
                  i % 2 === 0 ? 'bg-pamphlet -rotate-1' : 'bg-pamphlet-alt rotate-1',
                )}
              >
                <act.icon className="text-ink-accent size-6" strokeWidth={2} aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="text-ink-accent font-serif text-[0.65rem] font-bold tracking-[0.24em] uppercase">
                    {act.act}
                  </span>
                  <h4 className="text-ink font-serif text-xl font-bold">{act.title}</h4>
                </div>
                <p className="text-ink font-medium leading-relaxed">{act.copy}</p>
              </article>
            ))}
          </div>

          <div className="relative hidden h-0 sm:block">
            <Roam
              className="w-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:w-80"
              motion="float"
              duration="8s"
              delay="0.5s"
            >
              <Revolver className="rotate-[8deg] opacity-95 drop-shadow-[0_16px_14px_oklch(0_0_0/55%)]" />
            </Roam>
          </div>

          <div className="relative grid gap-8 border border-primary/25 bg-secondary/30 p-7 pt-12 md:grid-cols-2">
            <Rope className="absolute -top-6 right-6 left-6 h-9 animate-sway" />
            <div className="flex flex-col gap-4">
              <h4 className="font-serif text-lg font-bold tracking-[0.16em] uppercase">
                Hunter&apos;s code
              </h4>
              <ul className="flex flex-col gap-3">
                {rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-3 leading-relaxed text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="relative mt-2 size-2 shrink-0 rounded-full bg-black/70 shadow-[0_0_0_2px_oklch(0.79_0.135_79/35%)]"
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex flex-col gap-3 border-t border-primary/20 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <Roam
                className="hidden -top-4 right-0 w-28 -rotate-12 md:block"
                motion="sway"
                duration="6.5s"
              >
                <Key />
              </Roam>
              <Trophy
                className="size-6 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="font-serif text-3xl font-black text-primary">
                Rs 8,500
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Split across the first three squads to open the vault, plus
                merch for every finisher.
              </p>
              <Roam
                className="hidden -right-4 -bottom-6 w-20 rotate-6 opacity-90 md:block"
                motion="float"
                duration="7.5s"
                delay="0.3s"
              >
                <TreasureChest className="drop-shadow-[0_10px_10px_oklch(0_0_0/50%)]" />
              </Roam>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
