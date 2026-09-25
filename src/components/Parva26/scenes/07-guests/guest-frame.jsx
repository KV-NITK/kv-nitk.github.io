import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { eventDay } from '@p26/content'
import { gsap } from '@p26/lib/gsap'
import { reliefLayers } from '@p26/styles/carving'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { load, save } from '@p26/lib/storage'
import { cn } from '@/lib/utils'
import { PictureLamp } from '@p26/scenes/07-guests/picture-lamp'
import { Veil } from '@p26/scenes/07-guests/veil'
import { Tag } from '@p26/scenes/07-guests/tag'
import { FoldedVelvet, Puff, unveil } from '@p26/scenes/07-guests/unveiling'
import { Nameplate, RoleRibbon, InfoCard } from '@p26/scenes/07-guests/labels'

// One portrait on the lobby's wall of honour (Scene 7, allscenes.md): a
// carved heartwood frame with an arched top like the stage arch, a brass
// picture lamp over it, a brass nameplate and a role ribbon under it.
// A guest not yet revealed is covered with kumkuma velvet, tied with a gold
// cord whose knot is sealed with wax, and a paper tag gives the unveiling
// date. The first time a visitor sees a newly revealed guest, the seal
// cracks, the cord drops, the velvet slides down and the lamp comes on.
// Everything is CSS and inline SVG; only small pieces ever move.

const HEARTWOOD =
  'linear-gradient(90deg, rgba(0,0,0,.3), transparent 14%, rgba(255,214,160,.1) 50%, transparent 86%, rgba(0,0,0,.34)), linear-gradient(180deg, #86532e, #62381c 50%, #45250f)'

const SEEN_KEY = 'parva26:unveiled'

const hasSeen = (id) => load(SEEN_KEY, []).includes(id)

// If storage is unavailable, the unveiling just plays again next time.
function markSeen(id) {
  const seen = load(SEEN_KEY, [])
  if (!seen.includes(id)) save(SEEN_KEY, [...seen, id])
}

// `guest` is either this year's (covered until it has a name) or a past
// guest (`past`: always revealed, no velvet). `open` shows the teaser on a
// covered frame, or the info card on a revealed one.
export function GuestFrame({ guest, past = false, next = false, now, open, onToggle, className }) {
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const boxRef = useRef(null)
  const revealed = Boolean(guest.name)
  const [stage, setStage] = useState(() => {
    if (!revealed) return 'covered'
    return past || (hasSeen(guest.id) && !guest.preview) ? 'revealed' : 'waiting'
  })
  const veiled = stage !== 'revealed'
  const day = guest.revealDate ? eventDay(guest.revealDate) : null

  // A newly revealed guest is unveiled once, when the frame is well in view.
  useEffect(() => {
    if (stage !== 'waiting') return
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStage('unveiling')
      },
      { threshold: 0.7 }
    )
    seen.observe(boxRef.current)
    return () => seen.disconnect()
  }, [stage])

  useEffect(() => {
    if (stage !== 'unveiling') return
    const tl = unveil(boxRef.current, reduced, () => {
      markSeen(guest.id)
      setStage('revealed')
    })
    return () => tl.kill()
  }, [stage, reduced, guest.id])

  // Tapping a covered frame: the veil gives a small shake ("not yet!").
  const nudge = () => {
    if (reduced || stage !== 'covered' || open) return
    gsap.fromTo(
      boxRef.current.querySelector('[data-nudge]'),
      { rotate: 0 },
      { keyframes: { rotate: [0, -2.4, 2, -1.3, 0.6, 0] }, duration: 0.55, ease: 'none', transformOrigin: '50% 0%' }
    )
  }

  const label =
    stage === 'covered'
      ? `Covered portrait${guest.role ? `, ${guest.role.en}` : ''}. Unveiling on ${day.en}. ${open ? 'Showing a hint.' : 'Tap for a hint.'}`
      : `${guest.name.en}, ${guest.role?.en ?? 'Guest'}. ${open ? 'Showing details.' : 'Tap for details.'}`

  return (
    // Not <figure>: the site's Cards.css styles every figure on every page.
    <div data-open={open || undefined} className={cn('group/frame relative flex flex-col items-center data-open:z-30', className)}>
      {/* Above the nameplate, which the tag may hang over on short screens */}
      <div
        ref={boxRef}
        className="relative isolate z-10 mt-[calc(var(--fw)*0.26)] aspect-[5/7] w-(--fw) transition-transform duration-300 ease-out [container-type:inline-size] group-data-open/frame:-translate-y-1 group-data-open/frame:scale-[1.04]"
      >
        <PictureLamp on={stage === 'revealed'} />

        <button
          type="button"
          onClick={() => {
            if (stage === 'waiting') return setStage('unveiling')
            nudge()
            onToggle()
          }}
          aria-expanded={open}
          aria-label={label}
          className="absolute inset-0 rounded-t-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kumkuma"
        >
          <FrameBody photo={revealed ? guest.photo : null} />
        </button>

        {!past && (stage === 'revealed' || stage === 'unveiling') && <FoldedVelvet hidden={stage === 'unveiling'} />}
        {veiled && <Veil />}
        {veiled && <Tag guest={guest} day={day} next={next} now={now} hinted={open && stage === 'covered'} subtitles={subtitles} />}
        {stage === 'unveiling' && <Puff />}
      </div>

      <div className="flex flex-col items-center">
        <Nameplate name={stage === 'revealed' ? guest.name : null} subtitles={subtitles} />
        {/* Frames without a role keep the ribbon's space, so a row of frames
            the same size lines up */}
        <RoleRibbon role={guest.role ?? { kn: '—', en: '—' }} subtitles={subtitles} blank={!guest.role} />
      </div>

      <p aria-live="polite" className="sr-only">
        {open && stage === 'covered' ? (guest.teaser?.en ?? 'Wait and see.') : ''}
      </p>
      {open && stage === 'revealed' && guest.card && <InfoCard card={guest.card} subtitles={subtitles} />}
    </div>
  )
}

