import { useLayoutEffect } from 'react'
import { PageShell } from '@p26/chrome/page-shell'
import { MerchShop } from '@p26/merch/merch-shop'

// Parva Angadi (/parva-26/merch): the merch shop, a page of its own. What is
// on sale, the sizes and the prices all come from the server, and Buy Now at
// the bottom takes the whole order to the payment page. You come in from the
// market in the landing page's interval, and the logo takes you back there.
export default function Merch() {
  // Coming from the market, the window is still scrolled down the landing page
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageShell title="ಪರ್ವ ಅಂಗಡಿ · Parva Angadi" topBar={{ home: '/rcb#parva-sante', ticket: false }}>
      <main>
        <MerchShop />
      </main>
    </PageShell>
  )
}
