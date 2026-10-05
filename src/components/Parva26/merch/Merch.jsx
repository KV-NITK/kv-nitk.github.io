import { PageShell } from '@p26/chrome/page-shell'
import { MerchShop } from '@p26/merch/merch-shop'

// Parva Angadi (/parva-26/merch): the merch shop, a page of its own. What is
// on sale, the sizes and the prices all come from the server, and Buy Now at
// the bottom takes the whole order to the payment page.
export default function Merch() {
  return (
    <PageShell title="ಪರ್ವ ಅಂಗಡಿ · Parva Angadi" topBar={{ home: '/parva-26', ticket: false }}>
      <main>
        <MerchShop />
      </main>
    </PageShell>
  )
}
