import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { EVENTS, GENRES, eventDay } from '@p26/content'
import { Bulbs } from '@p26/ui/bulbs'
import { PosterMotif, POSTER_STYLES } from '@p26/scenes/06-now-showing/poster-art'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { useOnScreen, PAUSED } from '@p26/lib/on-screen'
import { cn } from '@/lib/utils'

// Scene 6, ಇಂದೇ ನೋಡಿ · Now Showing (allscenes.md). The theatre's poster
// hoarding in the evening: a heavy wooden board under a row of chasing
// bulbs, the headline events pasted on it as film posters, slightly crooked
// and overlapping over scraps of older ones. Warm bulb light from above,
// a cool street lamp from the left. Tapping a poster turns it over to show
// when and where, and a Register stamp; only one is open at a time.

const TILTS = [-1.3, 0.9, -0.6, 1.4, -1.1, 0.7]
const POSTERS = EVENTS.filter((e) => e.headline).slice(0, 6)

export function NowShowingScene() {
  const [open, setOpen] = useState(null)
  const [lifted, setLifted] = useState(null)
  const boardRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()

  // Motifs only animate while the board is on screen.
  const live = useOnScreen(boardRef)

  // Every so often a poster's corner lifts in the breeze and settles.
  useEffect(() => {
    if (reduced || !live) return
    let settle = 0
    const id = setInterval(() => {
      const choices = POSTERS.filter((p) => p.id !== open)
      setLifted(choices[Math.floor(Math.random() * choices.length)]?.id ?? null)
      settle = setTimeout(() => setLifted(null), 1400)
    }, 8000)
    return () => {
      clearInterval(id)
      clearTimeout(settle)
    }
  }, [reduced, live, open])

  // Tapping anywhere else, or Escape, sticks the open poster back.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!e.target.closest?.(`[data-poster="${open}"]`)) setOpen(null)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <section
      id="now-showing"
      aria-labelledby="now-showing-title"
      className="relative scroll-mt-14 overflow-hidden px-2 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-16"
      style={{ backgroundImage: 'linear-gradient(180deg, #151a24, #1e1d22 60%, #19140f)' }}
    >
      <StreetLamp />

      <div ref={boardRef} className="relative mx-auto max-w-6xl">
        <div
          className="relative rounded-[4px] p-3 shadow-[0_28px_40px_-10px_rgba(0,0,0,.75),inset_0_1px_0_rgba(255,220,170,.2)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(0,0,0,.14) 0 2px, transparent 2px 9px), linear-gradient(180deg, #7a4a28, #5a3419 60%, #3e2310)',
          }}
        >
          <Bulbs edge="top" />
          {/* One dead bulb, one with a bad contact */}
          <span aria-hidden className="absolute left-[calc(0.75rem+7.5*1.125rem)] top-1.5 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a1e12]" />
          <span
            aria-hidden
            className="absolute left-[calc(0.75rem+23.5*1.125rem)] top-1.5 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-[#fffbea] via-[#ffe9a8]/70 to-transparent to-70% motion-safe:animate-bulb-flicker"
          />
          {[
            'left-1.5 top-1.5',
            'right-1.5 top-1.5',
            'bottom-1.5 left-1.5',
            'bottom-1.5 right-1.5',
          ].map((at) => (
            <span key={at} aria-hidden className={cn('absolute size-2 rounded-full shadow-[0_1px_1px_rgba(0,0,0,.6)]', at)} style={brass} />
          ))}

          <div
            className="relative overflow-hidden rounded-[2px] px-2 pb-12 pt-5 sm:px-6 sm:pb-14 sm:pt-6"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 1px, transparent 1px 14px), linear-gradient(180deg, #3b2c1e, #2c2016)',
            }}
          >
            <header className="relative z-10 mb-5 text-center sm:mb-7">
              <h2 id="now-showing-title" className="flex flex-col items-center">
                <span
                  lang="kn"
                  className="-rotate-1 font-kn-display text-5xl font-extrabold leading-none text-arishina sm:text-6xl"
                  style={{ textShadow: '3px 3px 0 #c8102e, 5px 5px 0 rgba(0,0,0,.35)' }}
                >
                  ಇಂದೇ ನೋಡಿ
                </span>
                <span className={cn('mt-2 font-poster text-xl tracking-[0.35em] text-[#f1dfc0]/90 [text-shadow:0_1px_0_rgba(0,0,0,.6)] sm:text-2xl', !subtitles && 'sr-only')}>
                  Now showing
                </span>
              </h2>
            </header>

            <Scraps />

            <ul className="relative z-10 grid grid-cols-2 justify-items-center gap-y-5 sm:flex sm:flex-wrap sm:justify-center sm:gap-y-8">
              {POSTERS.map((event, i) => (
                <li key={event.id} className="-mx-1 sm:-mx-2">
                  <Poster
                    event={event}
                    tilt={TILTS[i % TILTS.length]}
                    open={open === event.id}
                    lifted={lifted === event.id}
                    live={live}
                    reduced={reduced}
                    subtitles={subtitles}
                    onToggle={() => setOpen((id) => (id === event.id ? null : event.id))}
                  />
                </li>
              ))}
            </ul>

            {/* Bulb light from above, the cool street lamp from the left */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(255,214,140,.16), transparent 45%, rgba(0,0,0,.32)), linear-gradient(90deg, rgba(159,179,200,.16), transparent 38%)',
              }}
            />
          </div>
        </div>

        <AllShowsSign />
      </div>
    </section>
  )
}

