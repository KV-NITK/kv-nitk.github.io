import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { load } from '@cashfreepayments/cashfree-js'
import { PageShell } from '@p26/chrome/page-shell'
import { En } from '@p26/lib/prefs'
import { useStoredState } from '@p26/lib/storage'
import { PERFORATED } from '@p26/ui/coupon'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { BhooriBhojanaSection } from '@p26/merch/BhooriBhojanaSection'
import API_URL from '../../../api/api'
import { CASHFREE_MODE, createPayment, getProducts, newIdempotencyKey, quoteOrder } from '../../../api/payments'

const FOOD_ID = 'bhoori-bhojana'
const PHONE = /^[6-9]\d{9}$/
const rupees = (n) => `₹${Number.isInteger(n) ? n : n.toFixed(2)}`

// Bhoori Bhojana food coupons (/parva-26/coupon), the only place they are
// sold. An order here is food coupons only: no merch, no coupon code, no
// goodie. Each coupon bought is its own QR code in My Orders, scanned once at
// the counter. Coming back from the IRIS login (?buy=1) goes on to payment.
export default function Coupon() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [user, setUser] = useState(undefined)
  const [product, setProduct] = useState(undefined) // null = not on sale
  const [loadError, setLoadError] = useState('')
  // Kept in this browser, so they are still there after the IRIS login
  const [quantity, setQuantity] = useStoredState('parva_food_qty', 1)
  const [phone, setPhone] = useStoredState('merch_phone', '')
  const [quote, setQuote] = useState(null)
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
      .then((products) => setProduct(products.find((p) => p.id === FOOD_ID) ?? null))
      .catch((e) => setLoadError(e.message))
  }, [])

  const qty = product ? Math.min(quantity, product.maxQuantity) : quantity

  // The price to pay comes from the server, never from the page
  useEffect(() => {
    setError('')
    if (!user || !product || qty < 1) {
      setQuote(null)
      return
    }
    let cancelled = false
    quoteOrder({ items: [{ productId: FOOD_ID, quantity: qty }] })
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => {
        if (cancelled) return
        setQuote(null)
        setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [user, product, qty])

  const total = quote ? quote.total : (product?.unitPrice ?? 0) * qty

  const buy = async () => {
    if (qty < 1) {
      setError('Add at least one food coupon')
      return
    }
    if (!PHONE.test(phone)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    if (user === null) {
      window.location.href = `${API_URL}/auth/iris?redirect=${encodeURIComponent('/parva-26/coupon?buy=1')}`
      return
    }

    setPaying(true)
    setError('')
    try {
      // One key per distinct checkout, kept only across network errors
      const sig = JSON.stringify([qty, phone])
      if (keyRef.current.signature !== sig) keyRef.current = { signature: sig, key: newIdempotencyKey() }

      const payment = await createPayment({
        items: [{ productId: FOOD_ID, quantity: qty }],
        couponCode: null,
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
    if (!resume.current || user === undefined || product === undefined) return
    resume.current = false
    if (user && product && qty > 0 && PHONE.test(phone)) buy()
  }, [user, product])

  return (
    <PageShell title="ಭೂರಿ ಭೋಜನ · Food Coupon" topBar={{ home: '/rcb#parva-sante', ticket: false }}>
      <main className="min-h-screen p-4 pb-20 pt-24" style={{ backgroundColor: '#3f2a18' }}>
        <div className="mx-auto w-full max-w-[80rem]">
          <div className="mb-6 flex justify-end">
            <Link to="/my-orders" className="rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5">
              My Orders
            </Link>
          </div>

          {product === undefined && (
            <p role="status" className="text-center font-poster text-xl text-[#f3ead5]">{loadError || 'Loading…'}</p>
          )}
          {product === null && <p className="text-center font-poster text-xl text-[#f3ead5]">Food coupons are not on sale right now.</p>}

          {product && (
            <>
              <BhooriBhojanaSection quantity={qty} onChange={setQuantity} unitPrice={product.unitPrice} maxQuantity={product.maxQuantity} />

              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="w-full max-w-md rounded-[8px] bg-[#f3ead5] p-5 font-kn-body text-[#4a2a12] shadow-2xl">
                  <h2 className="mb-3 font-poster text-2xl font-bold">
                    <En>Your order</En>
                    <span lang="kn" className="ml-2 font-kn-body text-sm font-bold">ನಿಮ್ಮ ಆರ್ಡರ್</span>
                  </h2>
                  <div className="flex items-baseline justify-between rounded bg-[#e5d4b5] px-3 py-2">
                    <span>
                      <span className="font-bold">{product.name}</span>
                      <span className="block text-sm opacity-80">{qty} × {rupees(product.unitPrice)}</span>
                    </span>
                    <span className="font-bold">{rupees(product.unitPrice * qty)}</span>
                  </div>
                  <p className="mt-2 text-sm">Each coupon gets its own QR code in My Orders, scanned once at the counter.</p>
                  <div className="mt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{rupees(total)}</span>
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

                <p role="alert" className={cn('text-center font-kn-display text-lg font-semibold text-arishina', !error && 'sr-only')}>
                  {error}
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </PageShell>
  )
}
