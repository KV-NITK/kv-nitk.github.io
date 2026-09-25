import { En } from '@p26/lib/prefs'
import { ASSET_CREDITS, CONTACT } from '@p26/content'
import { cn } from '@/lib/utils'
import { GLOW } from '@p26/scenes/12-credits/glow'

// The very end of the roll, smaller: what we used, and how to reach us.
export function SmallPrint({ subtitles }) {
  const policies = CONTACT.policies.filter((p) => p.href)
  return (
    <div className="w-full max-w-lg space-y-8 text-sm">
      <div>
        <p className={cn('font-poster tracking-[0.25em] opacity-80', GLOW)}>Also on screen</p>
        <ul className="mt-2 space-y-1.5">
          {ASSET_CREDITS.map((a) => (
            <li key={a.what} className={cn('leading-snug opacity-80', GLOW)}>
              <span className="font-semibold">{a.what}:</span> {a.who}
              {a.licence && <span className="opacity-75"> ({a.licence})</span>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p lang="kn" className={cn('font-kn-display text-base font-semibold', GLOW)}>
          ಸಂಪರ್ಕ<En className="font-kn-body"> · Contact</En>
        </p>
        <ul className="mt-2 space-y-1">
          {CONTACT.people.map((p) => (
            <li key={p.email} className={cn('opacity-85', GLOW)}>
              {p.name}, {p.role} ·{' '}
              <a href={`mailto:${p.email}`} className="underline decoration-[#f1dfc0]/40 underline-offset-2 focus-visible:outline-2 focus-visible:outline-arishina">
                {p.email}
              </a>
            </li>
          ))}
        </ul>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {CONTACT.social.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex min-h-11 items-center underline decoration-[#f1dfc0]/40 underline-offset-2 focus-visible:outline-2 focus-visible:outline-arishina', GLOW)}>
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        {policies.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4">
            {policies.map((p) => (
              <li key={p.name}>
                <a href={p.href} className={cn('inline-flex min-h-11 items-center underline decoration-[#f1dfc0]/40 underline-offset-2', GLOW)}>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className={cn('mt-3 opacity-70', GLOW)}>Kannada Vedike, NITK Surathkal · ಕನ್ನಡ ವೇದಿಕೆ, ಎನ್‌ಐಟಿಕೆ ಸುರತ್ಕಲ್</p>
      </div>
    </div>
  )
}