// The frame itself: heartwood with a beaded moulding, a gilt slip round the
// opening, a small carved finial on the arch, and glass over the photo.
function FrameBody({ photo }) {
  return (
    <span
      className="absolute inset-0 block rounded-t-full shadow-[0_1.1rem_1.3rem_-0.5rem_rgba(58,26,6,.7),inset_0_1px_0_rgba(255,222,170,.35),inset_0_0_0_1px_rgba(30,12,2,.6)] transition-shadow group-hover/frame:shadow-[0_1.5rem_1.6rem_-0.5rem_rgba(58,26,6,.75),inset_0_1px_0_rgba(255,222,170,.35),inset_0_0_0_1px_rgba(30,12,2,.6)]"
      style={{ backgroundImage: HEARTWOOD }}
    >
      <span aria-hidden className="absolute inset-[3.2cqw] rounded-t-full border-[1.5cqw] border-dotted border-[#d9ab6c]/70" />
      <span
        className="absolute inset-x-[9cqw] bottom-[9cqw] top-[9cqw] block overflow-hidden rounded-t-full bg-[#2a1a10] shadow-[0_0_0_1.1cqw_#c9a052,0_0_0_1.8cqw_#3a1f0e]"
      >
        {photo && (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-top contrast-105 saturate-75 sepia-70 transition-[filter] duration-700 group-hover/frame:saturate-100 group-hover/frame:sepia-0 group-data-open/frame:saturate-100 group-data-open/frame:sepia-0"
          />
        )}
        {/* Inner shadow of the slip, and the glass catching the lobby light */}
        <span aria-hidden className="absolute inset-0 rounded-t-full shadow-[inset_0_0.8cqw_2.4cqw_rgba(0,0,0,.6)]" />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(118deg, transparent 38%, rgba(255,250,235,.16) 42%, transparent 50%, transparent 58%, rgba(255,250,235,.08) 61%, transparent 66%)' }}
        />
      </span>
      <Finial />
    </span>
  )
}

// A carved lotus bud on top of the arch, in sandalwood.
function Finial() {
  const bud = (
    <>
      <path d="M20 1 C25 7 28 12 26 18 C24 21 16 21 14 18 C12 12 15 7 20 1 Z" />
      <path d="M6 22 C11 16 16 18 20 22 C24 18 29 16 34 22 C30 25 10 25 6 22 Z" />
      <rect x="11" y="23.5" width="18" height="3.5" rx="1.5" />
    </>
  )
  return (
    <svg aria-hidden viewBox="0 0 40 28" className="absolute left-1/2 top-[-6.5cqw] w-[17cqw] -translate-x-1/2 overflow-visible">
      {reliefLayers(0.9).map((layer) => (
        <g key={layer.key} transform={`translate(0 ${layer.dy})`} fill={layer.fill}>
          {bud}
        </g>
      ))}
    </svg>
  )
}
