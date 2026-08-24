import { ArchSign, DiamondBand } from '@/components/ornaments'

export function RegisterSection() {
  return (
    <section id="register" className="border-b border-primary/15 bg-grain">
      <DiamondBand />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-7 px-5 py-20 text-center">
        <ArchSign
          eyebrow="Registration closes 8 September"
          footnote="Entry is free"
          className="mx-auto"
        >
          <h2 className="max-w-xl font-serif text-3xl leading-tight font-black text-balance text-carved sm:text-4xl">
            Four names. One entry. No second attempt.
          </h2>
        </ArchSign>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Entry is free for NITK students. Squads are capped at 60 — once the
          slots are gone, the trail closes.
        </p>
        <a
          href="https://forms.gle/"
          target="_blank"
          rel="noreferrer"
          className="border border-primary bg-primary px-9 py-4 font-serif text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-colors hover:bg-primary/85"
        >
          Register your squad
        </a>
        <p className="font-serif text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Doubts? Write to asnhunt@nitk.edu.in
        </p>
      </div>
    </section>
  )
}
