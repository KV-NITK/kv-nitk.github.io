import { PageShell } from '@p26/chrome/page-shell'
import { MerchShop } from '@p26/merch/merch-shop'

// Parva Angadi (/parva-26/merch): the merch shop, a page of its own. Two
// catalog sections live here: the Parva tee (Parva Angadi) and the Bhoori
// Bhojana food coupon (ಭೂರಿ ಭೋಜನ). A tab switcher at the top switches
// between them; the rest of the layout — brick background, red tablet banners,
// brass/gold buttons — is shared.
export default function Merch() {
  return (
    <PageShell title="ಪರ್ವ ಅಂಗಡಿ · ಭೂರಿ ಭೋಜನ · Parva Angadi" topBar={{ home: '/parva-26', ticket: false }}>
      <main>
        <MerchShop />
      </main>
    </PageShell>
  )
}