// The street lamp stands just out of frame on the left; only its cool light
// reaches the wall.
function StreetLamp() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-radial-[ellipse_70%_60%_at_-10%_25%] from-[#9fb3c8]/22 via-[#9fb3c8]/6 via-50% to-transparent"
    />
  )
}

// Torn corners of older posters, pasted over and faded.
function Scraps() {
  const scraps = [
    { at: 'left-[6%] top-[18%] w-24 h-32 rotate-[-6deg]', color: '#9b8a6a', clip: 'polygon(0 4%, 88% 0, 100% 62%, 70% 72%, 82% 100%, 4% 94%)' },
    { at: 'left-[40%] top-[62%] w-28 h-20 rotate-[3deg]', color: '#7f8f8c', clip: 'polygon(6% 0, 100% 8%, 92% 100%, 40% 84%, 0 96%)' },
    { at: 'right-[8%] top-[22%] w-24 h-36 rotate-[5deg]', color: '#a86a58', clip: 'polygon(0 0, 100% 6%, 90% 58%, 100% 100%, 12% 90%, 20% 40%)' },
    { at: 'left-[22%] bottom-[6%] w-32 h-16 rotate-[-2deg]', color: '#8a7a4e', clip: 'polygon(0 20%, 100% 0, 96% 100%, 8% 86%)' },
  ]
  return (
    <div aria-hidden className="absolute inset-0 z-0 hidden sm:block">
      {scraps.map((s) => (
        <span key={s.at} className={cn('absolute opacity-60 bg-blend-multiply', s.at)} style={{ ...paper, backgroundColor: s.color, clipPath: s.clip }} />
      ))}
    </div>
  )
}

