import { DiamondBand } from './ornaments'

export default function CollabBanner() {
  return (
    <div aria-label="Institutional collaboration credit">
      {/* Top border — same diamond ribbon every section uses */}
      <DiamondBand />

      <div className="bg-background flex flex-col items-center gap-5 px-5 py-8">
        {/* Eyebrow label */}
        <span className="font-serif text-[0.6rem] font-bold uppercase tracking-[0.32em] text-primary/75">
          In Collaboration With
        </span>

        {/* Logo card */}
        <div className="bg-white/95 rounded-lg px-8 py-5 shadow-md shadow-black/50 ring-1 ring-primary/15">
          <img
            src="/hh2026/Innovatiion_collab.png"
            alt="Institution's Innovation Council"
            width={220}
            height={80}
            className="h-16 w-auto object-contain sm:h-20"
            loading="eager"
          />
        </div>
      </div>

      {/* Bottom border */}
      <DiamondBand />
    </div>
  )
}
