import Image from 'next/image'
import { Countdown } from '@/components/countdown'
import { ArchSign, DiamondBand, Rivets } from '@/components/ornaments'

const facts = [
  { label: 'Date', value: '12 Sept 2026' },
  { label: 'Where', value: 'NITK Surathkal' },
  { label: 'Squad', value: '4 hunters' },
  { label: 'Bounty', value: 'Rs 40,000' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grain">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-144 w-xl -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="flex flex-col items-start gap-7">
          <div className="flex items-center gap-3 border border-primary/40 px-3 py-2">
            <Image
              src="/kannada-vedike-logo.png"
              alt="Kannada Vedike NITK logo"
              width={32}
              height={32}
              className="size-6 shrink-0 rounded-full"
            />
            <p className="font-serif text-[0.65rem] tracking-[0.24em] text-primary uppercase">
              Presented by Kannada Vedike · NITK
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <ArchSign
              eyebrow="Avane Srimannarayana"
              footnote="A search for the one"
            >
              <h1 className="font-serif text-4xl leading-[0.9] font-black tracking-tight text-carved sm:text-5xl lg:text-6xl">
                HUDUGATA
                <br />
                HUDAKATA
              </h1>
              <p className="font-serif text-[0.7rem] tracking-[0.26em] text-primary/80 uppercase">
                The hunt for Amaravathi
              </p>
            </ArchSign>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet consectetur adipiscing elit quisque faucibus ex. Adipiscing elit quisque faucibus ex sapien vitae pellentesque.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#register"
              className="border border-primary bg-primary px-7 py-3.5 font-serif text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-colors hover:bg-primary/85"
            >
              Register your squad
            </a>
            <a
              href="#about"
              className="border border-primary/40 px-7 py-3.5 font-serif text-sm tracking-[0.2em] text-primary uppercase transition-colors hover:border-primary hover:bg-primary/10"
            >
              Read the legend
            </a>
          </div>

          <Countdown />

          <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-5 border-t border-primary/20 pt-6 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1">
                <dt className="font-serif text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
                  {fact.label}
                </dt>
                <dd className="font-serif text-base font-semibold text-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-6 animate-flicker rounded-full bg-primary/15 blur-3xl" />
          <div className="relative border-2 border-primary/60 bg-wood p-2 shadow-2xl shadow-black/60">
            <Rivets count={7} className="px-1 pb-2" />
            <div className="border border-primary/30 p-1.5">
              <Image
                src="/asn-poster.png"
                alt="Avane Srimannarayana film poster with an ornate golden frame"
                width={462} 
                height={648}
                priority
                className="h-auto w-full"
              />
            </div>
            {['-top-2 -left-2', '-top-2 -right-2', '-bottom-2 -left-2', '-bottom-2 -right-2'].map(
              (pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  className={`absolute ${pos} size-3.5 rotate-45 border border-primary bg-background`}
                />
              ),
            )}
          </div>
          <p className="mt-4 text-center font-serif text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
            The legend that started it all
          </p>
        </div>
      </div>

      <DiamondBand />
    </section>
  )
}
