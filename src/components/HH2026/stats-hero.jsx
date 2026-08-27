import { ArchSign, DiamondBand } from './ornaments'
import { Coin, CompassRose, Roam } from './roaming-assets'
import { teams, TOTAL_STEPS } from './stats-data'

export function StatsHero() {
  const teamsFinished = teams.filter(
    (t) => t.trail.every((s) => s.unlocked),
  ).length
  const avgProgress =
    Math.round(
      (teams.reduce(
        (sum, t) => sum + t.trail.filter((s) => s.unlocked).length,
        0,
      ) /
        (teams.length * TOTAL_STEPS)) *
        100,
    )

  return (
    <section className="relative bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-144 w-xl -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-16 lg:py-20">
        <Roam
          className="hidden w-16 md:block md:-top-2 md:right-12 lg:w-20"
          motion="float"
          duration="7s"
        >
          <Coin />
        </Roam>
        <Roam
          className="hidden w-12 md:block md:bottom-4 md:left-8 lg:w-16"
          motion="sway"
          duration="6s"
          delay="0.5s"
        >
          <Coin />
        </Roam>
        <CompassRose className="pointer-events-none absolute top-1/2 left-1/2 hidden w-[50%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-[0.07] lg:block" />

        <div className="relative flex flex-col items-center gap-8 text-center">
          <ArchSign eyebrow="Internal Tracker" footnote="Hunt Progress">
            <h1 className="font-serif text-3xl leading-[0.9] font-black tracking-tight text-carved sm:text-4xl lg:text-5xl">
              TEAM
              <br />
              STATS
            </h1>
            <p className="font-serif text-[0.7rem] tracking-[0.26em] text-primary/80 uppercase">
              Live trail progress
            </p>
          </ArchSign>

          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Track every squad's journey through the clue trail. See who's
            cracked the code and who's still on the hunt.
          </p>

          {/* Quick stats */}
          <dl className="grid w-full max-w-md grid-cols-3 gap-6 border-t border-primary/20 pt-6">
            {[
              { label: 'Squads', value: teams.length },
              { label: 'Finished', value: teamsFinished },
              { label: 'Avg Progress', value: `${avgProgress}%` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="font-serif text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
                  {stat.label}
                </dt>
                <dd className="font-serif text-2xl font-bold text-gilded">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <DiamondBand />
    </section>
  )
}

