import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'

const links = [
  { href: '#about', label: 'The Legend' },
  { href: '#hunt', label: 'The Hunt' },
  { href: '#team', label: 'Keepers' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/hh2026/kannada-vedike-logo.png"
            alt="Kannada Vedike NITK logo"
            width={32}
            height={32}
            className="size-9 shrink-0 rounded-full ring-1 ring-primary/40"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-sm font-bold tracking-[0.18em] text-primary">
              HUDUGATA HUDAKATA
            </span>
            <span className="hidden font-serif text-[0.6rem] tracking-[0.22em] text-muted-foreground uppercase sm:inline">
              Kannada Vedike · NITK
            </span>
          </span>
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <HashLink
              smooth
              key={link.href}
              to={`/hh-2026${link.href}`}
              className="font-serif text-xs tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              {link.label}
            </HashLink>
          ))}
        </nav>

        <HashLink
          smooth
          to="/hh-2026#register"
          className="border border-primary bg-primary px-4 py-2 font-serif text-xs font-bold tracking-[0.18em] text-primary-foreground uppercase transition-colors hover:bg-primary/85"
        >
          Register
        </HashLink>
      </div>
    </header>
  )
}
