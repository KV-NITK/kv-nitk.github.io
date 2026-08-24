import Image from 'next/image'
import { Coins, Compass, Flame, Footprints, KeyRound, ScrollText } from 'lucide-react'
import { Plaque, Rivets } from '@/components/ornaments'

const exhibits = [
  {
    icon: ScrollText,
    tag: 'Exhibit I',
    title: 'The torn map',
    line: 'Four fragments. Three are already on campus.',
  },
  {
    icon: Compass,
    tag: 'Exhibit II',
    title: "Narayana's compass",
    line: 'Points at the sea, which is never the answer.',
  },
  {
    icon: KeyRound,
    tag: 'Exhibit III',
    title: 'The brass key',
    line: 'Opens one door in the old block. Only one.',
  },
  {
    icon: Flame,
    tag: 'Exhibit IV',
    title: 'The oil lamp',
    line: 'Some ink only shows up when it is warm.',
  },
  {
    icon: Footprints,
    tag: 'Exhibit V',
    title: 'Muddy footprints',
    line: 'They stop at the banyan and do not come back.',
  },
  {
    icon: Coins,
    tag: 'Exhibit VI',
    title: 'A single gold coin',
    line: 'Left behind on purpose. Consider it a promise.',
  },
]

export function GallerySection() {
  return (
    <section id="gallery" className="border-b border-primary/15">
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Plaque eyebrow="Gallery" title="The clue vault" />
          <p className="max-w-sm leading-relaxed text-muted-foreground text-pretty">
            Every artifact below turns up somewhere on campus on hunt day.
            Photographs from the chase get pinned here after 12 September.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <figure className="relative mx-auto w-full max-w-sm border-2 border-primary/40 bg-wood p-2 lg:max-w-none">
            <Rivets count={7} className="px-1 pb-2" />
            <Image
              src="/asn-poster.png"
              alt="Ornately framed Avane Srimannarayana poster displayed as the vault centrepiece"
              width={462}
              height={648}
              className="h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-2 bottom-2 bg-background/85 p-3 font-serif text-[0.65rem] tracking-[0.2em] text-primary uppercase">
              The relic that started the trail
            </figcaption>
          </figure>

          <ul className="grid gap-px bg-primary/20 sm:grid-cols-2">
            {exhibits.map((exhibit) => (
              <li
                key={exhibit.tag}
                className="group flex flex-col justify-between gap-6 bg-card p-6 transition-colors hover:bg-secondary/60"
              >
                <exhibit.icon
                  className="size-7 text-primary transition-transform duration-500 group-hover:-rotate-12"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="font-serif text-[0.6rem] tracking-[0.24em] text-primary/70 uppercase">
                    {exhibit.tag}
                  </span>
                  <h3 className="font-serif text-lg font-bold">
                    {exhibit.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {exhibit.line}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