function Poster({ event, tilt, open, lifted, live, reduced, subtitles, onToggle }) {
  const style = POSTER_STYLES[event.type] ?? POSTER_STYLES.film
  const genre = GENRES[event.type]
  const day = eventDay(event.day)
  const turned = open && !reduced
  const label = `${event.en}, ${genre?.en ?? ''}, ${day.en}, ${event.time}. Tap for details.`

  return (
    <div
      data-poster={event.id}
      className={cn(
        'group/poster relative aspect-[2/3] w-[44vw] max-w-[13rem] transition-[translate] duration-300 [perspective:1000px] sm:w-[12rem] lg:w-[min(11.6rem,13.6vw)]',
        open ? 'z-30' : 'hover:-translate-y-1.5 hover:z-20',
        !live && PAUSED
      )}
      style={{ rotate: `${tilt}deg` }}
    >
      <div className={cn('relative size-full transform-3d transition-transform duration-500 ease-out', turned && 'scale-[1.06] rotate-y-180')}>
        {/* Front */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={label}
          inert={open}
          className={cn(
            'absolute inset-0 overflow-hidden rounded-[2px] text-left backface-hidden [container-type:inline-size] shadow-[0_6px_10px_rgba(0,0,0,.5)] transition-[opacity,box-shadow] duration-300 group-hover/poster:shadow-[0_16px_24px_rgba(0,0,0,.55)]',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina',
            reduced && open && 'opacity-0'
          )}
          style={{ backgroundColor: style.ground }}
        >
          <PosterFront event={event} style={style} genre={genre} day={day} subtitles={subtitles} />
          <Curl up={lifted} />
        </button>

        {/* Back: plain paper, written on in marker, with a Register stamp */}
        <div
          inert={!open}
          className={cn(
            'absolute inset-0 flex flex-col overflow-hidden rounded-[2px] bg-paper p-[8%] text-[#1d2a4d] backface-hidden [container-type:inline-size] shadow-[0_16px_26px_rgba(0,0,0,.6)]',
            reduced ? cn('transition-opacity duration-200', open ? 'opacity-100' : 'pointer-events-none opacity-0') : 'rotate-y-180'
          )}
          style={paper}
        >
          <button type="button" onClick={onToggle} aria-label={`Turn the ${event.en} poster back`} className="absolute inset-0 cursor-pointer" />
          <span aria-hidden className="pointer-events-none absolute -right-4 top-6 size-16 rounded-full bg-radial from-[#a88a50]/25 to-transparent to-70%" />
          <span aria-hidden className="pointer-events-none absolute -left-6 bottom-10 size-20 rounded-full bg-radial from-[#a88a50]/20 to-transparent to-70%" />
          <div className="pointer-events-none relative flex flex-1 flex-col gap-1">
            <p lang="kn" className="-rotate-1 font-kn-display text-[max(1.05rem,10cqw)] font-bold leading-tight">
              {event.kn}
            </p>
            <p className="font-kn-display text-[max(1rem,8cqw)] font-semibold leading-tight">
              <span lang="kn" className="whitespace-nowrap">{day.kn}</span> · <span className="whitespace-nowrap">{event.time}</span>
            </p>
            <p className="font-kn-display text-[max(1rem,8cqw)] font-semibold leading-tight">{event.venue}</p>
            <p className={cn('mt-1 text-[max(0.8rem,6.4cqw)] leading-snug text-[#1d2a4d]/85', !subtitles && 'sr-only')}>{event.line}</p>
          </div>
          <a
            href={event.registerLink}
            className="relative mt-2 grid min-h-11 -rotate-2 place-items-center rounded-[3px] border-[2.5px] border-kumkuma px-2 text-center font-poster text-[max(1rem,9cqw)] leading-none tracking-wider text-kumkuma [filter:url(#p26-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumkuma"
          >
            <span>
              <span lang="kn" className="font-kn-display font-bold">ನೋಂದಣಿ</span> · Register
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

function PosterFront({ event, style, genre, day, subtitles }) {
  const outline = style.shade
  return (
    <>
      {/* Sunburst behind the picture, then paper grain and paste wrinkles */}
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: `repeating-conic-gradient(from 0deg at 50% 60%, ${style.burst} 0 6deg, ${style.ground} 6deg 12deg)` }} />
      <span aria-hidden className="absolute inset-0 opacity-30 mix-blend-multiply" style={paper} />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(115deg, transparent 30%, rgba(255,255,255,.07) 31%, transparent 34%), linear-gradient(70deg, transparent 58%, rgba(0,0,0,.08) 59%, transparent 61%)',
          boxShadow: 'inset 0 0 14px rgba(90,60,20,.35)',
        }}
      />

      <span className="absolute inset-x-[6%] top-[4%] block text-center">
        <span lang="kn" className="block font-kn-body text-[4.6cqw] font-semibold" style={{ color: style.ink }}>
          ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ
        </span>
        <span
          lang="kn"
          className="mt-[2cqw] block font-kn-display text-[14cqw] font-extrabold leading-[1.05]"
          style={{ color: style.title, textShadow: `-1px -1px 0 ${outline}, 1px -1px 0 ${outline}, -1px 1px 0 ${outline}, 1px 1px 0 ${outline}, 3px 3px 0 ${outline}` }}
        >
          {event.kn}
        </span>
        <span className={cn('mt-[1cqw] block font-poster text-[7.5cqw] tracking-[0.12em]', !subtitles && 'sr-only')} style={{ color: style.ink }}>
          {event.en}
        </span>
      </span>

      <span aria-hidden className="absolute inset-x-[12%] bottom-[23%] top-[42%] block">
        {event.photo ? (
          <img src={event.photo} alt="" className="size-full rounded-[2px] object-cover grayscale contrast-125" />
        ) : (
          <PosterMotif type={event.type} className="size-full" />
        )}
      </span>

      {genre && <GenreStamp genre={genre} ink={style.ground === '#f2c12e' || style.ground === '#f1dfc0' || style.ground === '#c8955f' ? '#c8102e' : '#fff4dc'} subtitles={subtitles} />}

      {/* Date strip: normal digits, big enough to read (allscenes.md A5, A7) */}
      <span className="absolute inset-x-0 bottom-0 flex min-h-[20%] flex-col items-center justify-center px-1 text-center" style={{ backgroundColor: style.band, color: '#fff4dc' }}>
        <span lang="kn" className="block font-kn-display text-[max(1rem,8.4cqw)] font-bold leading-tight">
          {day.kn}
        </span>
        <span className="block font-kn-display text-[max(1rem,7.6cqw)] font-semibold leading-tight">
          {event.time}
          {subtitles && <span className="opacity-75"> · {day.en}</span>}
        </span>
      </span>
    </>
  )
}

