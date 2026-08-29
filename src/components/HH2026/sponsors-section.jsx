import { DiamondBand } from './ornaments'

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative border-b border-primary/15 bg-parchment">
      <DiamondBand />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-16 flex flex-col items-center gap-14">

        {/* ── Group 1: Presented in collaboration with ── */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Presented in collaboration with
            </span>
            <div className="mt-1 h-px w-24 bg-primary/30" />
          </div>

          <div className="flex justify-center">
            <div className="bg-white/90 rounded-xl px-10 py-7 shadow-lg shadow-black/40 ring-1 ring-primary/20 transition-transform hover:scale-[1.03]">
              <img
                src="/hh2026/Innovatiion_collab.png"
                alt="Institution's Innovation Council"
                className="h-28 sm:h-36 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-primary/20" />
          <span className="font-serif text-[0.6rem] font-bold uppercase tracking-[0.35em] text-primary/50 shrink-0">
            ✦ ✦ ✦
          </span>
          <div className="flex-1 h-px bg-primary/20" />
        </div>

        {/* ── Group 2: Event Sponsors ── */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Event Sponsors
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase text-carved tracking-tight">
              Our Supporters
            </h2>
            <div className="mt-1 h-px w-24 bg-primary/30" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {/* Sponsor 1 — 7th Heaven */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white/90 rounded-xl px-8 py-6 shadow-lg shadow-black/40 ring-1 ring-primary/20 transition-transform hover:scale-[1.03]">
                <img
                  src="/hh2026/sponsor_1.png"
                  alt="7th Heaven"
                  className="h-20 sm:h-24 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <p className="font-serif text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                7th Heaven
              </p>
            </div>

            {/* Sponsor 2 — Spin Unisex Salon */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white/90 rounded-xl px-8 py-6 shadow-lg shadow-black/40 ring-1 ring-primary/20 transition-transform hover:scale-[1.03]">
                <img
                  src="/hh2026/sponsor_2.PNG"
                  alt="Spin Unisex Salon"
                  className="h-20 sm:h-24 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <p className="font-serif text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                Spin Unisex Salon
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
