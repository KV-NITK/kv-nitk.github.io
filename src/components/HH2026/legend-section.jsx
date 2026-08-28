import {
  ArrowRight,
  CheckCircle2,
  Drama,
  Flower2,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldAlert,
  Trophy,
  Users,
  Waves,
} from 'lucide-react'
import { Plaque, Rivets } from './ornaments'
import {
  FootprintTrail,
  Roam,
  Rope,
  TreasureMap,
} from './roaming-assets'

const eligibilityRules = [
  'TEAM SIZE: MIN 3 & MAX 4 MEMBERS',
  'WHO CAN READ AND UNDERSTAND KANNADA IS A MUST (MOST OF THE CLUES ARE RELATED TO KANNADA).',
  'EACH TEAM MUST HAVE AT LEAST ONE NON-KANNADIGA.',
]

const generalRulesList = [
  'BE THERE ON TIME, SO THAT YOU CAN HAVE FUN FINDING THE TREASURE.',
  'THE CLUES ARE TO BE FOUND IN PARTICULAR ORDER AS PROVIDED. NO CLUE CAN BE SKIPPED.',
  'ENTIRE TEAM MUST STAY TOGETHER THROUGHOUT THE GAME TO GET THE NEXT CLUE AT EVERY LOCATION.',
  'ALL ELIGIBLE ENTRIES WILL BE JUDGED AND DISREGARDING THE RULES MAY RESULT IN DISQUALIFICATION OF THE ENTIRE TEAM.',
  'BICYCLES OR ANY VEHICLES CANNOT BE USED.',
  'DECISION OF THE ORGANIZERS WILL BE FINAL.',
]

const trailSigns = [
  {
    id: 'samudra',
    icon: Waves,
    image: '/samudramanthana.png',
    title: 'Samudra Manthana',
    caption: 'The churning that started it all — the ocean gave up its secrets once, and it will again.',
    variant: 'bg-pamphlet',
    rotate: '-rotate-1 hover:rotate-0',
  },
  {
    id: 'parijata',
    icon: Flower2,
    image: '/parijata.png',
    title: 'The Parijata',
    caption: 'A celestial bloom said to grant any wish to whoever carries it home — the relic worth chasing.',
    variant: 'bg-pamphlet-alt',
    rotate: 'rotate-1 hover:rotate-0',
  },
  {
    id: 'yakshagana',
    icon: Drama,
    image: '/yakshagana.png',
    title: 'The Yakshagana Mask',
    caption: "The trail's silent guardian, watching from the shadows of every stage.",
    variant: 'bg-pamphlet',
    rotate: '-rotate-1 hover:rotate-0',
  },
]

const thingsToBring = [
  'FULLY CHARGED MOBILE PHONES',
  'WATER BOTTLES',
  'POWER BANK',
  'UMBRELLA',
  'GET A PEN ALONG WITH YOU (MIGHT HELP TO DECODE THE CLUE).',
  'ENTHUSIASM TO HAVE FUN AND WIN TREASURE!',
]