function GenreStamp({ genre, ink, subtitles }) {
  return (
    <span
      aria-hidden
      className="absolute right-[3%] top-[41%] grid size-[29cqw] rotate-[-12deg] place-items-center rounded-full border-[0.9cqw] text-center leading-none [filter:url(#p26-ink)]"
      style={{ borderColor: ink, color: ink }}
    >
      <span className="absolute inset-[5%] rounded-full border-[0.4cqw]" style={{ borderColor: ink }} />
      <span className="relative">
        <span lang="kn" className="block whitespace-nowrap font-kn-display text-[5cqw] font-bold">
          {genre.kn}
        </span>
        {subtitles && <span className="mt-[1cqw] block font-poster text-[4.4cqw] tracking-wider">{genre.en}</span>}
      </span>
    </span>
  )
}

// The bottom-right corner peels up on hover, or when the breeze catches it.
function Curl({ up }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute bottom-0 right-0 size-0 transition-[width,height] duration-500 ease-out group-hover/poster:size-[15%]',
        up && 'size-[13%]'
      )}
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,.35) 0 44%, #efe3c8 50%, #cdbb97 100%)',
        boxShadow: '-3px -3px 6px rgba(0,0,0,.3)',
        borderTopLeftRadius: '40%',
      }}
    />
  )
}

// A painted arrow nailed to the board, pointing to the full programme.
function AllShowsSign() {
  const { subtitles } = usePrefs()
  return (
    <a
      href="/events"
      className="group absolute -bottom-6 right-3 z-30 block -rotate-2 drop-shadow-[0_6px_6px_rgba(0,0,0,.55)] transition-transform hover:-rotate-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arishina sm:right-8"
    >
      <span
        className="flex min-h-11 items-center gap-2 py-2 pl-4 pr-8 text-[#fff4dc]"
        style={{
          clipPath: 'polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 2px, transparent 2px 10px), linear-gradient(180deg, #8a5a30, #5a3419)',
        }}
      >
        <span aria-hidden className="size-1.5 rounded-full" style={brass} />
        <span className="leading-tight">
          <span lang="kn" className="block font-kn-display text-base font-bold">ಎಲ್ಲಾ ಚಿತ್ರಗಳು</span>
          <span className={cn('block font-poster text-sm tracking-wider text-[#f2c12e]', !subtitles && 'sr-only')}>All shows →</span>
        </span>
      </span>
    </a>
  )
}
