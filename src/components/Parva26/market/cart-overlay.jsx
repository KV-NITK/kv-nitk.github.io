import React, { useState } from 'react'
import { TEE } from '@p26/content'
import { createPayment } from '../../../api/payments'
import { load } from '@cashfreepayments/cashfree-js'
import API_URL from '../../../api/api'

export function CartOverlay({ cart, setCart, onClose }) {
  const [user, setUser] = useState(undefined)
  
  React.useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null))
  }, [])

  const [phone, setPhone] = useState(() => sessionStorage.getItem('cart_phone') || '')
  const [hostel, setHostel] = useState(() => sessionStorage.getItem('cart_hostel') || '')
  const [payError, setPayError] = useState('')
  const [paying, setPaying] = useState(false)
  const keyRef = React.useRef({ key: "" })

  React.useEffect(() => {
    sessionStorage.setItem('cart_phone', phone)
  }, [phone])

  React.useEffect(() => {
    sessionStorage.setItem('cart_hostel', hostel)
  }, [hostel])

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  }

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  }

  // Grouping similar logic to the original checkout
  const buy = async (e) => {
    e.preventDefault()

    if (user === null) {
      window.location.href = `${API_URL}/auth/iris?redirect=/parva-26/market`
      return
    }

    if (cart.length === 0) return;

    if (!phone || phone.length !== 10) {
      setPayError("Enter a valid 10-digit mobile number")
      return
    }

    setPaying(true)
    setPayError("")

    try {
      if (!keyRef.current.key) {
        keyRef.current.key = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
      }

      // Convert cart array into items array expected by createPayment
      // Also auto-repair items that might be missing productId from old cart versions
      const items = cart.map(c => {
        let productId = c.productId;
        if (!productId) {
          const groupKey = c.name && c.name.includes('Black') ? 'tshirt-a' : 'tshirt-b';
          productId = `${groupKey}-${(c.size || 'M').toLowerCase()}`;
        }
        return { productId, quantity: c.quantity };
      });

      const payment = await createPayment({
        items,
        customerPhone: phone,
        hostel,
        idempotencyKey: keyRef.current.key,
      })

      if (payment.status === "SUCCESS") {
        window.location.href = `/payment/status?order_id=${encodeURIComponent(payment.orderId)}`
        return
      }

      const cashfree = await load({ mode: "production" })

      await cashfree.checkout({
        paymentSessionId: payment.paymentSessionId,
        redirectTarget: "_self",
      })
    } catch (err) {
      if (err.status) {
        keyRef.current.key = ""
      }
      setPayError(err.message || "Could not start payment")
      setPaying(false)
    }
  }

  const total = cart.reduce((acc, item) => acc + (TEE.price || 319) * item.quantity, 0)
  const discount = 0; // Discount option requested by user

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div 
        className="relative w-full max-w-md bg-[#f3ead5] rounded-[8px] shadow-2xl p-6 text-[#4a2a12] font-kn-body" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold opacity-70 hover:opacity-100">&times;</button>
        
        <h2 className="text-2xl font-poster font-bold mb-4">Your Cart</h2>
        
        {cart.length === 0 ? (
          <p className="text-lg opacity-80">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-3 border-b border-[#c2aa84] pb-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-[#e5d4b5] p-3 rounded shadow-sm">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm opacity-80">Size: {item.size} | ₹{TEE.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(i, -1)} className="w-6 h-6 bg-[#d1bfa3] rounded shadow font-bold text-lg leading-none">-</button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(i, 1)} className="w-6 h-6 bg-[#d1bfa3] rounded shadow font-bold text-lg leading-none">+</button>
                    <button onClick={() => removeItem(i)} className="ml-2 text-red-700 opacity-70 hover:opacity-100 font-bold">&times;</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 font-bold text-lg">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>- ₹{discount}</span>
              </div>
              <div className="flex justify-between text-xl pt-2 border-t border-[#c2aa84]">
                <span>Total</span>
                <span>₹{total - discount}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile number (10 digits)"
                inputMode="numeric"
                disabled={paying}
                className="w-full rounded bg-white px-3 py-2 border border-[#c2aa84] focus:ring-2 focus:ring-[#8a5530] outline-none"
              />
              <input
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                placeholder="Hostel Block"
                disabled={paying}
                className="w-full rounded bg-white px-3 py-2 border border-[#c2aa84] focus:ring-2 focus:ring-[#8a5530] outline-none"
              />
              {payError && <p className="text-sm text-red-600 font-bold">{payError}</p>}
              
              <button
                type="button"
                onClick={paying ? (e) => e.preventDefault() : buy}
                style={{ opacity: paying ? 0.7 : 1 }}
                className="w-full bg-[#8a5530] text-white py-3 rounded text-xl font-bold shadow-md hover:bg-[#6b4020] transition-colors mt-2"
              >
                {user === null ? "Login with IRIS" : (paying ? "Redirecting..." : `Checkout · ₹${total - discount}`)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
