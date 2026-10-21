import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { PROGRAMME } from '@p26/content'
import { useCurrentScene } from '@p26/lib/use-current-scene'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

// The programme: links to the parts people come for (PROGRAMME), so nobody
// has to scroll the whole show to find them. On a laptop it is a row of
// painted lettering in the top bar; on a phone, a brass button that opens
// a printed programme card under the bar. The part on screen is underlined.
// The food-and-merch link is a Book link, so the interval lands it past the
// doors.

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina'

export function ProgrammeRow() {
  const { subtitles } = usePrefs()
  const current = useCurrentScene()
  return (
    <nav aria-label="Programme" className="pointer-events-auto mx-auto hidden lg:block">
      <ul className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,220,170,.12)] backdrop-blur-[2px]">
        {PROGRAMME.map((item) => {
          const here = current?.id === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={here ? 'location' : undefined}
                data-en={item.en}
                className={cn('group relative flex flex-col items-center rounded-full px-3 py-1 text-center leading-none', focusRing)}
              >
                <span lang="kn" className={cn('font-kn-display text-[0.95rem] font-bold transition-colors', here ? 'text-arishina' : 'text-gandha/85 group-hover:text-arishina')}>
                  {item.kn}
                </span>
                <span lang="en" className={cn('mt-0.5 font-poster text-[0.7rem] tracking-widest text-gandha/55', !subtitles && 'sr-only')}>
                  {item.en}
                </span>
                <span aria-hidden className={cn('absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-arishina transition-transform duration-200', here ? 'scale-x-100' : 'scale-x-0')} />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function ProgrammeButton() {
  const { subtitles } = usePrefs()
  const current = useCurrentScene()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  // Tapping outside the card, or Escape, closes it.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="pointer-events-auto lg:hidden">
      <button
        type="button"
        aria-label="Programme"
        aria-expanded={open}
        aria-controls="p26-programme"
        data-en="Programme · jump to a part of the show"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative grid size-10 cursor-pointer place-items-center rounded-[3px] sm:size-11',
          'shadow-[inset_0_1px_0_rgba(255,248,220,.6),inset_0_-1px_0_rgba(60,35,5,.6),0_3px_8px_rgba(0,0,0,.55)]',
          focusRing
        )}
        style={brass}
      >
        {/* Three engraved lines, the middle one shorter, like a printed list */}
        <span aria-hidden className="flex w-5 flex-col gap-[4px]">
          {['w-full', 'w-3/4', 'w-full'].map((w, i) => (
            <span
              key={i}
              className={cn('h-[2.5px] rounded-full bg-[#4a3208] shadow-[0_1px_0_rgba(255,240,200,.5)] transition-transform duration-200', w, open && i === 1 && 'scale-x-0', open && i === 0 && 'translate-y-[6.5px] rotate-45', open && i === 2 && '-translate-y-[6.5px] -rotate-45')}
            />
          ))}
        </span>
      </button>

      <nav
        id="p26-programme"
        aria-label="Programme"
        hidden={!open}
        className="absolute inset-x-3 top-[4.25rem] mx-auto max-w-sm rounded-[3px] bg-[#efe2c4] px-5 pb-4 pt-3 text-theatre shadow-[0_18px_40px_rgba(0,0,0,.7)] bg-blend-multiply sm:inset-x-5 sm:top-[4.75rem]"
        style={paper}
      >
        <p className="border-b border-dashed border-theatre/30 pb-2 text-center">
          <span lang="kn" className="font-kn-display text-sm font-bold tracking-wider">ಕಾರ್ಯಕ್ರಮ ಪಟ್ಟಿ</span>
          <span lang="en" className={cn('ml-2 font-poster text-sm tracking-[0.25em] text-theatre/60', !subtitles && 'sr-only')}>PROGRAMME</span>
        </p>
        <ol className="mt-1">
          {PROGRAMME.map((item, i) => {
            const here = current?.id === item.id
            return (
              <li key={item.id} className="border-b border-dotted border-theatre/20 last:border-0">
                <a
                  href={`#${item.id}`}
                  aria-current={here ? 'location' : undefined}
                  onClick={() => setOpen(false)}
                  className={cn('flex min-h-12 items-center gap-3 py-1.5', focusRing)}
                >
                  <span className="w-5 font-typewriter text-sm text-theatre/50">{i + 1}.</span>
                  <span className="flex-1 leading-tight">
                    <span lang="kn" className={cn('block font-kn-display text-lg font-bold', here && 'text-[#9b1b2a]')}>{item.kn}</span>
                    <span lang="en" className={cn('block font-poster text-sm tracking-widest text-theatre/60', !subtitles && 'sr-only')}>{item.en}</span>
                  </span>
                  {here && <span aria-hidden className="size-2 rounded-full bg-[#9b1b2a]" />}
                </a>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
