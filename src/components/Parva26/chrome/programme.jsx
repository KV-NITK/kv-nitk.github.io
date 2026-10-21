import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { PROGRAMME } from '@p26/content'
import { useCurrentScene } from '@p26/lib/use-current-scene'
import { Bulbs } from '@p26/ui/bulbs'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import clapper from '@p26/assets/emoji/1f3ac.svg'

// The programme: links to the parts people come for (PROGRAMME), so nobody
// has to scroll the whole show to find them. On a laptop it is a row of
// painted lettering in the top bar; on a phone, a brass button that opens
// a printed programme card under the bar. The part on screen is underlined.
// The food-and-merch link is a Book link, so the interval lands it past the
// doors. Guests and Games each hold two parts: on a laptop they open a small
// card to pick one; on a phone the two are listed under their heading.

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina'

const isHere = (item, current) => (item.scenes ?? [item.id]).includes(current?.id)

// Tapping outside `ref`, or Escape, calls `close` while `open`.
function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && close()
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, close])
}

export function ProgrammeRow() {
  const { subtitles } = usePrefs()
  const current = useCurrentScene()
  const [openId, setOpenId] = useState(null)
  const navRef = useRef(null)
  useDismiss(navRef, Boolean(openId), () => setOpenId(null))

  return (
    <nav ref={navRef} aria-label="Programme" className="pointer-events-auto mx-auto hidden lg:block">
      {/* A small marquee: a brass frame round a maroon board, bulbs chasing
          along the top and bottom, the entries in painted lettering */}
      <div className="rounded-[5px] p-[2px] shadow-[0_6px_16px_rgba(0,0,0,.6),0_0_24px_rgba(255,170,60,.12)]" style={brass}>
        <div className="relative rounded-[3px] px-2 py-[0.6rem]" style={{ backgroundImage: BOARD }}>
          <Bulbs edge="top" />
          <Bulbs edge="bottom" />
          <ul className="relative flex items-center">
            {PROGRAMME.map((item, i) => {
              const here = isHere(item, current)
              const open = openId === item.id
              const lit = here || open
              const label = (
                <>
                  <ProgrammeIcon
                    name={item.icon}
                    className={cn('size-5 shrink-0 transition-[color,filter] duration-200', lit ? 'text-arishina drop-shadow-[0_0_5px_rgba(255,200,90,.8)]' : 'text-gandha/70 group-hover:text-arishina')}
                  />
                  <span className="flex flex-col items-start">
                    <span
                      lang="kn"
                      className={cn(
                        'flex items-center gap-1 font-kn-display text-[0.95rem] font-bold transition-[color,text-shadow] duration-200',
                        lit ? 'text-arishina [text-shadow:0_0_8px_rgba(255,190,80,.75)]' : 'text-gandha group-hover:text-arishina group-hover:[text-shadow:0_0_8px_rgba(255,190,80,.5)]'
                      )}
                    >
                      {item.kn}
                      {item.choices && (
                        <svg aria-hidden viewBox="0 0 10 6" className={cn('h-1.5 w-2.5 fill-current transition-transform duration-200', open && 'rotate-180')}>
                          <path d="M0 0h10L5 6z" />
                        </svg>
                      )}
                    </span>
                    <span lang="en" className={cn('mt-0.5 font-poster text-[0.68rem] tracking-[0.18em] transition-colors', lit ? 'text-[#ffe3a6]/80' : 'text-gandha/55', !subtitles && 'sr-only')}>
                      {item.en}
                    </span>
                  </span>
                </>
              )
              const look = cn(
                'group relative flex cursor-pointer items-center gap-2 rounded-[3px] px-3 py-1 text-left leading-none transition-[background-color,transform] duration-200 hover:-translate-y-px',
                lit ? 'bg-[radial-gradient(ellipse_at_50%_60%,rgba(255,190,80,.22),transparent_75%)]' : 'hover:bg-[radial-gradient(ellipse_at_50%_60%,rgba(255,190,80,.12),transparent_75%)]',
                focusRing
              )
              return (
                <li key={item.id} className="relative flex items-center">
                  {/* A brass stud between entries */}
                  {i > 0 && <span aria-hidden className="mx-0.5 size-1.5 rotate-45 shadow-[0_1px_1px_rgba(0,0,0,.6)]" style={brass} />}
              {item.choices ? (
                <>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`p26-programme-${item.id}`}
                    aria-current={here ? 'location' : undefined}
                    // No subtitle while its card is open: it would sit over the card
                    data-en={open ? undefined : `${item.en} · pick one`}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className={look}
                  >
                    {label}
                  </button>
                  <div
                    id={`p26-programme-${item.id}`}
                    hidden={!open}
                    className="absolute left-1/2 top-[calc(100%+1.1rem)] w-[20rem] -translate-x-1/2 rotate-[-0.6deg] rounded-[3px] bg-[#efe2c4] px-3 pb-3 pt-3 text-theatre shadow-[0_18px_40px_rgba(0,0,0,.7)] bg-blend-multiply"
                    style={paper}
                  >
                    {/* Pinned to the board with a brass tack */}
                    <span aria-hidden className="absolute left-1/2 top-[-5px] size-3 -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgba(0,0,0,.5)]" style={brass} />
                    <Choices item={item} subtitles={subtitles} onPick={() => setOpenId(null)} />
                  </div>
                </>
              ) : (
                <a href={`#${item.id}`} aria-current={here ? 'location' : undefined} data-en={item.en} className={look}>
                  {label}
                </a>
              )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}

// The marquee's board: maroon, warmer where the bulbs light it.
const BOARD =
  'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(255,170,70,.16), transparent 70%), repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 1px, transparent 1px 7px), linear-gradient(180deg, #611717, #420c0d 65%, #2e0809)'

export function ProgrammeButton() {
  const { subtitles } = usePrefs()
  const current = useCurrentScene()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  useDismiss(rootRef, open, () => setOpen(false))

  return (
    <div ref={rootRef} className="pointer-events-auto lg:hidden">
      <button
        type="button"
        aria-label="Programme"
        aria-expanded={open}
        aria-controls="p26-programme"
        // No subtitle while the card is open: it would sit over the card
        data-en={open ? undefined : 'Programme · jump to a part of the show'}
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
        className="absolute inset-x-3 top-[4.25rem] mx-auto max-h-[calc(100svh-5.5rem)] max-w-sm overflow-y-auto rounded-[3px] bg-[#efe2c4] px-5 pb-4 pt-3 text-theatre shadow-[0_18px_40px_rgba(0,0,0,.7)] bg-blend-multiply sm:inset-x-5 sm:top-[4.75rem]"
        style={paper}
      >
        <p className="border-b border-dashed border-theatre/30 pb-2 text-center">
          <span lang="kn" className="font-kn-display text-sm font-bold tracking-wider">ಕಾರ್ಯಕ್ರಮ ಪಟ್ಟಿ</span>
          <span lang="en" className={cn('ml-2 font-poster text-sm tracking-[0.25em] text-theatre/60', !subtitles && 'sr-only')}>PROGRAMME</span>
        </p>
        <ol className="mt-1">
          {PROGRAMME.map((item, i) => {
            const here = isHere(item, current)
            const heading = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'relative grid size-9 shrink-0 place-items-center rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,.5),0_1px_0_rgba(255,250,235,.6)] transition-colors',
                    here ? 'bg-[#7a1416] text-arishina' : 'bg-theatre/85 text-gandha'
                  )}
                >
                  <ProgrammeIcon name={item.icon} className="size-5" />
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full font-typewriter text-[0.6rem] text-theatre shadow-[0_1px_1px_rgba(0,0,0,.4)]" style={brass}>
                    {i + 1}
                  </span>
                </span>
                <span className="flex-1 leading-tight">
                  <span lang="kn" className={cn('block font-kn-display text-lg font-bold', here && 'text-[#9b1b2a]')}>{item.kn}</span>
                  <span lang="en" className={cn('block font-poster text-sm tracking-widest text-theatre/60', !subtitles && 'sr-only')}>{item.en}</span>
                </span>
                {here && <span aria-hidden className="size-2 rounded-full bg-[#9b1b2a]" />}
              </>
            )
            return (
              <li key={item.id} className="border-b border-dotted border-theatre/20 last:border-0">
                {item.choices ? (
                  <div className="pb-2">
                    <p aria-current={here ? 'location' : undefined} className="flex min-h-12 items-center gap-3 py-1.5">
                      {heading}
                    </p>
                    <Choices item={item} subtitles={subtitles} compact onPick={() => setOpen(false)} />
                  </div>
                ) : (
                  <a
                    href={`#${item.id}`}
                    aria-current={here ? 'location' : undefined}
                    onClick={() => setOpen(false)}
                    className={cn('flex min-h-12 items-center gap-3 py-1.5', focusRing)}
                  >
                    {heading}
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}

// The parts of a programme entry, as torn-off ticket stubs: on a laptop one
// above the other in the entry's card, on a phone side by side under it.
function Choices({ item, subtitles, compact = false, onPick }) {
  return (
    <ul aria-label={item.en} className={cn(compact ? 'ml-12 grid grid-cols-2 gap-2' : 'flex flex-col gap-2')}>
      {item.choices.map((choice) => (
        <li key={choice.href}>
          <a
            href={choice.href}
            onClick={onPick}
            data-en={`${choice.en} · ${choice.line.en}`}
            className={cn(
              'group flex h-full items-center gap-2.5 rounded-[2px] border border-dashed border-theatre/35 bg-[#f7eed7]/70 transition-colors hover:border-[#9b1b2a]/60 hover:bg-[#fbf4e2]',
              compact ? 'min-h-14 flex-col items-start gap-1 px-2.5 py-2' : 'px-3 py-2',
              focusRing
            )}
          >
            {choice.icon && <ChoiceIcon icon={choice.icon} className={compact ? 'size-6' : 'size-8 shrink-0'} />}
            <span className="flex-1 leading-tight">
              <span lang="kn" className={cn('block font-kn-display font-bold group-hover:text-[#9b1b2a]', compact ? 'text-base' : 'text-lg')}>
                {choice.kn}
              </span>
              <span lang="en" className={cn('block font-poster text-xs tracking-widest text-theatre/60', !subtitles && 'sr-only')}>
                {choice.en}
              </span>
              {!compact && (
                <span className="mt-0.5 block font-kn-body text-xs text-theatre/70">
                  <span lang="kn">{choice.line.kn}</span>
                  {subtitles && <span lang="en"> · {choice.line.en}</span>}
                </span>
              )}
            </span>
            {!compact && (
              <span aria-hidden className="font-poster text-lg text-theatre/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#9b1b2a]">
                →
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  )
}

function ChoiceIcon({ icon, className }) {
  if (icon === 'film') return <img src={clapper} alt="" className={className} />
  // The guests' frames, drawn in maroon ink
  if (icon !== 'flowers') return <ProgrammeIcon name={icon} className={cn(className, 'text-[#7a1416]')} />
  // A marigold, for the flower shower
  return (
    <svg aria-hidden viewBox="-12 -12 24 24" className={className}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <circle key={i} cx={Math.cos(a) * 6.5} cy={Math.sin(a) * 6.5} r="4.6" fill="#f59a1b" stroke="#8a3c06" strokeOpacity=".35" strokeWidth=".6" />
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        return <circle key={i} cx={Math.cos(a) * 3} cy={Math.sin(a) * 3} r="3.2" fill="#f7b62a" stroke="#8a3c06" strokeOpacity=".3" strokeWidth=".5" />
      })}
      <circle r="1.8" fill="#9a4a08" />
    </svg>
  )
}

// Line drawings for the programme, in the current colour: a cinema ticket
// (events), a portrait in an arched frame (guests), a leaf plate and a tee
// (food and merch), a clapperboard (games), and for the guest choices a
// frame under its velvet and a frame with its lamp lit.
const ICONS = {
  ticket: (
    <>
      <path d="M3 7.5a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2.5 2.5 0 0 0 0-5z" />
      <path d="M15 6v12" strokeDasharray="1.6 1.6" />
      <path d="M7 10h5M7 13h4" />
    </>
  ),
  frame: (
    <>
      <path d="M5.5 21V10a6.5 6.5 0 0 1 13 0v11z" />
      <circle cx="12" cy="11.5" r="2.4" />
      <path d="M8.3 19c.6-2.4 2-3.5 3.7-3.5s3.1 1.1 3.7 3.5" />
    </>
  ),
  meal: (
    <>
      <path d="M2.5 15c3-4.5 8-6 12.5-4.5-1 4.5-6 7.5-12.5 4.5z" />
      <path d="M3 14.8c3.5-.8 7.5-2.4 11.6-4.2" />
      <path d="M15 5.5l2.2-1.7c.4 1 1.3 1.6 2.3 1.6s1.9-.6 2.3-1.6l2.2 1.7-1.3 2.4-1.2-.6V14h-4V7.3l-1.2.6z" transform="translate(-2.8 2.2) scale(.92)" />
    </>
  ),
  clapper: (
    <>
      <path d="M3.5 10h17v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
      <path d="M3.2 9.6 19.6 5.4l-.9-3.4L2.3 6.2z" />
      <path d="M7.5 5.1 9.6 8.3M12.2 3.9l2.1 3.2M16.8 2.7l2 3.1" />
    </>
  ),
  veil: (
    <>
      <path d="M5.5 21V10a6.5 6.5 0 0 1 13 0v11z" />
      <path d="M6.2 9.5C8 11.8 10 12.6 12 12.6s4-.8 5.8-3.1" />
      <path d="M9 12.2c-.3 3-.1 5.6.4 8.6M12 12.6v8.2M15 12.2c.3 3 .1 5.6-.4 8.6" />
    </>
  ),
  lit: (
    <>
      <path d="M6.5 21V12a5.5 5.5 0 0 1 11 0v9z" />
      <path d="M9 4.2h6M12 2v2.2" />
      <path d="M8 7.5 6.5 6M16 7.5 17.5 6" />
      <circle cx="12" cy="13" r="2" />
      <path d="M9.4 19.3c.5-1.9 1.5-2.8 2.6-2.8s2.1.9 2.6 2.8" />
    </>
  ),
}

function ProgrammeIcon({ name, className }) {
  if (!ICONS[name]) return null
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICONS[name]}
    </svg>
  )
}
