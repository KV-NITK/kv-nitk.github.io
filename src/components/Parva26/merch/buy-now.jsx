import { useEffect, useMemo, useRef, useState } from 'react'
import { load } from '@cashfreepayments/cashfree-js'
import { En } from '@p26/lib/prefs'
import { PERFORATED } from '@p26/ui/coupon'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { CASHFREE_MODE, createPayment, newIdempotencyKey, quoteOrder } from '../../../api/payments'
import API_URL from '../../../api/api'

const PHONE = /^[6-9]\d{9}$/

// The end of the shop page: what is being bought, the mobile number, and the
// one Buy Now for the whole order. Pressing it goes to IRIS first if there is
// no login, otherwise straight to the payment page. What you pay is whatever
// the server quotes for these products; the prices shown before login are the
// shop's list prices.
//
// `lines` are the shirts with a size chosen, `shirts` all the shirts asked
// for (so a shirt still to size makes the order incomplete).
export function BuyNow({ lines, shirts, user, onRefused }) {
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  const [phone, setPhone] = useState(() => sessionStorage.getItem('merch_phone') || '')
  const [formError, setFormError] = useState('') // '' | 'none' | 'sizes'
  const [payError, setPayError] = useState('')
  const [paying, setPaying] = useState(false)
  // One key per distinct checkout: reused if Buy Now is pressed again after a
  // network error, replaced as soon as the order or the phone changes.
  const keyRef = useRef({ signature: '', key: '' })

  const items = useMemo(() => lines.map((l) => ({ productId: l.productId, quantity: l.quantity })), [lines])
  const signature = JSON.stringify(items)
  const complete = shirts > 0 && lines.reduce((n, l) => n + l.quantity, 0) === shirts

  useEffect(() => {
    sessionStorage.setItem('merch_phone', phone)
  }, [phone])

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
    quoteOrder({ items: JSON.parse(signature) })
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => {
        if (cancelled) return
        setQuote(null)
        setQuoteError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [user, complete, signature])

  const unitPrice = (line) => quote?.items.find((l) => l.productId === line.productId)?.unitPrice ?? line.price
  const total = quote ? quote.total : lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  const buy = async () => {
    if (shirts === 0 || !complete) {
      setFormError(shirts === 0 ? 'none' : 'sizes')
      onRefused()
      return
    }
    if (user === null) {
      // The order is already remembered in this browser, so it is still here on return
      window.location.href = `${API_URL}/auth/iris?redirect=/parva-26/merch`
      return
    }
    if (!PHONE.test(phone)) {
      setPayError('Enter a valid 10-digit mobile number')
      return
    }

    setPaying(true)
    setPayError('')
    try {
      const sig = JSON.stringify([items, phone])
      if (keyRef.current.signature !== sig) keyRef.current = { signature: sig, key: newIdempotencyKey() }

      const payment = await createPayment({ items, customerPhone: phone, idempotencyKey: keyRef.current.key })

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
          </ul>

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

          {user && (
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
          )}
          {user === null && <p className="mt-3 text-sm font-semibold">You will log in with IRIS first.</p>}
        </div>
      )}

      <button
        type="button"
        onClick={buy}
        disabled={user === undefined || paying}
        data-en="Buy Now"
        className="group relative block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina disabled:opacity-70"
      >
        <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-6 pr-5 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
          <span className="flex flex-col">
            <span className="font-kn-display text-2xl font-extrabold leading-none">{paying ? 'Redirecting…' : 'Buy Now'}</span>
            <span lang="kn" className="mt-1 font-kn-body text-sm font-bold leading-none">ಈಗಲೇ ಖರೀದಿಸಿ</span>
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
