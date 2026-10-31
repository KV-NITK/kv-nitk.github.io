import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { load } from '@cashfreepayments/cashfree-js'
import { PageShell } from '@p26/chrome/page-shell'
import { En, usePrefs } from '@p26/lib/prefs'
import { useStoredState } from '@p26/lib/storage'
import { PHOTO_BOOTH } from '@p26/content'
import { PERFORATED } from '@p26/ui/coupon'
import { PhotoStrip } from '@p26/ui/stalls/photo-strip'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import API_URL from '../../../api/api'
import { CASHFREE_MODE, createPayment, getProducts, newIdempotencyKey, quoteOrder } from '../../../api/payments'

// One catalog row per number of prints: photo-session-1 is a session with
// one print, photo-session-3 one with two extra copies (server/sql/009_photo_booth.sql)
const SESSION_ID = /^photo-session-(\d+)$/
const MAX_SESSIONS = 10
const PHONE = /^[6-9]\d{9}$/
const rupees = (n) => `₹${Number.isInteger(n) ? n : n.toFixed(2)}`
const printsLabel = (n) => `${n} print${n === 1 ? '' : 's'}`

// The cart: how many sessions of each print count, as order lines
const toItems = (sessions) => {
  const counts = new Map()
  for (const prints of sessions) counts.set(prints, (counts.get(prints) ?? 0) + 1)
  return [...counts]
    .sort(([a], [b]) => a - b)
    .map(([prints, quantity]) => ({ productId: `photo-session-${prints}`, quantity }))
}

