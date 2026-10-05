import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStoredState } from '@p26/lib/storage'
import { PageShell } from '@p26/chrome/page-shell'
import { MerchShop } from '@p26/merch/merch-shop'
import { CartOverlay } from '@p26/merch/cart-overlay'

// Parva Angadi (/parva-26/merch): the merch shop and its cart, a page of its
// own. What is on sale, the sizes and the prices all come from the server.
export default function Merch() {
  return (
    <PageShell title="ಪರ್ವ ಅಂಗಡಿ · Parva Angadi" topBar={{ home: '/parva-26', ticket: false }}>
      <MerchPage />
    </PageShell>
  )
}

function MerchPage() {
  // The cart is kept in this browser (the payment status page empties it once paid)
  const [cart, setCart] = useStoredState('merch_cart', [])
  // Coming back from the IRIS login with ?checkout=1 opens the cart for payment
  const [params, setParams] = useSearchParams()
  const [cartOpen, setCartOpen] = useState(params.get('checkout') === '1' && cart.length > 0)

  useEffect(() => {
    if (params.has('checkout')) {
      params.delete('checkout')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  return (
    <main>
      <MerchShop cart={cart} setCart={setCart} onOpenCart={() => setCartOpen(true)} />
      {cartOpen && <CartOverlay cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} />}
    </main>
  )
}
