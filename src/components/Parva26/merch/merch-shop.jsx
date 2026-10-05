import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { En, usePrefs } from '@p26/lib/prefs'
import { TEE } from '@p26/content'
import { PERFORATED } from '@p26/ui/coupon'
import { gsap } from '@p26/lib/gsap'
import { brass } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { Tee3D } from '@p26/ui/stalls/tee-3d'
import { PriceTag, GlassDoor } from '@p26/ui/stalls/showcase-parts'
import API_URL from '../../../api/api'
import { getProducts } from '../../../api/payments'

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

// The shop: one card per design. `onOpenCart` opens the cart that the page owns.
export function MerchShop({ cart, setCart, onOpenCart }) {
  const [user, setUser] = useState(undefined)
  const [designs, setDesigns] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null))

    getProducts()
      .then((products) => setDesigns(groupDesigns(products)))
      .catch((e) => setLoadError(e.message))
  }, [])

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="flex min-h-screen justify-center p-4 pb-20 pt-24" style={{
        backgroundColor: '#563520',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%23452917' fill-opacity='0.8'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '84px 88px'
      }}>
      <div className="w-full max-w-[80rem]">
        <div className="flex flex-wrap items-center justify-end gap-4">
          {user && (
            <Link to="/my-orders" className="rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5">
              My Orders
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {designs?.map((design, i) => (
            <MerchDesignCard key={design.key} design={design} art={TEE.variants[i % TEE.variants.length]} setCart={setCart} user={user} onOpenCart={onOpenCart} />
          ))}
          {designs?.length === 0 && <p className="col-span-full text-center font-poster text-xl text-[#f3ead5]">No merch on sale right now.</p>}
          {!designs && (
            <p role="status" className="col-span-full text-center font-poster text-xl text-[#f3ead5]">
              {loadError || 'Loading…'}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenCart}
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full bg-[#f3ead5] px-5 py-3 font-bold text-[#4a2a12] shadow-[0_6px_18px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-0.5"
      >
        <span aria-hidden className="text-xl">🛒</span>
        <span>Cart ({cartItemCount})</span>
      </button>
    </div>
  )
}

function MerchDesignCard({ design, art, setCart, user, onOpenCart }) {
  const { subtitles } = usePrefs()
  // One size per shirt: "" is a shirt whose size is not chosen yet
  const [picks, setPicks] = useState([''])
  const [back, setBack] = useState(false)
  const [hint, setHint] = useState(false)
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const sizesRef = useRef(null)
  const shopRef = useRef(null)
  const { fit, sizes } = design
  const shown = sizes[0]
  const quantity = picks.length
  const maxQuantity = shown.maxQuantity

  // Changing the order makes the button add again instead of buying
  const setQuantity = (next) => {
    setAdded(false)
    setPicks((prev) => {
      const qty = Math.max(1, Math.min(maxQuantity, next))
      return Array.from({ length: qty }, (_, i) => prev[i] ?? '')
    })
  }

  const setPick = (index, variant) => {
    setAdded(false)
    setPicks((prev) => prev.map((v, i) => (i === index ? variant : v)))
    setHint(false)
    setOpen(true)
  }

  const addToCart = (e) => {
    e.preventDefault()

    if (picks.some((v) => !v)) {
      setHint(true)
      gsap.fromTo(sizesRef.current, { x: 0 }, { keyframes: { x: [0, -6, 5, -3, 2, 0] }, duration: 0.45, ease: 'none' })
      return
    }

    // Shirts of the same size become one cart line
    const counts = new Map()
    for (const v of picks) counts.set(v, (counts.get(v) || 0) + 1)

    setCart((prev) => {
      let next = prev
      for (const [variant, count] of counts) {
        const { id: productId, name, unitPrice, maxQuantity } = sizes.find((p) => p.variant === variant)
        if (next.some((item) => item.productId === productId)) {
          next = next.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(maxQuantity, item.quantity + count) } : item))
        } else {
          next = [...next, { productId, name, fit, size: variant, price: unitPrice, maxQuantity, quantity: Math.min(maxQuantity, count) }]
        }
      }
      return next
    })

    setAdded(true)
  }

  // Straight to payment: IRIS first if they are not logged in (it brings them
  // back with the cart open), otherwise the cart where they pay
  const buyNow = () => {
    if (user === null) {
      window.location.href = `${API_URL}/auth/iris?redirect=${encodeURIComponent('/parva-26/merch?checkout=1')}`
      return
    }
    onOpenCart()
  }

  return (
    <div ref={shopRef} id="angadi" className={cn('relative flex flex-col items-center')}>
      <h3 className="relative z-10 -mb-1 rounded-t-[6px] bg-kumkuma px-6 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2)]">
        <span className={cn('block font-poster text-3xl leading-none tracking-[0.2em]', !subtitles && 'sr-only')}>Parva Angadi · Merch</span>
        <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight text-arishina">
          ಪರ್ವ ಅಂಗಡಿ
        </span>
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
              <En className="block font-kn-display text-sm font-semibold">{back ? 'See the front' : 'See the back'}</En>
              <span lang="kn" className="block text-xs">
                {back ? 'ಮುಂಭಾಗ ನೋಡಿ' : 'ಹಿಂಭಾಗ ನೋಡಿ'}
              </span>
            </span>
          </button>
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
              disabled={quantity <= 1}
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
                    hint && !variant && 'ring-2 ring-arishina'
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={added ? buyNow : addToCart}
            data-en={added ? "Buy Now" : "Add to Cart"}
            className="group relative ml-auto block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina"
          >
            <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-5 pr-4 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
              <span className="flex flex-col">
                <span className="font-kn-display text-2xl font-extrabold leading-none">
                  {added ? "Buy Now" : "Add to Cart"}
                </span>
                <span lang="kn" className="mt-1 font-kn-body text-sm font-bold leading-none">
                  {added ? "ಈಗಲೇ ಖರೀದಿಸಿ" : "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ"}
                </span>
              </span>
              <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
            </span>
          </button>
        </div>
        <p role="status" className={cn('mt-2 text-right font-kn-display text-base font-semibold text-arishina', !hint && 'sr-only')}>
          {hint && (
            <>
              <En>Pick a size first · </En>
              <span lang="kn" className="font-kn-body text-sm">ಮೊದಲು ಅಳತೆ ಆರಿಸಿ</span>
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


