import { useEffect, useMemo, useRef, useState } from 'react'
import { load } from '@cashfreepayments/cashfree-js'
import { CASHFREE_MODE, createPayment, newIdempotencyKey, quoteOrder } from '../../../api/payments'
import API_URL from '../../../api/api'

const PHONE = /^[6-9]\d{9}$/

// The cart and its checkout. What you pay is whatever the server quotes for
// these products; the prices shown before login are the shop's list prices.
export function CartOverlay({ cart, setCart, onClose }) {
  const [user, setUser] = useState(undefined) // undefined = checking, null = logged out
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  const [phone, setPhone] = useState(() => sessionStorage.getItem('cart_phone') || '')
  const [payError, setPayError] = useState('')
  const [paying, setPaying] = useState(false)
  // One key per distinct checkout: reused if Pay is pressed again after a
  // network error, replaced as soon as the cart or the phone changes.
  const keyRef = useRef({ signature: '', key: '' })

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null))
  }, [])

  // Carts saved before the catalog came from the server have no limit stored
  useEffect(() => {
    if (cart.some((c) => !c.maxQuantity)) setCart((prev) => prev.filter((c) => c.maxQuantity))
  }, [cart, setCart])

  useEffect(() => {
    sessionStorage.setItem('cart_phone', phone)
  }, [phone])

  const items = useMemo(
    () => cart.filter((c) => c.productId).map((c) => ({ productId: c.productId, quantity: c.quantity })),
    [cart]
  )

  // The price to pay comes from the server, never from the page
  useEffect(() => {
    setQuoteError('')
    if (!user || items.length === 0) {
      setQuote(null)
      return
    }
    let cancelled = false
    quoteOrder({ items })
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => {
        if (cancelled) return
        setQuote(null)
        setQuoteError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [user, items])

  const setQuantity = (productId, quantity) =>
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.productId !== productId) return [item]
        return quantity <= 0 ? [] : [{ ...item, quantity: Math.min(item.maxQuantity, quantity) }]
      })
    )

  const unitPrice = (item) => quote?.items.find((l) => l.productId === item.productId)?.unitPrice ?? item.price
  const total = quote ? quote.total : cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const canPay = Boolean(quote) && PHONE.test(phone) && !paying && !quoteError

  const buy = async () => {
    if (user === null) {
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
      const signature = JSON.stringify([items, phone])
      if (keyRef.current.signature !== signature) keyRef.current = { signature, key: newIdempotencyKey() }

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
      if (err.status === 401) setUser(null) // session gone: offer the IRIS login instead
      setPayError(err.message || 'Could not start payment')
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative max-h-full w-full max-w-md overflow-y-auto rounded-[8px] bg-[#f3ead5] p-6 font-kn-body text-[#4a2a12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label="Close the cart" onClick={onClose} className="absolute right-4 top-4 text-2xl font-bold opacity-70 hover:opacity-100">
          &times;
        </button>

        <h2 className="mb-4 font-poster text-2xl font-bold">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-lg opacity-80">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            <ul className="max-h-[40vh] space-y-3 overflow-y-auto border-b border-[#c2aa84] pb-4 pr-2">
              {cart.map((item) => (
                <li key={item.productId} className="flex items-center justify-between rounded bg-[#e5d4b5] p-3 shadow-sm">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm opacity-80">
                      {item.fit ? `${item.fit} · ` : ''}{item.fit ? `${item.fit} · ` : ''}Size: {item.size} | ₹{unitPrice(item)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="One fewer" onClick={() => setQuantity(item.productId, item.quantity - 1)} className="size-8 rounded bg-[#d1bfa3] text-lg font-bold leading-none shadow">
                      -
                    </button>
                    <span className="w-4 text-center font-bold">{item.quantity}</span>
                    <button type="button" aria-label="One more" disabled={item.quantity >= item.maxQuantity} onClick={() => setQuantity(item.productId, item.quantity + 1)} className="size-8 rounded bg-[#d1bfa3] text-lg font-bold leading-none shadow disabled:opacity-50">
                      +
                    </button>
                    <button type="button" aria-label="Remove" onClick={() => setQuantity(item.productId, 0)} className="ml-2 font-bold text-red-700 opacity-70 hover:opacity-100">
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-1 text-lg font-bold">
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
              <div className="flex justify-between border-t border-[#c2aa84] pt-2 text-xl">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {user && (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Mobile number (10 digits)"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  disabled={paying}
                  className="w-full rounded border border-[#c2aa84] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#8a5530]"
                />
              )}
              {(quoteError || payError) && <p role="alert" className="text-sm font-bold text-red-600">{quoteError || payError}</p>}

              <button
                type="button"
                onClick={buy}
                disabled={user === undefined || (user !== null && !canPay)}
                className="mt-2 w-full rounded bg-[#8a5530] py-3 text-xl font-bold text-white shadow-md transition-colors hover:bg-[#6b4020] disabled:opacity-60"
              >
                {user === null ? 'Login with IRIS to continue' : paying ? 'Redirecting…' : `Checkout · ₹${total}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
