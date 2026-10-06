import { useEffect, useRef, useState } from 'react'
import { En, usePrefs } from '@p26/lib/prefs'
import { TEE, eventDay } from '@p26/content'
import { PERFORATED } from '@p26/ui/coupon'
import { gsap } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { Tee3D } from '@p26/ui/stalls/tee-3d'
import { PriceTag, EarlyFlag, SizeChart, ClosedBoard, GlassDoor } from '@p26/ui/stalls/showcase-parts'
import { createPayment } from '../../../api/payments'
import { load } from '@cashfreepayments/cashfree-js'
import API_URL from '../../../api/api'

const closesAt = (iso) => new Date(`${iso}T23:59:59+05:30`).getTime()

export function MarketMerchOverlay({ onClose, cart, setCart }) {
  const [user, setUser] = useState(undefined)
  
  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null))
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20 animate-fadeIn" onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose() }} style={{
        backgroundColor: '#563520',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%23452917' fill-opacity='0.8'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '84px 88px'
      }}>
      <div className="fixed top-4 right-4 z-[70] flex items-center gap-4">
        {user && (
          <a href="/my-orders" className="bg-[#f3ead5] text-[#4a2a12] px-4 py-1.5 rounded-full font-bold shadow-md hover:-translate-y-0.5 transition-transform">
            My Orders
          </a>
        )}
        <button onClick={onClose} className="text-white text-4xl opacity-80 hover:opacity-100 focus:outline-none drop-shadow-md">&times;</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-[80rem] w-full mt-8" onClick={(e) => e.stopPropagation()}>
        <MerchDesignCard initialVariant="orange" user={user} cart={cart} setCart={setCart} />
        <MerchDesignCard initialVariant="purple" user={user} cart={cart} setCart={setCart} />
      </div>
    </div>
  )
}

function MerchDesignCard({ initialVariant, user, cart, setCart }) {
  const { subtitles } = usePrefs()
  const [variantId, setVariantId] = useState(initialVariant)
  const [size, setSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [back, setBack] = useState(true)
  const [chart, setChart] = useState(false)
  const [hint, setHint] = useState(false)
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const sizesRef = useRef(null)
  const shopRef = useRef(null)
  const variant = TEE.variants.find((v) => v.id === variantId)
  const closed = Date.now() > closesAt(TEE.closes)
  const early = TEE.earlySold < TEE.earlyQuota
  const price = early ? variant.earlyPrice : variant.price
  const closeDay = eventDay(TEE.closes)

  const totalPrice = price * quantity

  // A size sold out in the new colour can't stay picked.
  useEffect(() => {
    if (size && variant.soldOut.includes(size)) setSize(null)
  }, [variant, size])

  const addToCart = (e) => {
    e.preventDefault()

    if (user === null) {
      window.location.href = `${API_URL}/auth/iris?redirect=/parva-26/market`
      return
    }

    if (!size) {
      setHint(true)
      gsap.fromTo(sizesRef.current, { x: 0 }, { keyframes: { x: [0, -6, 5, -3, 2, 0] }, duration: 0.45, ease: 'none' })
      return
    }

    const groupKey = variantId === 'black' ? 'tshirt-a' : 'tshirt-b'
    const productId = `${groupKey}-${size.toLowerCase()}`
    const name = `Parva Tee (${variant.en})`

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item)
      } else {
        return [...prev, { productId, name, size, price, quantity }]
      }
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div ref={shopRef} id="angadi" className={cn('relative flex flex-col items-center')}>
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

          <PriceTag price={variant.price} early={early ? variant.earlyPrice : null} />

          {/* Order deadline, on a card propped at the back of the shelf */}
          <p className="absolute bottom-[5%] left-[4%] rotate-[-2deg] scale-[0.80] origin-bottom-left rounded-[2px] bg-[#f3ead5] px-2 py-1 text-[#1d1a17] shadow-[0_2px_4px_rgba(0,0,0,.45)]" style={paper}>
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
              {TEE.variants.filter(v => v.id === initialVariant).map((v) => (
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

        <fieldset className="mt-4">
          <legend className="mb-1.5 font-kn-display text-base font-semibold text-[#f3ead5]">
            <span lang="kn">ಪ್ರಮಾಣ</span>
            <En className="font-kn-body"> · Quantity</En>
          </legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] disabled:opacity-50"
              disabled={quantity <= 1 || closed}
            >-</button>
            <span className="font-poster text-xl text-[#f3ead5] w-6 text-center tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => Math.min(5, q + 1))}
              className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] disabled:opacity-50"
              disabled={quantity >= 5 || closed}
            >+</button>
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {early && !closed && <EarlyFlag subtitles={subtitles} />}
          {closed ? (
            <p className="font-kn-display text-lg font-bold text-[#f3ead5]">
              <span lang="kn">ಬುಕ್ಕಿಂಗ್ ಮುಚ್ಚಿದೆ</span>
              <En className="block font-kn-body text-base">Booking closed</En>
            </p>
          ) : (
            <button
              type="button"
              onClick={addToCart}
              data-en="Add to Cart"
              disabled={added}
              className="group relative ml-auto block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina disabled:opacity-80"
            >
              <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-5 pr-4 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
                <span className="flex flex-col">
                  <span lang="kn" className="font-kn-display text-xl font-extrabold leading-none">
                    {user === null ? "IRIS ಲಾಗಿನ್" : (added ? "ಸೇರಿಸಲಾಗಿದೆ!" : "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ")}
                  </span>
                  <span className="mt-1 font-kn-body text-base font-bold leading-none">
                    {user === null ? "Login with IRIS" : (added ? "Added to Cart" : "Add to Cart")}
                  </span>
                </span>
                <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
              </span>
            </button>
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