export function LegendSection() {
  return (
    <section id="about" className="relative border-b border-primary/15 bg-parchment py-16 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-4 h-8 overflow-hidden opacity-70"
      >
        <FootprintTrail className="animate-drift" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5">
        {/* Intro Legend */}
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
          <div className="flex flex-col gap-5 justify-center">
            <p className="font-serif text-xl text-primary/90 italic text-pretty">
              &ldquo;Rama Rama&hellip; Thusu Daksha Vrutha Jaripa!&rdquo;
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              The hunt begins with a single clue. Solve it, and it leads you to a location — and waiting there is the next one. Every answer takes you deeper into a trail of riddles, secrets, and surprises, inspired by the adventurous spirit of{' '}
              <span className="text-primary font-bold">Avane Srimannarayana</span>.
            </p>
            <p className="font-serif text-xl font-bold text-balance text-foreground text-pretty">
              Follow the clues. Find the locations. Keep the trail alive. And uncover where the treasure lies.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SIGNS ALONG THE TRAIL — mythology motifs hidden in the hunt */}
        {/* ---------------------------------------------------- */}
        <div className="mt-20 flex flex-col gap-8">
          <div className="text-center flex flex-col items-center gap-3 border-b-2 border-primary/20 pb-6">
            <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Watch For These
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase text-carved tracking-tight">
              Signs Along the Trail
            </h2>
            <p className="font-serif text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase max-w-2xl text-pretty">
              Old myths hide in plain sight on the hunt&rsquo;s map. Know them now, and you&rsquo;ll recognize them when they surface.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {trailSigns.map(({ id, icon: Icon, image, title, caption, variant, rotate }) => (
              <div
                key={id}
                className={`${variant} px-6 py-8 shadow-xl flex flex-col items-center gap-4 text-center ${rotate} transition-transform`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-5 text-ink-accent shrink-0" />
                  <h3 className="font-serif text-lg font-bold text-ink-accent uppercase">
                    {title}
                  </h3>
                </div>
                <img
                  src={image}
                  alt={title}
                  className="h-32 w-32 object-contain drop-shadow-lg"
                  loading="lazy"
                />
                <p className="text-xs sm:text-sm font-bold leading-relaxed text-ink text-pretty">
                  {caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* OFFICIAL RULEBOOK & EVENT STRUCTURE SECTION */}
        {/* ---------------------------------------------------- */}
        <div id="hunt" className="relative mt-20 flex flex-col gap-12">
          {/* Section Plaque Header */}
          <div className="text-center flex flex-col items-center gap-3 border-b-2 border-primary/20 pb-6">
            <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Official Regulations & Guidelines
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase text-carved tracking-tight">
              Event Rulebook
            </h2>
            <p className="font-serif text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Think &bull; Decipher &bull; Explore &bull; Together
            </p>
          </div>

          {/* 1. TEAM ELIGIBILITY & WHATSAPP CTA BANNER */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Eligibility Card */}
            <div className="bg-pamphlet px-16 sm:px-24 md:px-28 lg:px-32 py-16 sm:py-22 md:py-26 shadow-xl flex flex-col gap-4 -rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3 border-b border-[#8b5a2b]/30 pb-3">
                <Users className="size-6 text-ink-accent shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-accent uppercase">
                  Team Eligibility
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {eligibilityRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold leading-relaxed text-ink">
                    <CheckCircle2 className="size-4 text-ink-accent shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp Group & Updates Banner */}
            <div className="bg-pamphlet-alt px-16 sm:px-24 md:px-28 lg:px-32 py-16 sm:py-22 md:py-26 shadow-xl flex flex-col justify-between gap-4 rotate-1 hover:rotate-0 transition-transform">
              <div>
                <div className="flex items-center gap-3 border-b border-[#8b5a2b]/30 pb-3">
                  <MessageCircle className="size-6 text-emerald-800 shrink-0" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-accent uppercase">
                    Official WhatsApp Group
                  </h3>
                </div>
                <p className="mt-3 text-xs sm:text-sm font-bold text-ink leading-relaxed">
                  STAY UPDATED ON OUR SOCIAL MEDIA & THE WHATSAPP GROUP OF THE EVENT!
                </p>
              </div>

              <a
                href="https://chat.whatsapp.com/EqzxIHeU7Ol9AYZcfbFSUW?s=sw&p=a&ilr=1"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-serif text-xs font-bold tracking-wider uppercase px-5 py-3 rounded shadow-md transition-all transform hover:scale-105"
              >
                <span>Join Event WhatsApp Group</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          {/* 2. EVENT STRUCTURE (ROUND 1 & ROUND 2) */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-2xl font-bold tracking-[0.08em] text-carved uppercase border-b border-primary/20 pb-2">
              Event Structure
            </h3>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Round 1 Card */}
              <article className="bg-pamphlet px-16 sm:px-24 md:px-28 lg:px-32 py-16 sm:py-22 md:py-26 shadow-xl flex flex-col gap-4 -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between border-b border-[#8b5a2b]/30 pb-3">
                  <span className="font-serif text-xs font-bold tracking-[0.24em] text-ink-accent uppercase">
                    Round 1
                  </span>
                  <MapPin className="size-5 text-ink-accent" />
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink-accent uppercase">
                  East Campus Trail
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-ink font-bold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-ink-accent font-bold">&bull;</span>
                    <span>EVERY REGISTERED TEAM MEETING ELIGIBILITY CRITERIA IS ELIGIBLE FOR ROUND 1.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ink-accent font-bold">&bull;</span>
                    <span>EACH CLUE REFERS TO A PLACE IN NITK EAST CAMPUS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ink-accent font-bold">&bull;</span>
                    <span>PARTICIPANTS SHOULD DECIPHER THE CLUES TO SOLVE THE QUESTION TO FIND THE LOCATION TO THE NEXT CLUE.</span>
                  </li>
                  <li className="flex items-start gap-2 text-ink-accent font-black">
                    <span className="text-ink-accent font-bold">&bull;</span>
                    <span>TOP 10 TEAMS WILL BE SELECTED TO ROUND 2.</span>
                  </li>
                </ul>
              </article>

              {/* Round 2 Card */}
              <article className="bg-pamphlet-alt px-16 sm:px-24 md:px-28 lg:px-32 py-16 sm:py-22 md:py-26 shadow-xl flex flex-col gap-4 rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between border-b border-[#8b5a2b]/30 pb-3">
                  <span className="font-serif text-xs font-bold tracking-[0.24em] text-ink-accent uppercase">
                    Round 2
                  </span>
                  <Trophy className="size-5 text-ink-accent" />
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink-accent uppercase">
                  The Final Bounty
                </h4>
                <div className="flex flex-col gap-3 text-xs sm:text-sm text-ink font-bold leading-relaxed">
                  <p>
                    FURTHER INSTRUCTIONS WILL BE PROVIDED AFTER YOU QUALIFY ROUND 1.
                  </p>
                  <div className="mt-2 border-t border-[#8b5a2b]/30 pt-3">
                    <p className="line-through font-serif text-xl sm:text-2xl font-black text-ink-accent" >
                      Rs 10,000
                    </p>
                    <p className="font-serif text-xl sm:text-2xl font-black text-ink-accent" >
                      Rs 15,000 worth Bounty!
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Awarded to top qualifying squads to open the vault.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* 3. GENERAL RULES & THINGS TO BRING */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* General Rules */}
            <div className="bg-pamphlet px-16 sm:px-24 md:px-28 lg:px-32 py-16 sm:py-22 md:py-26 shadow-xl flex flex-col gap-4 -rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3 border-b border-[#8b5a2b]/30 pb-3">
                <ShieldAlert className="size-6 text-ink-accent shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-accent uppercase">
                  General Rules
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {generalRulesList.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold leading-relaxed text-ink">
                    <span className="text-ink-accent font-bold mt-0.5">&bull;</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Things to Bring */}
            <div className="bg-pamphlet-alt px-16 sm:px-24 md:px-28 lg:px-32 py-16 sm:py-22 md:py-26 shadow-xl flex flex-col gap-4 rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3 border-b border-[#8b5a2b]/30 pb-3">
                <PackageCheck className="size-6 text-ink-accent shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-accent uppercase">
                  Things to Bring – Be Prepared, Be Awesome!
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {thingsToBring.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold leading-relaxed text-ink">
                    <CheckCircle2 className="size-4 text-emerald-800 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Motto Banner */}
          <div className="relative border-2 border-primary/50 bg-wood p-6 shadow-xl text-center rounded-sm">
            <Rope className="absolute -top-6 right-6 left-6 h-9 animate-sway" />
            <Rivets count={9} className="px-1 pb-3" />
            <p className="font-serif text-xl sm:text-2xl font-black uppercase text-[#f7eed6] tracking-[0.2em] drop-shadow-md">
              THINK &bull; DECIPHER &bull; EXPLORE &bull; TOGETHER
            </p>
            <p className="mt-2 font-serif text-lg font-bold text-primary tracking-widest uppercase">
              FIND THE TREASURE!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