// Photo booth sessions (/parva-26/photobooth), the only place they are sold.
// Each session is one QR code in My Orders, scanned once at the booth, and
// carries its number of prints so the booth knows how many copies to hand
// over. An order here is photo sessions only, with no merch; a coupon code has
// to be a photo booth one (payment_coupons.category = 'PHOTO'). Coming back
// from the IRIS login (?buy=1) goes on to payment.
export default function PhotoBooth() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [user, setUser] = useState(undefined)
  const [catalog, setCatalog] = useState(undefined) // prints -> product; null = not on sale
  const [loadError, setLoadError] = useState('')
  const [showContact, setShowContact] = useState(false)
  // Kept in this browser, so they are still there after the IRIS login: the
  // number of prints for each session
  const [stored, setSessions] = useStoredState('parva_photo_sessions', [1])
  const [phone, setPhone] = useStoredState('merch_phone', '')
  const [couponInput, setCouponInput] = useStoredState('photo_coupon_input', '')
  const [appliedCoupon, setAppliedCoupon] = useStoredState('photo_applied_coupon', '')
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  // True from the moment the order or coupon changes until the server's new quote is in
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  const [params, setParams] = useSearchParams()
  const resume = useRef(params.get('buy') === '1')
  const keyRef = useRef({ signature: '', key: '' })

  useEffect(() => {
    if (!params.has('buy')) return
    params.delete('buy')
    setParams(params, { replace: true })
  }, [params, setParams])

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null))

    getProducts()
      .then((products) => {
        const byPrints = new Map()
        for (const p of products) {
          const match = p.category === 'PHOTO' && SESSION_ID.exec(p.id)
          if (match) byPrints.set(Number(match[1]), p)
        }
        setCatalog(byPrints.has(1) ? byPrints : null)
      })
      .catch((e) => setLoadError(e.message))
  }, [])

  // Only print counts the catalog sells, at most MAX_SESSIONS of them
  const maxPrints = catalog ? Math.max(...catalog.keys()) : 1
  const sessions = (Array.isArray(stored) ? stored : [1])
    .filter((n) => Number.isInteger(n) && n >= 1 && (!catalog || catalog.has(n)))
    .slice(0, MAX_SESSIONS)
  const items = toItems(sessions)
  const signature = JSON.stringify([items, appliedCoupon])

  const setPrints = (i, prints) => setSessions(sessions.map((n, j) => (j === i ? prints : n)))
  const removeSession = (i) => setSessions(sessions.filter((_, j) => j !== i))
  const addSession = () => setSessions([...sessions, 1])

  // The price to pay comes from the server, never from the page
  useEffect(() => {
    setError('')
    setQuoteError('')
    if (!user || !catalog || items.length === 0) {
      setQuote(null)
      setChecking(false)
      return
    }
    let cancelled = false
    setChecking(true)
    quoteOrder({ items, couponCode: appliedCoupon })
      .then((q) => {
        if (cancelled) return
        setQuote(q)
        setChecking(false)
      })
      .catch((e) => {
        if (cancelled) return
        setQuote(null)
        setQuoteError(e.message)
        setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, catalog, signature])

  const base = catalog?.get(1)?.unitPrice
  const extra = catalog?.has(2) ? catalog.get(2).unitPrice - base : null
  const priceOf = (prints) => catalog?.get(prints)?.unitPrice ?? 0
  const subtotal = quote ? quote.subtotal : sessions.reduce((sum, n) => sum + priceOf(n), 0)
  const couponOff = quote ? quote.couponDiscount : 0
  const total = quote ? quote.total : subtotal

  // What the coupon box says; a coupon's refusal is shown here, not again below the button
  const couponNote = !appliedCoupon || items.length === 0
    ? ''
    : quoteError || (!user ? 'Log in to see your discount' : checking || !quote ? 'Checking the coupon…' : quote.couponDiscount > 0 ? `Coupon ${quote.couponCode} applied: ${rupees(quote.couponDiscount)} off` : `Coupon ${appliedCoupon} gives no discount on this order`)
  const shownError = error || (appliedCoupon ? '' : quoteError)

  const buy = async () => {
    if (items.length === 0) {
      setError('Add at least one photo session')
      return
    }
    if (!PHONE.test(phone)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    if (user === null) {
      window.location.href = `${API_URL}/auth/iris?redirect=${encodeURIComponent('/parva-26/photobooth?buy=1')}`
      return
    }

    setPaying(true)
    setError('')
    try {
      // One key per distinct checkout, kept only across network errors
      const sig = JSON.stringify([items, appliedCoupon, phone])
      if (keyRef.current.signature !== sig) keyRef.current = { signature: sig, key: newIdempotencyKey() }

      const payment = await createPayment({
        items,
        couponCode: appliedCoupon,
        customerPhone: phone,
        idempotencyKey: keyRef.current.key,
      })

      if (payment.status === 'SUCCESS') {
        window.location.href = `/payment/status?order_id=${encodeURIComponent(payment.orderId)}`
        return
      }

      const cashfree = await load({ mode: CASHFREE_MODE })
      await cashfree.checkout({ paymentSessionId: payment.paymentSessionId, redirectTarget: '_self' })
    } catch (err) {
      if (err.status) keyRef.current = { signature: '', key: '' }
      setError(err.message || 'Could not start payment')
      setPaying(false)
    }
  }

  useEffect(() => {
    if (!resume.current || user === undefined || catalog === undefined) return
    resume.current = false
    if (user && catalog && items.length > 0 && PHONE.test(phone)) buy()
  }, [user, catalog])

  return (
    <PageShell title="ಫೋಟೋ ಬೂತ್ · Photo Booth" topBar={{ home: '/parva-26#parva-sante', ticket: false }}>
      <main
        className="min-h-screen p-4 pb-20 pt-24"
        style={{ backgroundColor: '#3a0710', backgroundImage: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(242,193,46,.22), transparent 70%)' }}
      >
        <div className="mx-auto w-full max-w-[80rem]">
          <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
            {/* Same contact as the food and merch pages */}
            <div className="relative">
              <button type="button" onClick={() => setShowContact(!showContact)} className="rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5">
                Contact
              </button>
              {showContact && (
                <div className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md border border-[#4a2a12]/20 bg-[#f3ead5] p-3 text-[#4a2a12] shadow-lg">
                  <p className="font-bold">Puneeth</p>
                  <a href="tel:+917349064226" className="hover:underline">+91 734 906 4226</a>
                </div>
              )}
            </div>
            <Link to="/my-orders" className="rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5">
              My Orders
            </Link>
          </div>

          {/* The name on the flag: Kannada on the yellow, English on the red */}
          <header className="mb-10 flex flex-col items-center gap-3">
            <h1 className="w-fit overflow-hidden rounded-[6px] text-center shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_0.5rem_1rem_rgba(0,0,0,.4)]">
              <span lang="kn" className="block bg-arishina px-10 pb-1 pt-2 font-kn-display text-3xl font-extrabold leading-tight text-theatre">
                {PHOTO_BOOTH.title.kn}
              </span>
              <En className="block bg-kumkuma px-10 pb-1.5 pt-1 font-poster text-2xl leading-none tracking-[0.25em] text-[#fff4dc]">
                {PHOTO_BOOTH.title.en}
              </En>
            </h1>
            <p className="text-center font-kn-display text-lg font-bold text-arishina">
              <span lang="kn">{PHOTO_BOOTH.occasion.kn}</span>
              <En className="ml-2 font-poster text-base font-normal tracking-widest text-[#f6e3bc]/80">· {PHOTO_BOOTH.occasion.en}</En>
            </p>
          </header>

          {catalog === undefined && (
            <p role="status" className="text-center font-poster text-xl text-[#f3ead5]">{loadError || 'Loading…'}</p>
          )}
          {catalog === null && <p className="text-center font-poster text-xl text-[#f3ead5]">Photo booth sessions are not on sale right now.</p>}

          {catalog && (
            <div className="flex w-full flex-col items-center justify-center gap-12 px-4 xl:flex-row xl:items-start">
              <PhotoStrip price={base} className="shrink-0 xl:mt-4" />

              <div className="flex w-full max-w-xl flex-col items-center gap-6">
                {/* What it costs */}
                <div className="grid w-full grid-cols-2 gap-3">
                  <PriceTag label={PHOTO_BOOTH.sessionIncludes} price={rupees(base)} />
                  {extra != null && <PriceTag label={PHOTO_BOOTH.extraCopy} price={`+${rupees(extra)}`} />}
                </div>

                {/* The sessions, each with its own number of prints */}
                <div className="w-full rounded-[8px] bg-[#f3ead5] p-5 font-kn-body text-[#4a2a12] shadow-2xl">
                  <h2 className="mb-3 font-poster text-2xl font-bold">
                    <En>Your order</En>
                    <span lang="kn" className="ml-2 font-kn-body text-sm font-bold">ನಿಮ್ಮ ಆರ್ಡರ್</span>
                  </h2>

                  {sessions.length === 0 && <p className="rounded bg-[#e5d4b5] px-3 py-2 text-sm">No sessions yet. Add one below.</p>}
                  <ol className="flex flex-col gap-2">
                    {sessions.map((prints, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded bg-[#e5d4b5] px-3 py-2">
                        <span className="min-w-0 basis-full sm:basis-auto sm:flex-1">
                          <span className="block font-bold">
                            <OneOf text={PHOTO_BOOTH.session} /> {i + 1}
                          </span>
                          <span className="block text-sm opacity-80">
                            {prints > 1 ? `${printsLabel(prints)} · 1 + ${prints - 1} extra` : '1 print'}
                          </span>
                        </span>
                        <fieldset className="flex items-center gap-2">
                          <legend className="sr-only">{`Prints for session ${i + 1}`}</legend>
                          <Step onClick={() => setPrints(i, prints - 1)} disabled={prints <= 1 || paying} label={`One print fewer for session ${i + 1}`}>
                            −
                          </Step>
                          <span className="w-16 text-center text-sm font-bold tabular-nums" aria-live="polite">
                            {printsLabel(prints)}
                          </span>
                          <Step onClick={() => setPrints(i, prints + 1)} disabled={prints >= maxPrints || paying} label={`One more print for session ${i + 1}`}>
                            +
                          </Step>
                        </fieldset>
                        <span className="ml-auto w-14 text-right font-bold tabular-nums">{rupees(priceOf(prints))}</span>
                        <button
                          type="button"
                          onClick={() => removeSession(i)}
                          disabled={paying}
                          aria-label={`Remove session ${i + 1}`}
                          className="grid size-7 place-items-center rounded-full text-lg leading-none text-[#8a5530] hover:bg-[#4a2a12]/10 disabled:opacity-50"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ol>

                  <button
                    type="button"
                    onClick={addSession}
                    disabled={sessions.length >= MAX_SESSIONS || paying}
                    className="mt-3 w-full rounded border-2 border-dashed border-[#8a5530]/60 px-3 py-2 font-bold text-[#8a5530] transition-colors hover:bg-[#8a5530]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + <En>{PHOTO_BOOTH.addSession.en}</En>
                    <span lang="kn" className="ml-1 text-sm">{PHOTO_BOOTH.addSession.kn}</span>
                  </button>

                  <p className="mt-3 text-sm">Each session gets its own QR code in My Orders. Show it at the booth; it is scanned once and tells the booth how many prints to give you.</p>

                  <div className="mt-4 border-y border-[#c2aa84] py-4">
                    <label htmlFor="photo-coupon" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#6b4020]">
                      Coupon Code / ಕೂಪನ್ ಕೋಡ್
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="photo-coupon"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter coupon code"
                        maxLength={32}
                        disabled={paying}
                        className="min-w-0 flex-1 rounded border border-[#c2aa84] bg-white px-3 py-2 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-[#8a5530]"
                      />
                      <button
                        type="button"
                        onClick={() => setAppliedCoupon(couponInput.trim().toUpperCase())}
                        disabled={paying}
                        className="rounded bg-[#8a5530] px-4 py-2 text-sm font-bold text-[#f3ead5] transition-colors hover:bg-[#6b4020] disabled:opacity-50"
                      >
                        Apply
                      </button>
                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon('')
                            setCouponInput('')
                          }}
                          disabled={paying}
                          className="rounded border border-[#c2aa84] px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {couponNote && (
                      <p role="status" className={cn('mt-2.5 rounded border p-2.5 text-xs font-bold', quoteError ? 'border-red-300 bg-red-100 text-red-800' : !checking && couponOff > 0 ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-amber-300 bg-amber-100 text-amber-800')}>
                        {couponNote}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 pt-3 text-lg font-bold">
                    {couponOff > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{rupees(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-green-700">
                          <span>Coupon {quote.couponCode}</span>
                          <span>- {rupees(couponOff)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-xl">
                      <span>Total</span>
                      <span>{rupees(total)}</span>
                    </div>
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Mobile number (10 digits)"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    disabled={paying}
                    aria-label="Mobile number"
                    className="mt-4 w-full rounded border border-[#c2aa84] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#8a5530]"
                  />
                  {user === null && <p className="mt-3 text-sm font-semibold">You will log in with IRIS, then go straight to payment.</p>}
                </div>

                <button
                  type="button"
                  onClick={buy}
                  disabled={user === undefined || paying}
                  className="group relative block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina disabled:opacity-70"
                >
                  <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-6 pr-5 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
                    <span className="flex flex-col">
                      <span className="font-kn-display text-2xl font-extrabold leading-none">
                        {paying ? 'Redirecting…' : user === null ? 'Login to Book' : 'Book Now'}
                      </span>
                      <span lang="kn" className="mt-1 font-kn-body text-sm font-bold leading-none">
                        {user === null ? 'ಲಾಗಿನ್ ಮಾಡಿ ಕಾಯ್ದಿರಿಸಿ' : 'ಈಗಲೇ ಕಾಯ್ದಿರಿಸಿ'}
                      </span>
                    </span>
                    <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
                  </span>
                </button>

                <p role="alert" className={cn('text-center font-kn-display text-lg font-semibold text-arishina', !shownError && 'sr-only')}>
                  {shownError}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageShell>
  )
}

// English with subtitles on, else Kannada (the prefs live inside PageShell)
function OneOf({ text }) {
  const { subtitles } = usePrefs()
  return subtitles ? <span lang="en">{text.en}</span> : <span lang="kn">{text.kn}</span>
}

// A price on a little flag: the label on the yellow, the price on the red.
function PriceTag({ label, price }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[6px] text-center shadow-[0_0.5rem_1rem_rgba(0,0,0,.4)]">
      <p className="flex-1 bg-arishina px-3 py-1.5 text-theatre">
        <span lang="kn" className="block font-kn-display text-sm font-extrabold leading-tight">{label.kn}</span>
        <En className="block font-kn-body text-xs font-semibold leading-tight text-theatre/80">{label.en}</En>
      </p>
      <p className="bg-kumkuma px-3 py-1 font-poster text-3xl leading-none tracking-wide text-[#fff4dc]">{price}</p>
    </div>
  )
}

function Step({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-8 place-items-center rounded-[4px] bg-[#4a2a12] font-poster text-xl text-[#f3ead5] shadow-[0_2px_3px_rgba(0,0,0,.4)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
