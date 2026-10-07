import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { En, usePrefs } from '@p26/lib/prefs'
import { TEE, MEAL, MENU, eventDay } from '@p26/content'
import { gsap } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { shirtName } from '@/lib/shirtName'
import { Tee3D } from '@p26/ui/stalls/tee-3d'
import { PriceTag, GlassDoor } from '@p26/ui/stalls/showcase-parts'
import { FeastPoster } from '@p26/ui/stalls/feast-poster'
import { PERFORATED } from '@p26/ui/coupon'

import API_URL from '../../../api/api'
import { getProducts } from '../../../api/payments'
import { useStoredState } from '@p26/lib/storage'
import { BuyNow } from '@p26/merch/buy-now'

// One card per t-shirt design, with its fit and sizes in the order the
// catalog lists them. Names, fits, sizes and prices all come from the server;
// only the drawing of the tee is local.
const groupDesigns = (products) => {
  const designs = new Map()
  for (const p of products) {
    if (p.category !== 'MERCH') continue
    if (!designs.has(p.groupKey)) designs.set(p.groupKey, { key: p.groupKey, fit: p.fit, sizes: [] })
    designs.get(p.groupKey).sizes.push(p)
  }
  return [...designs.values()]
}

// The shop: one card per design and a single Buy Now for the whole order.
export function MerchShop() {
  const { subtitles } = usePrefs()
  const [user, setUser] = useState(undefined)
  const [designs, setDesigns] = useState(null)
  const [goodie, setGoodie] = useState(null) // the free-with-a-shirt extra, if the shop has one
  const [loadError, setLoadError] = useState('')
  // One size per shirt for each design, by design key: "" is a shirt whose
  // size is not chosen yet. A design with no shirts is not part of the order.
  // Kept in this browser, so the order is still there after the IRIS login
  const [picks, setPicks] = useStoredState('merch_order', {})
  const [attempts, setAttempts] = useState(0) // Buy Now presses that were refused
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null))

    getProducts()
      .then((products) => {
        setDesigns(groupDesigns(products))
        setGoodie(products.find((p) => p.category === 'GOODIE') ?? null)
      })
      .catch((e) => setLoadError(e.message))
  }, [])

  const setDesignPicks = (key, update) =>
    setPicks((prev) => ({ ...prev, [key]: typeof update === 'function' ? update(prev[key] || []) : update }))

  const missingSize = (key) => (picks[key] || []).some((v) => !v)

  // The shirts with a size chosen as order lines, and how many shirts were asked for
  const { lines, shirts } = useMemo(() => {
    const lines = []
    let shirts = 0
    for (const { key, fit, sizes } of designs || []) {
      // Shirts of the same size become one order line
      const counts = new Map()
      for (const v of picks[key] || []) {
        shirts++
        if (v) counts.set(v, (counts.get(v) || 0) + 1)
      }
      for (const [variant, count] of counts) {
        const product = sizes.find((p) => p.variant === variant)
        // A size no longer on sale leaves the order incomplete
        if (!product) continue
        lines.push({ productId: product.id, name: shirtName(product.id, product.name), fit, size: variant, price: product.unitPrice, quantity: Math.min(product.maxQuantity, count) })
      }
    }
    return { lines, shirts }
  }, [designs, picks])

  return (
    <div className="flex min-h-screen justify-center p-4 pb-20 pt-24" style={{
        backgroundColor: '#563520',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%23452917' fill-opacity='0.8'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '84px 88px'
      }}>
      <div className="w-full max-w-[80rem]">
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="relative">
            <button type="button" onClick={() => setShowContact(!showContact)} className="rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5">
              Contact
            </button>
            {showContact && (
              <div className="absolute top-full right-0 mt-2 bg-[#f3ead5] text-[#4a2a12] p-3 rounded-md shadow-lg z-50 whitespace-nowrap border border-[#4a2a12]/20">
                <p className="font-bold">Puneeth</p>
                <a href="tel:+917349064226" className="hover:underline">+91 734 906 4226</a>
              </div>
            )}
          </div>
          {/* Always there. Logged out, the orders page asks for the IRIS login and brings you back to it */}
          <Link to="/my-orders" className="rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5">
            My Orders
          </Link>
        </div>

        <div className="flex flex-col gap-16">
          {/* ── Food Section ── */}
          <section>
            <BhooriBhojanaSection />
          </section>

          {/* ── Merch Section ── */}
          <section>
            {/* The shop's sign, once for all the shirts */}
            <h1 className="mx-auto mt-6 w-fit rounded-[6px] bg-kumkuma px-8 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_0.5rem_1rem_rgba(0,0,0,.4)]">
              <span className={cn('block font-poster text-3xl leading-none tracking-[0.2em]', !subtitles && 'sr-only')}>Parva Angadi · Merch</span>
              <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight text-arishina">
                ಪರ್ವ ಅಂಗಡಿ
              </span>
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
              {designs?.map((design, i) => (
                <MerchDesignCard key={design.key} design={design} art={TEE.variants[i % TEE.variants.length]} picks={picks[design.key] || []} setPicks={(update) => setDesignPicks(design.key, update)} showMissing={attempts > 0 && missingSize(design.key)} attempts={attempts} />
              ))}
              {designs?.length === 0 && <p className="col-span-full text-center font-poster text-xl text-[#f3ead5]">No merch on sale right now.</p>}
              {!designs && (
                <p role="status" className="col-span-full text-center font-poster text-xl text-[#f3ead5]">
                  {loadError || 'Loading…'}
                </p>
              )}
            </div>

            {designs?.length > 0 && <BuyNow lines={lines} shirts={shirts} goodie={goodie} user={user} onRefused={() => setAttempts((n) => n + 1)} />}
          </section>
        </div>
      </div>
    </div>
  )
}

