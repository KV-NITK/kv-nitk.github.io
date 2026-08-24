import { AtSign, Mail, MapPin } from 'lucide-react'
import { HashLink } from 'react-router-hash-link'
import { Rope } from './roaming-assets'

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/hh2026/kannada-vedike-logo.png"
              alt="Kannada Vedike NITK logo"
              width={32}
              height={32}
              className="size-9 shrink-0 rounded-full ring-1 ring-primary/40"
            />
            <p className="font-serif text-base font-bold tracking-[0.18em] text-primary">
              HUDUGATA HUDAKATA
            </p>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            A treasure hunt by Kannada Vedike, NITK Surathkal, inspired by the
            film Avane Srimannarayana. Unofficial and made by fans.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <p className="font-serif text-[0.65rem] tracking-[0.24em] text-primary uppercase">
            Explore
          </p>
          {[
            { href: '#about', label: 'The Legend' },
            { href: '#hunt', label: 'How it runs' },
            { href: '#team', label: 'Keepers' },
          ].map((link) => (
            <HashLink
              smooth
              key={link.href}
              to={`/hh-2026${link.href}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </HashLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className="font-serif text-[0.65rem] tracking-[0.24em] text-primary uppercase">
            Reach us
          </p>
          <a
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <p>Ishitha</p>
          </a>
          <a
            href="tel:+919900262448"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <p>&#9742; +91 9900262448</p>
          </a>
          <a
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <p>Sanjitha</p>
          </a>
          <a
            href="tel:+917090121318"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <p>&#9742; +91 7090121318</p>
          </a>
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Surathkal, Mangaluru 575025
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-serif text-[0.65rem] tracking-[0.24em] text-primary uppercase">
            Starts
          </p>
          <p className="font-serif text-2xl font-bold text-foreground">30 Aug</p>
          <p className="leading-relaxed text-muted-foreground">
            09:00 IST at West Campus. Reach fifteen minutes early — the first
            clue will not wait.
          </p>
        </div>
      </div>

      <div className="border-t border-primary/20">
        <Rope className="mx-auto -mt-4 h-6 w-56 opacity-50" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 font-serif text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Hudugata Hudakata · Kannada Vedike, NITK</p>
          <p>Somewhere on this page, a clue is waiting.</p>
        </div>
      </div>
    </footer>
  )
}
