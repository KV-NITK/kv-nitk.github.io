import { Link } from 'react-router-dom'
import { ArchSign, DiamondBand } from './ornaments'
import { Roam, Rope, TreasureChest } from './roaming-assets'

export function RegisterSection() {
  return (
    <section id="register" className="relative border-b border-primary/15 bg-parchment">
      <DiamondBand />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-7 px-5 py-20 text-center">
        <Roam
          className="hidden w-40 md:block md:top-8 md:right-[4%] lg:w-52 lg:right-[8%]"
          motion="float"
          duration="7s"
        >
          <TreasureChest className="drop-shadow-[0_16px_14px_oklch(0_0_0/55%)]" />
        </Roam>

        <div className="relative">
          <Rope className="absolute -top-4 -left-16 hidden w-28 -rotate-[70deg] sm:block animate-sway" />
          <Rope className="absolute -top-4 -right-16 hidden w-28 rotate-[70deg] sm:block animate-sway" />
          <ArchSign
            eyebrow="Registration closes 26 August"
            footnote="Entry is free"
            className="mx-auto"
          >
            <h2 className="max-w-xl font-serif text-3xl leading-tight font-black text-balance text-carved sm:text-4xl">
              3 to 4 names. One entry. No second attempt.
            </h2>
          </ArchSign>
        </div>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Entry is free for NITK students. Squads are capped at 60 — once the
          slots are gone, the trail closes.
        </p>

        <div className="relative">
          <Link
            to="/team-registration"
            className="clip-torn relative border border-primary bg-primary px-9 py-5 pt-9 font-serif text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-colors hover:bg-primary/85"
          >
            Register your squad
          </Link>
        </div>

        <p className="font-serif text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Doubts? Write to asnhunt@nitk.edu.in
        </p>
      </div>
    </section>
  )
}