function MerchDesignCard({ design, art, picks, setPicks, showMissing, attempts }) {
  const { subtitles } = usePrefs()
  const [back, setBack] = useState(true)
  const [open, setOpen] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const sizesRef = useRef(null)
  const shopRef = useRef(null)
  const { fit, sizes } = design
  const shown = sizes[0]
  const quantity = picks.length
  const maxQuantity = shown.maxQuantity

  // Starts at none: a design only joins the order once it has a shirt
  const setQuantity = (next) => {
    setPicks((prev) => {
      const qty = Math.max(0, Math.min(maxQuantity, next))
      return Array.from({ length: qty }, (_, i) => prev[i] ?? '')
    })
    if (next > 0) setOpen(true)
  }

  // A refused Buy Now shakes the sizes that are still to pick
  useEffect(() => {
    if (attempts > 0 && sizesRef.current && picks.some((v) => !v)) {
      gsap.fromTo(sizesRef.current, { x: 0 }, { keyframes: { x: [0, -6, 5, -3, 2, 0] }, duration: 0.45, ease: 'none' })
    }
  }, [attempts])

  const setPick = (index, variant) => {
    setPicks((prev) => prev.map((v, i) => (i === index ? variant : v)))
    setOpen(true)
  }

  return (
    <div ref={shopRef} id="angadi" className={cn('relative flex flex-col items-center')}>
      {showSizeChart && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" 
          onClick={() => setShowSizeChart(false)}
        >
          <div 
            className="relative max-h-full max-w-2xl overflow-auto rounded-lg bg-[#f3ead5] p-2 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setShowSizeChart(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              ✕
            </button>
            <img src="/parva-26/tshirt_size_chart.jpeg" alt="Size Chart" className="h-auto w-full object-contain rounded" />
          </div>
        </div>
      )}
      {/* The cabinet */}
      <div className="relative w-full max-w-[24rem] rounded-t-[6px] p-2.5 shadow-[0_1rem_1.4rem_-0.6rem_rgba(20,30,20,.55)] [perspective:1800px]" style={{ backgroundImage: TEAK }}>
        <div
          className="relative aspect-[1/1] overflow-hidden rounded-[2px] shadow-[inset_0_0.5rem_1rem_rgba(0,0,0,.5)]"
          style={{ backgroundImage: 'radial-gradient(ellipse 55% 60% at 50% 30%, rgba(255,226,170,.35), transparent 70%), linear-gradient(180deg, #274442, #16302e 70%, #0f2321)' }}
        >
          {/* Strip light and brass rod */}
          <span aria-hidden className="absolute inset-x-[10%] top-1 h-1 rounded-full bg-[#fff3d0] shadow-[0_0_12px_4px_rgba(255,226,160,.6)]" />
          <span aria-hidden className="absolute inset-x-[6%] top-[7%] h-1.5 rounded-full shadow-[0_2px_2px_rgba(0,0,0,.5)]" style={brass} />

          <Tee3D variant={art} back={back} onTurn={setBack} forward={open} />

          <PriceTag price={shown.unitPrice} />

        </div>
        <GlassDoor open={open} onOpen={() => setOpen(true)} subtitles={subtitles} />
      </div>

      {/* The counter top in front, with the choices on it */}
      <div className="relative w-full max-w-[26rem] rounded-[4px] px-4 pb-5 pt-4 shadow-[0_1rem_1.2rem_-0.6rem_rgba(20,30,20,.6)]" style={{ backgroundImage: COUNTER }}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          {fit && (
            <p className="font-kn-body text-base font-bold leading-tight text-[#f3ead5]">
              {fit}
              <span className="block text-sm font-semibold text-arishina">₹{shown.unitPrice}</span>
            </p>
          )}

          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={() => setShowSizeChart(true)}
              className="flex min-h-11 items-center gap-2 rounded-full bg-black/25 px-3 text-[#f3ead5] ring-1 ring-[#c9a052]/50 transition-colors hover:bg-black/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
            >
              <span className="text-left leading-tight">
                <En className="block font-kn-display text-sm font-semibold">Size Chart</En>
                <span lang="kn" className="block text-xs">
                  ಗಾತ್ರದ ಪಟ್ಟಿ
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBack((b) => !b)
                setOpen(true)
              }}
              className="flex min-h-11 items-center gap-2 rounded-full bg-black/25 px-3 text-[#f3ead5] ring-1 ring-[#c9a052]/50 transition-colors hover:bg-black/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
            >
              <span aria-hidden className="size-3 rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,.5)]" style={brass} />
              <span className="text-left leading-tight">
                <En className="block font-kn-display text-sm font-semibold">{back ? 'See the front' : 'See the back'}</En>
                <span lang="kn" className="block text-xs">
                  {back ? 'ಮುಂಭಾಗ ನೋಡಿ' : 'ಹಿಂಭಾಗ ನೋಡಿ'}
                </span>
              </span>
            </button>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="mb-1.5 font-kn-display text-base font-semibold text-[#f3ead5]">
            <En>Quantity · </En>
            <span lang="kn" className="font-kn-body text-sm">ಪ್ರಮಾಣ</span>
          </legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] disabled:opacity-50"
              disabled={quantity <= 0}
            >-</button>
            <span className="font-poster text-xl text-[#f3ead5] w-6 text-center tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] disabled:opacity-50"
              disabled={quantity >= maxQuantity}
            >+</button>
          </div>
        </fieldset>

        {quantity > 0 && (
        <fieldset className="mt-4">
          <legend className="mb-1.5 font-kn-display text-base font-semibold text-[#f3ead5]">
            <En>Size of each shirt · </En>
            <span lang="kn" className="font-kn-body text-sm">ಅಳತೆ</span>
          </legend>
          <div ref={sizesRef} className="space-y-2">
            {picks.map((variant, i) => (
              <label key={i} className="flex items-center gap-3 font-kn-body text-base font-semibold text-[#f3ead5]">
                <span className="w-16">Shirt {i + 1}</span>
                <select
                  value={variant}
                  onChange={(e) => setPick(i, e.target.value)}
                  className={cn(
                    'min-h-10 rounded-[4px] bg-[#f3ead5] px-2 font-poster text-lg text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
                    showMissing && !variant && 'ring-2 ring-arishina'
                  )}
                >
                  <option value="">Select size</option>
                  {sizes.map((p) => (
                    <option key={p.id} value={p.variant}>
                      {p.variant}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>
        )}

        <p role="status" className={cn('mt-2 text-right font-kn-display text-base font-semibold text-arishina', !showMissing && 'sr-only')}>
          {showMissing && (
            <>
              <En>Pick a size for every shirt · </En>
              <span lang="kn" className="font-kn-body text-sm">ಪ್ರತಿ ಶರ್ಟ್‌ಗೂ ಅಳತೆ ಆರಿಸಿ</span>
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

// ── Bhoori Bhojana section ────────────────────────────────────────────────────

// The food-coupon catalog embedded in the merch page. Mirrors the old
// /parva-26/food-coupons page layout: FeastPoster on the left, BookingCounter
// on the right; clicking the coupon reveals the MealTicket inline.
function BhooriBhojanaSection() {
  const { subtitles } = usePrefs()
  const [quantity, setQuantity] = useState(0)

  return (
    <div className="mt-10 mb-24 flex flex-col items-center gap-6">
      {/* Section header — same red tablet banner style as the page title */}
      <h2 className="w-fit rounded-[6px] bg-kumkuma px-8 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_0.5rem_1rem_rgba(0,0,0,.4)]">
        <span className="block font-poster text-3xl leading-none tracking-[0.2em]">
          Bhoori Bhojana · Food Coupons
        </span>
        <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight text-arishina">
          ಭೂರಿ ಭೋಜನ · ಬಾಳೆ ಎಲೆ ಊಟ
        </span>
      </h2>

      <div className="flex w-full flex-col items-center justify-center gap-10 px-4 py-4 xl:flex-row xl:items-start xl:gap-12">
        {/* The poster with the banana leaf animation */}
        <div className="w-full max-w-md shrink-0">
          <FeastPoster />
        </div>

        <div className="flex w-full max-w-2xl shrink flex-col gap-6">
          {/* Menu key: what is served, in traditional order */}
          <div className="w-full rounded-[6px] p-1 shadow-[0_0.6rem_1rem_-0.3rem_rgba(20,30,20,.55)]" style={{ backgroundImage: 'linear-gradient(180deg, #6a4424, #4a2c14)' }}>
            <div className="rounded-[3px] px-5 py-4" style={{ backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 10%, rgba(139,42,24,.45), transparent 70%), linear-gradient(180deg, #2f3531, #232826)' }}>
              <p className="mb-3 text-center font-poster text-base tracking-[0.2em] text-[#f6e3bc]">
                <En>MENU · </En><span lang="kn" className="font-kn-display text-sm">ಇಂದಿನ ತಟ್ಟೆ</span>
              </p>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {MENU.map((item) => (
                  <li key={item.id} className="flex flex-col items-center text-center">
                    <span lang="kn" className="font-kn-display text-sm font-bold text-arishina">{item.kn}</span>
                    <span className="font-kn-body text-xs text-[#f6e3bc]/75">{item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Price Slate & Booking Button */}
          <div className="w-full rounded-[6px] p-1 shadow-[0_0.6rem_1rem_-0.3rem_rgba(20,30,20,.55)]" style={{ backgroundImage: 'linear-gradient(180deg, #6a4424, #4a2c14)' }}>
            <div className="rounded-[3px] px-5 py-4 text-center flex flex-col items-center" style={{ backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 10%, rgba(139,42,24,.45), transparent 70%), linear-gradient(180deg, #2f3531, #232826)' }}>
              
              {/* Top Row: Quantity & Price */}
              <div className="flex w-full items-center justify-between mb-4 mt-2 px-2">
                
                {/* Quantity Counter */}
                <div className="flex flex-col items-start gap-2">
                  <span className="font-kn-display text-sm font-semibold text-[#f3ead5]">
                    <En>Quantity · </En>
                    <span lang="kn" className="font-kn-body text-sm">ಪ್ರಮಾಣ</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(0, quantity - 1))}
                      className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] disabled:opacity-50 transition-transform active:scale-95"
                      disabled={quantity <= 0}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-poster text-2xl tabular-nums text-[#f3ead5]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="grid size-9 place-items-center rounded-[4px] bg-[#f3ead5] font-poster text-xl text-[#4a2a12] shadow-[0_2px_3px_rgba(0,0,0,.5)] transition-transform active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Chalk Price */}
                <div className="flex flex-col items-end">
                  <p className="flex items-center text-[#f4f1e6] [text-shadow:0_0_1px_rgba(244,241,230,.9),0_0_6px_rgba(244,241,230,.25)]">
                    <span className="font-sans text-5xl font-medium opacity-90 mr-1 mt-1">₹</span>
                    <span className="text-6xl font-bold tracking-tight" style={{ fontFamily: '"Chalkboard", "Chalkboard SE", "Comic Sans MS", "Akaya Kanadaka", cursive' }}>
                      {199 * quantity}
                    </span>
                  </p>
                </div>
              </div>

              <p className="font-kn-display text-[#f6e3bc] text-lg mb-6 text-center">
                <span lang="kn" className="block">ನವೆಂಬರ್ 1 - ಮಧ್ಯಾಹ್ನ 12:00</span>
                <En className="block text-sm font-kn-body opacity-90 mt-0.5">1 Nov, 12:00 PM onwards</En>
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

