import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Gift } from 'lucide-react'
import { load } from '@cashfreepayments/cashfree-js'
import { En } from '@p26/lib/prefs'
import { useStoredState } from '@p26/lib/storage'
import { PERFORATED } from '@p26/ui/coupon'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { CASHFREE_MODE, createPayment, newIdempotencyKey, quoteOrder } from '../../../api/payments'
import API_URL from '../../../api/api'

const PHONE = /^[6-9]\d{9}$/

// The end of the shop page: what is being bought, the mobile number, coupon code, and the
// one Buy Now for the whole order. Pressing it goes to IRIS first if there is
// no login, otherwise straight to the payment page. Coming back from that
// login (?buy=1) it carries on to the payment page by itself. What you pay is whatever
// the server quotes for these products; the prices shown before login are the
// shop's list prices.
//
// `lines` are the shirts with a size chosen, `shirts` all the shirts asked
// for (so a shirt still to size makes the order incomplete).
export function BuyNow({ lines, shirts, goodie, user, onRefused }) {
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  // Kept in this browser, so it is still there after the IRIS login
  const [phone, setPhone] = useStoredState('merch_phone', '')
  const [couponInput, setCouponInput] = useStoredState('merch_coupon_input', '')
  const [appliedCoupon, setAppliedCoupon] = useStoredState('merch_applied_coupon', '')

  const [formError, setFormError] = useState('') // '' | 'none' | 'sizes'
  const [payError, setPayError] = useState('')
  const [paying, setPaying] = useState(false)

  // Back from the IRIS login with ?buy=1: pay without another press. The flag
  // is read once and removed from the address at once, so a refresh or a
  // failed attempt never repeats it.
  const [params, setParams] = useSearchParams()
  const resume = useRef(params.get('buy') === '1')

  useEffect(() => {
    if (!params.has('buy')) return
    params.delete('buy')
    setParams(params, { replace: true })
  }, [params, setParams])

  // One key per distinct checkout: reused if Buy Now is pressed again after a
  // network error, replaced as soon as the order, coupon, or phone changes.
  const keyRef = useRef({ signature: '', key: '' })

  const items = useMemo(() => lines.map((l) => ({ productId: l.productId, quantity: l.quantity })), [lines])
  const signature = JSON.stringify([items, appliedCoupon])
  const complete = shirts > 0 && lines.reduce((n, l) => n + l.quantity, 0) === shirts

  // The order changing clears a refusal that no longer applies
  useEffect(() => {
    setFormError('')
    setPayError('')
  }, [signature, shirts])

  // The price to pay comes from the server, never from the page
  useEffect(() => {
    setQuoteError('')
    if (!user || !complete) {
      setQuote(null)
      return
    }
    let cancelled = false
    quoteOrder({ items, couponCode: appliedCoupon })
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => {
        if (cancelled) return
        setQuote(null)
        setQuoteError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [user, complete, signature, appliedCoupon])

  const unitPrice = (line) => quote?.items.find((l) => l.productId === line.productId)?.unitPrice ?? line.price

  // The server adds the goodie to any order with a shirt; this only shows it
  const goodiePrice = lines.length > 0 && goodie ? (quote?.items.find((l) => l.productId === goodie.id)?.unitPrice ?? goodie.unitPrice) : null

  const total = quote ? quote.total : lines.reduce((sum, l) => sum + l.price * l.quantity, 0) + (goodiePrice ?? 0)

  // What the coupon box says: only what the server's quote says
  const couponNote = !appliedCoupon || quoteError ? '' : quote ? (quote.discount > 0 ? `Coupon ${quote.couponCode} applied: ₹${quote.discount} off` : `Coupon ${appliedCoupon} gives no discount on this order`) : !user ? 'Log in to see your discount' : !complete ? 'Choose a size for every shirt to see your discount' : 'Checking the coupon…'

  const buy = async () => {
    if (shirts === 0 || !complete) {
      setFormError(shirts === 0 ? 'none' : 'sizes')
      onRefused()
      return
    }
    // The number is asked for before the login, so that coming back can pay
    if (!PHONE.test(phone)) {
      setPayError('Enter a valid 10-digit mobile number')
      return
    }
    if (user === null) {
      // The order and the number are remembered in this browser, so they are still here on return
      window.location.href = `${API_URL}/auth/iris?redirect=${encodeURIComponent('/parva-26/merch?buy=1')}`
      return
    }

    setPaying(true)
    setPayError('')
    try {
      const sig = JSON.stringify([items, appliedCoupon, phone])
      if (keyRef.current.signature !== sig) keyRef.current = { signature: sig, key: newIdempotencyKey() }

      const payment = await createPayment({
        items,
        couponCode: appliedCoupon,
        customerPhone: phone,
        idempotencyKey: keyRef.current.key,
      })

      // Same checkout key came back for an order that is already paid
      if (payment.status === 'SUCCESS') {
        window.location.href = `/payment/status?order_id=${encodeURIComponent(payment.orderId)}`
        return
      }

      const cashfree = await load({ mode: CASHFREE_MODE })
      // Goes to Cashfree, then back to /payment/status
      await cashfree.checkout({ paymentSessionId: payment.paymentSessionId, redirectTarget: '_self' })
    } catch (err) {
      // A server answer ends that attempt (the next needs a fresh key); a
      // network error has no status and keeps the key, so a retry cannot make
      // a second order.
      if (err.status) keyRef.current = { signature: '', key: '' }
      setPayError(err.message || 'Could not start payment')
      setPaying(false)
    }
  }

  useEffect(() => {
    if (!resume.current || user === undefined) return
    resume.current = false
    if (user && complete && PHONE.test(phone)) buy()
  }, [user])

  const error = quoteError || payError

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {lines.length > 0 && (
        <div className="w-full max-w-md rounded-[8px] bg-[#f3ead5] p-5 font-kn-body text-[#4a2a12] shadow-2xl">
          <h2 className="mb-3 font-poster text-2xl font-bold">
            <En>Your order</En>
            <span lang="kn" className="ml-2 font-kn-body text-sm font-bold">ನಿಮ್ಮ ಆರ್ಡರ್</span>
          </h2>
          <ul className="space-y-2 border-b border-[#c2aa84] pb-3">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-baseline justify-between gap-3 rounded bg-[#e5d4b5] px-3 py-2">
                <span>
                  <span className="font-bold">{line.name}</span>
                  <span className="block text-sm opacity-80">
                    {line.fit ? `${line.fit} · ` : ''}Size {line.size} · {line.quantity} × ₹{unitPrice(line)}
                  </span>
                </span>
                <span className="font-bold">₹{unitPrice(line) * line.quantity}</span>
              </li>
            ))}
            {goodiePrice !== null && (
              <li className="flex items-baseline justify-between gap-3 rounded border border-dashed border-[#8a5530] bg-[#f0e2c4] px-3 py-2">
                <span className="flex items-center gap-2">
                  <Gift aria-hidden className="size-5 shrink-0 text-kumkuma" />
                  <span>
                    <span className="font-bold">{goodie.name}</span>
                    <span className="block text-sm opacity-80">
                      <En>Comes with your order</En>
                      <span lang="kn" className="ml-1">· ನಿಮ್ಮ ಆರ್ಡರ್‌ನೊಂದಿಗೆ</span>
                    </span>
                  </span>
                </span>
                <span className="font-bold">₹{goodiePrice}</span>
              </li>
            )}
          </ul>

          {/* Coupon Input Field */}
          <div className="mt-4 border-b border-[#c2aa84] pb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b4020] mb-1">
              Early Bird Coupon Code / ಕೂಪನ್ ಕೋಡ್
            </label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code (e.g. POORVAPAKSHI)"
                maxLength={32}
                disabled={paying}
                className="flex-1 rounded border border-[#c2aa84] bg-white px-3 py-2 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-[#8a5530]"
              />
              <button
                type="button"
                onClick={() => setAppliedCoupon(couponInput.trim().toUpperCase())}
                className="rounded bg-[#8a5530] px-4 py-2 text-sm font-bold text-[#f3ead5] hover:bg-[#6b4020] transition-colors"
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
                  className="rounded border border-[#c2aa84] px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
            {couponNote && (
              <p role="status" className={cn('mt-2.5 rounded border p-2.5 text-xs font-bold', quote?.discount > 0 ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-amber-300 bg-amber-100 text-amber-800')}>
                {couponNote}
              </p>
            )}
          </div>

          <div className="space-y-1 pt-3 text-lg font-bold">
            {quote && quote.discount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{quote.subtotal}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>- ₹{quote.discount}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-xl">
              <span>Total</span>
              <span>₹{total}</span>
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
      )}

      <button
        type="button"
        onClick={buy}
        disabled={user === undefined || paying}
        data-en={user === null ? 'Login to Buy Now' : 'Buy Now'}
        className="group relative block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina disabled:opacity-70"
      >
        <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-6 pr-5 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
          <span className="flex flex-col">
            <span className="font-kn-display text-2xl font-extrabold leading-none">
              {paying ? 'Redirecting…' : user === null ? 'Login to Buy Now' : 'Buy Now'}
            </span>
            <span lang="kn" className="mt-1 font-kn-body text-sm font-bold leading-none">
              {user === null ? 'ಲಾಗಿನ್ ಮಾಡಿ ಖರೀದಿಸಿ' : 'ಈಗಲೇ ಖರೀದಿಸಿ'}
            </span>
          </span>
          <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
        </span>
      </button>

      <p role="alert" className={cn('text-center font-kn-display text-lg font-semibold text-arishina', !(formError || error) && 'sr-only')}>
        {formError === 'none' && (
          <>
            <En>Add at least one shirt · </En>
            <span lang="kn" className="font-kn-body text-sm">ಕನಿಷ್ಠ ಒಂದು ಶರ್ಟ್ ಆರಿಸಿ</span>
          </>
        )}
        {formError === 'sizes' && (
          <>
            <En>Pick a size for every shirt · </En>
            <span lang="kn" className="font-kn-body text-sm">ಪ್ರತಿ ಶರ್ಟ್‌ಗೂ ಅಳತೆ ಆರಿಸಿ</span>
          </>
        )}
        {!formError && error}
      </p>
    </div>
  )
}
