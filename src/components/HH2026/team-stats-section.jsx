import {
  CheckCircle2,
  Crown,
  Lock,
  MapPin,
  Scroll,
  Trophy,
  Users,
} from 'lucide-react'
import { Rivets } from './ornaments'
import { FootprintTrail, Key, Roam } from './roaming-assets'
import { teams, TOTAL_STEPS } from './stats-data'

/* ------------------------------------------------------------------ */
/*  Clue Card — parchment scrap showing a revealed clue               */
/* ------------------------------------------------------------------ */
function ClueCard({ clue, variant = 0 }) {
  const bg = variant % 2 === 0 ? 'bg-pamphlet' : 'bg-pamphlet-alt'

  return (
    <div
      className={`${bg} relative px-10 sm:px-14 py-8 sm:py-10 shadow-lg ${variant % 2 === 0 ? '-rotate-[0.8deg]' : 'rotate-[0.8deg]'} transition-transform hover:rotate-0`}
    >
      <Scroll className="absolute top-3 right-4 size-4 text-ink-accent/50" />
      <p className="font-serif text-xs sm:text-sm leading-relaxed text-ink font-bold italic">
        &ldquo;{clue}&rdquo;
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Single step in the vertical trail                                 */
/* ------------------------------------------------------------------ */
function TrailStep({ step, isLast }) {
  const { step: stepNum, clue, location, unlocked } = step

  return (
    <div className="relative flex gap-4 sm:gap-6">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center">
        {/* Step node */}
        <div
          className={`relative z-10 flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full border-2 ${
            unlocked
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground/50'
          }`}
        >
          {unlocked ? (
            stepNum === TOTAL_STEPS - 1 ? (
              <Trophy className="size-5" />
            ) : (
              <span className="font-serif text-sm font-black">{stepNum + 1}</span>
            )
          ) : (
            <Lock className="size-4" />
          )}
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-6 ${
              unlocked ? 'bg-primary/40' : 'bg-muted-foreground/15 border-l border-dashed border-muted-foreground/20'
            }`}
            style={{ minHeight: '1.5rem' }}
          />
        )}
      </div>

      {/* Step content */}
      <div className={`flex-1 pb-8 ${!unlocked ? 'opacity-45' : ''}`}>
        {/* Location header */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin className={`size-4 shrink-0 ${unlocked ? 'text-primary' : 'text-muted-foreground/50'}`} />
          <h4
            className={`font-serif text-sm sm:text-base font-bold tracking-wide uppercase ${
              unlocked ? 'text-foreground' : 'text-muted-foreground/60'
            }`}
          >
            {location}
          </h4>
          {unlocked && (
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0 ml-auto" />
          )}
        </div>

        {/* Clue card or locked message */}
        {unlocked && clue ? (
          <ClueCard clue={clue} variant={stepNum} />
        ) : !unlocked ? (
          <div className="flex items-center gap-2 rounded-sm border border-muted-foreground/15 bg-muted/20 px-4 py-3">
            <Lock className="size-3.5 text-muted-foreground/40" />
            <span className="font-serif text-xs tracking-wider text-muted-foreground/50 uppercase">
              Clue locked — not yet reached
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                      */
/* ------------------------------------------------------------------ */
function ProgressBar({ unlocked, total }) {
  const pct = Math.round((unlocked / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden border border-primary/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/80 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-serif text-xs font-bold tracking-wider text-primary whitespace-nowrap">
        {unlocked}/{total}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Team card                                                         */
/* ------------------------------------------------------------------ */
function TeamCard({ team, rank }) {
  const unlockedCount = team.trail.filter((s) => s.unlocked).length
  const isFinished = unlockedCount === TOTAL_STEPS

  return (
    <article className="relative">
      {/* Rank badge */}
      {rank <= 3 && (
        <div className="absolute -top-3 -left-3 z-20 flex size-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg">
          <span className="font-serif text-xs font-black text-primary">
            #{rank}
          </span>
        </div>
      )}

      {/* Team header — wood panel */}
      <div className="relative border-2 border-primary/50 bg-wood p-5 sm:p-6 shadow-xl">
        <Rivets count={7} className="px-1 pb-3" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {isFinished && <Trophy className="size-5 text-primary" />}
              <h3 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-gilded uppercase">
                {team.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 font-serif text-[0.65rem] tracking-[0.2em] text-primary/80 uppercase">
                <Crown className="size-3.5" />
                {team.leader}
              </span>
              <span className="flex items-center gap-1.5 font-serif text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                <Users className="size-3.5" />
                {team.members.join(' · ')}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <ProgressBar unlocked={unlockedCount} total={TOTAL_STEPS} />
            <p className="mt-1 text-right font-serif text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
              {isFinished ? '✦ Trail Complete' : `${TOTAL_STEPS - unlockedCount} remaining`}
            </p>
          </div>
        </div>

        {/* Corner diamonds */}
        {['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`absolute ${pos} size-3 rotate-45 border border-primary bg-background`}
          />
        ))}
      </div>

      {/* Trail steps */}
      <div className="relative mt-6 ml-2 sm:ml-4">
        {team.trail.map((step, i) => (
          <TrailStep
            key={step.step}
            step={step}
            isLast={i === team.trail.length - 1}
          />
        ))}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/*  Main section                                                      */
/* ------------------------------------------------------------------ */
export function TeamStatsSection() {
  // Sort teams by progress (most unlocked first)
  const sorted = [...teams].sort((a, b) => {
    const aUnlocked = a.trail.filter((s) => s.unlocked).length
    const bUnlocked = b.trail.filter((s) => s.unlocked).length
    return bUnlocked - aUnlocked
  })

  return (
    <section className="relative border-b border-primary/15 bg-parchment py-16 lg:py-24">
      {/* Footprint trail */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-4 h-8 overflow-hidden opacity-70"
      >
        <FootprintTrail className="animate-drift" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-5">
        {/* Section header */}
        <div className="text-center flex flex-col items-center gap-3 border-b-2 border-primary/20 pb-6 mb-12">
          <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Squad-by-Squad Breakdown
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase text-carved tracking-tight">
            The Trail So Far
          </h2>
          <p className="font-serif text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {teams.length} Squads &bull; {TOTAL_STEPS} Locations &bull; One Treasure
          </p>
        </div>

        {/* Decorative key */}
        <Roam
          className="hidden -top-8 right-0 w-24 md:block lg:w-32 lg:-right-8"
          motion="sway"
          duration="8s"
          delay="0.3s"
        >
          <Key />
        </Roam>

        {/* Team cards */}
        <div className="flex flex-col gap-16">
          {sorted.map((team, idx) => (
            <TeamCard key={team.name} team={team} rank={idx + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

