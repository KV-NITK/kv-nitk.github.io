import { Link } from 'react-router-dom'
import { ArchSign, DiamondBand } from './ornaments'
import { Roam, Rope, TreasureChest } from './roaming-assets'

const REGISTRATION_OPEN = false

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
            eyebrow={REGISTRATION_OPEN ? "Registration closes 26 August" : "Registration is closed"}
            footnote="Entry is free"
            className="mx-auto"
          >
            <h2 className="max-w-xl font-serif text-3xl leading-tight font-black text-balance text-carved sm:text-4xl">
              {REGISTRATION_OPEN
                ? '3 to 4 names. One entry. No second attempt.'
                : 'The trail awaits.'}
            </h2>
          </ArchSign>
        </div>

        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          {REGISTRATION_OPEN ? (
            <>
              Entry is free for NITK students. Squads of 3 to 4 (must contain at
              least <strong>1 Kannadiga</strong> and at least{' '}
              <strong>1 Non-Kannadigas</strong>). Slots are capped — once
              they're gone, the trail closes.
            </>
          ) : (
            <>
              Registration has closed. Gather your squad and begin the hunt.
            </>
          )}
        </p>

        <div className="relative">
          <Link
            to='/hh-2026/play'
            className="clip-torn relative border border-primary bg-primary px-9 py-5 pt-9 font-serif text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-colors hover:bg-primary/85"
          >
            {REGISTRATION_OPEN ? 'Register your squad' : 'Play'}
          </Link>
        </div>
      </div>
    </section>
  )
}