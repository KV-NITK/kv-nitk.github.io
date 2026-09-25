import { useEffect, useRef, useState } from 'react'
import { En, usePrefs } from '@p26/lib/prefs'
import { TEE, eventDay } from '@p26/content'
import { PERFORATED } from '@p26/ui/coupon'
import { gsap } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { Tee3D } from '@p26/scenes/08-interval/tee-3d'
import { PriceTag, EarlyFlag, SizeChart, ClosedBoard, GlassDoor } from '@p26/scenes/08-interval/showcase-parts'

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
