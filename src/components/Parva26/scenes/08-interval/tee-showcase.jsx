import { useEffect, useRef, useState } from 'react'
import { En, usePrefs } from '@p26/lib/prefs'
import { TEE, eventDay } from '@p26/content'
import { PERFORATED } from '@p26/ui/coupon'
import { gsap } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// Parva Angadi (Scene 8): the lobby's glass showcase, used as the Parva
// shop. The tee hangs on a brass rod and turns slowly on its hanger. Tapping
// the glass (or picking anything on the counter) swings the door open and
// the tee comes forward; then it can be dragged round. The counter in front
// holds the colour swatches, the size tokens (a sold-out size gets a tiny
// HOUSEFULL stamp), the size chart, a button to see the back, and the Buy
// now coupon. The door closes again once the showcase is out of view.

const closesAt = (iso) => new Date(`${iso}T23:59:59+05:30`).getTime()

export function TeeShowcase({ className }) {
  const { subtitles } = usePrefs()
  const [variantId, setVariantId] = useState(TEE.variants[0].id)
  const [size, setSize] = useState(null)
  const [back, setBack] = useState(false)
  const [chart, setChart] = useState(false)
  const [hint, setHint] = useState(false)
  const [open, setOpen] = useState(false)
  const sizesRef = useRef(null)
  const shopRef = useRef(null)
  const variant = TEE.variants.find((v) => v.id === variantId)
  const closed = Date.now() > closesAt(TEE.closes)
  const early = TEE.earlySold < TEE.earlyQuota
  const price = early ? TEE.earlyPrice : TEE.price
  const closeDay = eventDay(TEE.closes)

  // The door closes behind you once you've walked on.
  useEffect(() => {
    const seen = new IntersectionObserver(([entry]) => !entry.isIntersecting && setOpen(false))
    seen.observe(shopRef.current)
    return () => seen.disconnect()
  }, [])

  // A size sold out in the new colour can't stay picked.
  useEffect(() => {
    if (size && variant.soldOut.includes(size)) setSize(null)
  }, [variant, size])

  const buy = (e) => {
    if (size) return
    e.preventDefault()
    setHint(true)
    gsap.fromTo(sizesRef.current, { x: 0 }, { keyframes: { x: [0, -6, 5, -3, 2, 0] }, duration: 0.45, ease: 'none' })
  }
  const href = TEE.buyLink === '#' ? '#' : `${TEE.buyLink}?variant=${variant.id}&size=${size ?? ''}`

  return (
    <div ref={shopRef} id="angadi" className={cn('relative flex scroll-mt-20 flex-col items-center', className)}>
      <h3 className="relative z-10 -mb-1 rounded-t-[6px] bg-kumkuma px-6 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2)]">
        <span lang="kn" className="block font-kn-display text-2xl font-extrabold leading-tight">
          ಪರ್ವ ಅಂಗಡಿ
        </span>
        <span className={cn('block font-poster text-lg leading-none tracking-[0.25em] text-arishina', !subtitles && 'sr-only')}>Parva Angadi · Merch</span>
      </h3>

      {/* The cabinet */}
      <div className="relative w-full max-w-[24rem] rounded-t-[6px] p-2.5 shadow-[0_1rem_1.4rem_-0.6rem_rgba(20,30,20,.55)] [perspective:1800px]" style={{ backgroundImage: TEAK }}>
        <div
          className="relative aspect-[1/1] overflow-hidden rounded-[2px] shadow-[inset_0_0.5rem_1rem_rgba(0,0,0,.5)]"
          style={{ backgroundImage: 'radial-gradient(ellipse 55% 60% at 50% 30%, rgba(255,226,170,.35), transparent 70%), linear-gradient(180deg, #274442, #16302e 70%, #0f2321)' }}
        >
          {/* Strip light and brass rod */}
          <span aria-hidden className="absolute inset-x-[10%] top-1 h-1 rounded-full bg-[#fff3d0] shadow-[0_0_12px_4px_rgba(255,226,160,.6)]" />
          <span aria-hidden className="absolute inset-x-[6%] top-[7%] h-1.5 rounded-full shadow-[0_2px_2px_rgba(0,0,0,.5)]" style={brass} />

          <Tee3D variant={variant} back={back} onTurn={setBack} forward={open} />

          <PriceTag price={TEE.price} early={early ? TEE.earlyPrice : null} />

          {/* Order deadline, on a card propped at the back of the shelf */}
          <p className="absolute bottom-[5%] left-[4%] rotate-[-2deg] rounded-[2px] bg-[#f3ead5] px-2 py-1 text-[#1d1a17] shadow-[0_2px_4px_rgba(0,0,0,.45)]" style={paper}>
            <span lang="kn" className="block font-kn-display text-[0.8rem] font-semibold leading-tight">
              ಆರ್ಡರ್ ಕೊನೆಯ ದಿನ
            </span>
            <span lang="kn" className="block font-kn-display text-base font-bold leading-tight">
              {closeDay.kn}
            </span>
            <En className="block text-[0.85rem] font-semibold leading-tight">Orders close {closeDay.en}</En>
          </p>

          {closed && <ClosedBoard subtitles={subtitles} />}
        </div>
        <GlassDoor open={open} onOpen={() => setOpen(true)} subtitles={subtitles} />
      </div>

      {/* The counter top in front, with the choices on it */}
      <div className="relative w-full max-w-[26rem] rounded-[4px] px-4 pb-5 pt-4 shadow-[0_1rem_1.2rem_-0.6rem_rgba(20,30,20,.6)]" style={{ backgroundImage: COUNTER }}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <fieldset>
            <legend className="mb-1.5 font-kn-display text-base font-semibold text-[#f3ead5]">
              <span lang="kn">ಬಣ್ಣ</span>
              <En className="font-kn-body"> · Colour</En>
            </legend>
            <div role="radiogroup" className="flex gap-2.5">
              {TEE.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={v.id === variantId}
                  aria-label={v.en}
                  data-en={v.en}
                  onClick={() => {
                    setVariantId(v.id)
                    setOpen(true)
                  }}
                  className={cn(
                    'relative size-11 rounded-[4px] p-1 shadow-[0_2px_3px_rgba(0,0,0,.45)] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
                    v.id === variantId ? '-translate-y-0.5 ring-2 ring-arishina' : 'hover:-translate-y-0.5'
                  )}
                  style={{ backgroundColor: v.body }}
                >
                  <span aria-hidden className="block size-full rounded-[2px] border border-dashed" style={{ borderColor: v.print }} />
                </button>
              ))}
            </div>
            <p lang="kn" className="mt-1 font-kn-display text-sm font-semibold text-[#f3ead5]/85">
              {variant.kn}
              <En className="font-kn-body"> · {variant.en}</En>
            </p>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 font-kn-display text-base font-semibold text-[#f3ead5]">
              <span lang="kn">ಅಳತೆ</span>
              <En className="font-kn-body"> · Size</En>
            </legend>
            <div ref={sizesRef} role="radiogroup" className="flex gap-1.5">
              {TEE.sizes.map((s) => {
                const out = variant.soldOut.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={size === s.id}
                    aria-label={out ? `${s.id}, sold out` : s.id}
                    disabled={out || closed}
                    onClick={() => {
                      setSize(s.id)
                      setHint(false)
                      setOpen(true)
                    }}
                    className={cn(
                      'relative grid size-11 place-items-center rounded-full font-poster text-lg leading-none shadow-[0_2px_3px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,240,210,.35)] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
                      size === s.id ? '-translate-y-0.5 bg-arishina text-theatre' : 'text-[#f3ead5] enabled:hover:-translate-y-0.5',
                      out && 'opacity-60'
                    )}
                    style={size === s.id ? undefined : { backgroundImage: 'radial-gradient(circle at 35% 30%, #a5733f, #6b4020 70%)' }}
                  >
                    {s.id}
                    {out && (
                      <span aria-hidden className="absolute -rotate-[24deg] rounded-[2px] border border-kumkuma bg-[#f3ead5]/90 px-0.5 font-poster text-[0.55rem] leading-none tracking-wider text-kumkuma">
                        HOUSEFULL
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              aria-expanded={chart}
              onClick={() => setChart((c) => !c)}
              className="mt-1 min-h-8 font-kn-display text-sm font-semibold text-arishina underline decoration-arishina/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
            >
              <span lang="kn">ಅಳತೆ ಪಟ್ಟಿ</span>
              <En className="font-kn-body"> · Size chart</En>
            </button>
          </fieldset>

          <button
            type="button"
            onClick={() => {
              setBack((b) => !b)
              setOpen(true)
            }}
            className="flex min-h-11 items-center gap-2 self-end rounded-full bg-black/25 px-3 text-[#f3ead5] ring-1 ring-[#c9a052]/50 transition-colors hover:bg-black/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
          >
            <span aria-hidden className="size-3 rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,.5)]" style={brass} />
            <span className="text-left leading-tight">
              <span lang="kn" className="block font-kn-display text-sm font-semibold">
                {back ? 'ಮುಂಭಾಗ ನೋಡಿ' : 'ಹಿಂಭಾಗ ನೋಡಿ'}
              </span>
              <En className="block text-xs">{back ? 'See the front' : 'See the back'}</En>
            </span>
          </button>
        </div>

        {chart && <SizeChart subtitles={subtitles} />}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {early && !closed && <EarlyFlag subtitles={subtitles} />}
          {closed ? (
            <p className="font-kn-display text-lg font-bold text-[#f3ead5]">
              <span lang="kn">ಬುಕಿಂಗ್ ಮುಗಿದಿದೆ</span>
              <En className="block font-kn-body text-base">Booking closed</En>
            </p>
          ) : (
            <a
              href={href}
              onClick={buy}
              data-en="Buy the Parva tee"
              className="group relative ml-auto block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina"
            >
              <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-5 pr-4 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
                <span className="flex flex-col">
                  <span lang="kn" className="font-kn-display text-xl font-extrabold leading-none">
                    ಈಗಲೇ ಕೊಳ್ಳಿ
                  </span>
                  <span className="mt-1 font-kn-body text-base font-bold leading-none">
                    {subtitles ? 'Buy now · ' : ''}₹{price}
                  </span>
                </span>
                <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
              </span>
            </a>
          )}
        </div>
        <p role="status" className={cn('mt-2 text-right font-kn-display text-base font-semibold text-arishina', !hint && 'sr-only')}>
          {hint && (
            <>
              <span lang="kn">ಮೊದಲು ಅಳತೆ ಆರಿಸಿ</span>
              <En className="font-kn-body"> · Pick a size first</En>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

const TEAK = 'repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 2px, transparent 2px 12px), linear-gradient(180deg, #8a5530, #5e3519 60%, #45240f)'
const COUNTER =
  'linear-gradient(180deg, #a26a3a 0 0.45rem, #6b4020 0.45rem 0.6rem, transparent 0.6rem), repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 2px, transparent 2px 14px), linear-gradient(180deg, #6e4322, #4a2a12)'

// The tee on its hanger, drawn in SVG, turning in 3D. It sways gently on
// its own; a drag turns it by hand and it settles facing front or back.
// Real photos (variant.photos) replace the drawing when they arrive.
function Tee3D({ variant, back, onTurn, forward }) {
  const turnRef = useRef(null)
  const drag = useRef(null)
  const [held, setHeld] = useState(false)

  // Turn to the requested side the short way round.
  useEffect(() => {
    const el = turnRef.current
    const now = Number(gsap.getProperty(el, 'rotateY')) || 0
    let target = Math.round(now / 180) * 180
    if (Math.abs(Math.round(target / 180)) % 2 !== (back ? 1 : 0)) target += now >= target ? 180 : -180
    gsap.to(el, { rotateY: target, duration: 0.8, ease: 'power3.out' })
  }, [back])

  const onDown = (e) => {
    drag.current = { x: e.clientX, from: Number(gsap.getProperty(turnRef.current, 'rotateY')) || 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    gsap.killTweensOf(turnRef.current)
    setHeld(true)
  }
  const onMove = (e) => {
    if (!drag.current) return
    gsap.set(turnRef.current, { rotateY: drag.current.from + (e.clientX - drag.current.x) * 0.7 })
  }
  const onUp = () => {
    if (!drag.current) return
    drag.current = null
    setHeld(false)
    const now = Number(gsap.getProperty(turnRef.current, 'rotateY')) || 0
    const target = Math.round(now / 180) * 180
    gsap.to(turnRef.current, { rotateY: target, duration: 0.6, ease: 'power3.out' })
    onTurn(Math.abs(target / 180) % 2 === 1)
  }

  const label = `${TEE.name.en}, ${variant.en}, ${back ? 'back' : 'front'}. Drag to turn it.`
  return (
    <div
      role="img"
      aria-label={label}
      data-en="Drag to turn the tee"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={cn(
        'absolute left-1/2 top-[3%] w-[64%] -translate-x-1/2 cursor-grab touch-pan-y select-none transition-[scale] duration-500 ease-out [perspective:900px]',
        forward && 'scale-[1.07]',
        held && 'cursor-grabbing'
      )}
    >
      <div ref={turnRef} className="relative transform-3d">
        <div className={cn('relative transform-3d origin-top motion-safe:animate-tee-sway', held && '[animation-play-state:paused]')}>
          <div className="backface-hidden">
            <TeeFace variant={variant} side="front" />
          </div>
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <TeeFace variant={variant} side="back" />
          </div>
        </div>
      </div>
    </div>
  )
}

const TEE_FRONT = 'M68 32 C80 50 120 50 132 32 L166 42 L198 80 L174 104 L160 92 L162 228 Q100 234 38 228 L40 92 L26 104 L2 80 L34 42 Z'
const TEE_BACK = 'M68 32 C82 40 118 40 132 32 L166 42 L198 80 L174 104 L160 92 L162 228 Q100 234 38 228 L40 92 L26 104 L2 80 L34 42 Z'

function TeeFace({ variant, side }) {
  const id = `p26-tee-${variant.id}-${side}`
  const photo = variant.photos?.[side]
  if (photo) return <img src={photo} alt="" className="block w-full" draggable={false} />
  const front = side === 'front'
  const shape = front ? TEE_FRONT : TEE_BACK
  const kn = "'Baloo Tamma 2 Variable', sans-serif"
  return (
    <svg viewBox="0 0 200 236" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset=".22" stopColor="#000" stopOpacity="0" />
          <stop offset=".48" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id={`${id}-fall`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
      </defs>
      {/* Hanger */}
      <path d="M100 2 C92 2 90 12 97 13 L100 20" fill="none" stroke="#b8862b" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M48 44 Q100 16 152 44" fill="none" stroke="#7a4a24" strokeWidth="6" strokeLinecap="round" />
      {/* Cloth */}
      <path d={shape} transform="translate(4 6)" fill="#000" opacity=".35" />
      <path d={shape} fill={variant.body} />
      <path d={shape} fill={`url(#${id}-shade)`} />
      <path d={shape} fill={`url(#${id}-fall)`} />
      <g fill="none" strokeLinecap="round">
        <path d="M44 96 C50 140 46 180 50 226" stroke="#000" strokeOpacity=".16" strokeWidth="4" />
        <path d="M156 96 C150 140 154 180 150 226" stroke="#000" strokeOpacity=".16" strokeWidth="4" />
        <path d="M86 150 C90 180 86 204 90 228" stroke="#000" strokeOpacity=".1" strokeWidth="3" />
        <path d="M118 140 C114 170 120 196 116 228" stroke="#fff" strokeOpacity=".06" strokeWidth="3" />
        <path d="M8 86 L28 106 M192 86 L172 106" stroke="#000" strokeOpacity=".3" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M40 222 Q100 228 160 222" stroke="#000" strokeOpacity=".3" strokeWidth="1" strokeDasharray="2 2" />
        <path d={front ? 'M68 32 C80 50 120 50 132 32' : 'M68 32 C82 40 118 40 132 32'} stroke="#000" strokeOpacity=".3" strokeWidth="6" />
        <path d={front ? 'M68 32 C80 50 120 50 132 32' : 'M68 32 C82 40 118 40 132 32'} stroke={variant.body} strokeWidth="3" />
      </g>
      {/* Print */}
      {front ? (
        <g textAnchor="middle" fontFamily={kn} fontWeight="800">
          <text x="100" y="128" fontSize="46" fill={variant.print} stroke={variant.ink} strokeWidth="1.4" paintOrder="stroke">
            ಪರ್ವ
          </text>
          <rect x="62" y="140" width="76" height="11" fill={variant.ink} />
          {[66, 76, 86, 96, 106, 116, 126].map((x) => (
            <rect key={x} x={x} y="142.5" width="5" height="2" fill={variant.body} />
          ))}
          {[66, 76, 86, 96, 106, 116, 126].map((x) => (
            <rect key={`b${x}`} x={x} y="146.5" width="5" height="2" fill={variant.body} />
          ))}
          <text x="100" y="170" fontSize="13" letterSpacing="4" fill={variant.print}>
            ೨೦೨೬
          </text>
          <text x="100" y="186" fontSize="7.5" fontWeight="600" fill={variant.print} opacity=".9">
            ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ
          </text>
        </g>
      ) : (
        <g textAnchor="middle" fontFamily={kn} fontWeight="800" fill={variant.print}>
          <text x="100" y="72" fontSize="15">
            ಪರ್ವ ೨೦೨೬
          </text>
          <text x="100" y="118" fontSize="23" stroke={variant.ink} strokeWidth="1" paintOrder="stroke">
            ಕನ್ನಡ ವೇದಿಕೆ
          </text>
          <text x="100" y="134" fontSize="8.5" letterSpacing="2.5" fontFamily="'Bebas Neue', sans-serif" fontWeight="400">
            NITK SURATHKAL
          </text>
        </g>
      )}
    </svg>
  )
}

// A paper tag on a string from the rod: the price, struck through when the
// early price is running.
function PriceTag({ price, early }) {
  return (
    <div className="pointer-events-none absolute right-[5%] top-[7%] flex flex-col items-center">
      <span aria-hidden className="h-10 w-px bg-[#e9dcc0]/80" />
      <p className="rotate-[6deg] rounded-[3px] bg-[#f3ead5] px-2 pb-1.5 pt-2 text-center text-[#1d1a17] shadow-[0_3px_5px_rgba(0,0,0,.5)]" style={{ ...paper, clipPath: 'polygon(20% 0, 80% 0, 100% 16%, 100% 100%, 0 100%, 0 16%)' }}>
        {early ? (
          <>
            <span className="block font-kn-body text-base font-semibold leading-none line-through decoration-kumkuma decoration-2">₹{price}</span>
            <span className="block font-kn-display text-xl font-extrabold leading-tight text-kumkuma">₹{early}</span>
          </>
        ) : (
          <span className="block font-kn-display text-xl font-extrabold leading-tight">₹{price}</span>
        )}
      </p>
    </div>
  )
}

// A red paper flag: the First Day First Show price, and how many are left.
function EarlyFlag({ subtitles }) {
  return (
    <p className="-rotate-2 bg-kumkuma px-3 py-1.5 text-[#fff4dc] shadow-[0_3px_5px_rgba(0,0,0,.4)]" style={{ clipPath: 'polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%)' }}>
      <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight">
        ಮೊದಲ ದಿನ ಮೊದಲ ಆಟ
      </span>
      <En className="block text-[0.8rem] font-semibold leading-tight">First Day First Show price</En>
      <span className="block text-base font-bold leading-tight">
        {TEE.earlySold}/{TEE.earlyQuota} <span lang="kn">ಮಾರಾಟ</span>
        {subtitles && ' · sold'}
      </span>
    </p>
  )
}

function SizeChart({ subtitles }) {
  return (
    <div className="mt-3 rotate-[-0.6deg] bg-paper px-3 py-2 text-pen shadow-[0_3px_6px_rgba(0,0,0,.4)]" style={paper}>
      <table className="w-full text-center text-base">
        <caption className="text-left font-kn-display text-sm font-semibold">
          <span lang="kn">ಅಳತೆ (ಇಂಚುಗಳಲ್ಲಿ)</span>
          <En className="font-kn-body"> · Size, in inches</En>
        </caption>
        <thead>
          <tr className="font-kn-display text-sm">
            <th scope="col" className="font-semibold">
              {subtitles ? 'Size' : <span lang="kn">ಅಳತೆ</span>}
            </th>
            <th scope="col" className="font-semibold">
              {subtitles ? 'Chest' : <span lang="kn">ಎದೆ</span>}
            </th>
            <th scope="col" className="font-semibold">
              {subtitles ? 'Length' : <span lang="kn">ಉದ್ದ</span>}
            </th>
          </tr>
        </thead>
        <tbody className="font-semibold">
          {TEE.sizes.map((s) => (
            <tr key={s.id} className="border-t border-pen/15">
              <th scope="row" className="font-poster text-lg font-normal">
                {s.id}
              </th>
              <td>{s.chest}</td>
              <td>{s.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ClosedBoard({ subtitles }) {
  return (
    <p className="absolute inset-x-[10%] top-[38%] z-20 rotate-[-4deg] rounded-[3px] border-[3px] border-[#fff4dc] bg-kumkuma px-3 py-2 text-center text-[#fff4dc] shadow-[0_6px_10px_rgba(0,0,0,.5)]">
      <span lang="kn" className="block font-kn-display text-2xl font-extrabold leading-none">
        ಬುಕಿಂಗ್ ಮುಗಿದಿದೆ
      </span>
      <En className="block font-poster text-xl leading-none tracking-[0.2em]">Booking closed</En>
    </p>
  )
}

// The showcase's glass door, hinged on the left, with a brass handle. A tap
// swings it open toward you, with a small overshoot like a stiff hinge; with
// reduced motion it just fades.
function GlassDoor({ open, onOpen, subtitles }) {
  const reduced = usePrefersReducedMotion()
  return (
    <button
      type="button"
      onClick={onOpen}
      inert={open}
      aria-label="Open the showcase"
      data-en="Open the showcase"
      className={cn(
        'group/door absolute inset-2.5 z-20 origin-left rounded-[2px] border-[5px] border-[#6e4322] shadow-[inset_0_0_0_1px_rgba(255,220,170,.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
        reduced ? 'transition-opacity duration-300' : 'transition-[rotate,opacity] duration-700 ease-[cubic-bezier(.3,1.35,.5,1)]',
        open ? cn('pointer-events-none', reduced ? 'opacity-0' : '[rotate:y_-100deg]') : 'hover:[rotate:y_-5deg]'
      )}
      style={{
        backgroundImage:
          'linear-gradient(120deg, transparent 12%, rgba(255,255,255,.16) 16%, transparent 22%, transparent 68%, rgba(255,255,255,.09) 71%, transparent 76%), linear-gradient(rgba(200,235,230,.06), rgba(200,235,230,.06))',
      }}
    >
      {/* Handle, and a small brass plate that says what to do */}
      <span aria-hidden className="absolute right-1 top-1/2 h-9 w-2.5 -translate-y-1/2 rounded-[3px] shadow-[0_2px_3px_rgba(0,0,0,.5)]" style={brass} />
      <span aria-hidden className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[2px] px-2 py-0.5 text-center shadow-[0_2px_3px_rgba(0,0,0,.45)]" style={brass}>
        <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight text-[#4a3208]">
          ತೆರೆಯಿರಿ
        </span>
        <En className="block font-poster text-xs leading-none tracking-widest text-[#4a3208]">Open</En>
      </span>
    </button>
  )
}
