# Payments: how to sell something new

Handoff for anyone adding a product (merch, food coupons, passes, fees, ...) to the
site's Cashfree payment integration. It says what exists, how to plug a new thing in,
and what is **not built yet** so you do not assume it is.

Branch `feat/payment-integration`. Cashfree sandbox works end to end (card payment →
status page → My orders). Production keys and the webhook are not set up yet.

**Food coupons (buy → get a QR code → scanned once) are designed here but not built.**
Section 4a is the spec for whoever builds them. The payment side is ready for it; the
pieces listed there are what is missing.

## 1. The idea in one paragraph

**Everything sold is a row in `payment_products`.** The browser only ever sends *what*
it wants (`productId` + `quantity`, plus an optional coupon code). The server looks up
prices in the database, applies the coupon, creates a Cashfree order for that total and
returns a payment session the browser opens. Prices, discounts and the amount charged
never come from the client. A new product is usually a database row and a frontend
page, not new payment code.

```
Browser                       Node server (server/)                 Cashfree
  │  GET  /api/payments/products ───────►│ list active rows
  │  POST /api/payments/quote ──────────►│ price + coupon (no side effects)
  │  POST /api/payments ────────────────►│ price again, save order (CREATED)
  │                                      │── create order ───────────────►│
  │◄── paymentSessionId ─────────────────│◄── payment_session_id ──────────│  order = PENDING
  │  cashfree.checkout(session) ─────────────────────────────────────────►│  user pays
  │◄──────────── redirect to /payment/status?order_id=pay_<uuid> ───────────│
  │  GET /api/payments/:id (poll) ──────►│ asks Cashfree, saves SUCCESS/FAILED
  │                                      │◄── webhook (when public) ───────│  same result, whichever is first
```

Statuses: `CREATED` (row saved, no Cashfree session yet) → `PENDING` (waiting for the
user) → `SUCCESS` | `FAILED` | `CANCELLED`. `SUCCESS` is final and is never downgraded.

## 2. Server API

All paths are under `/api/payments`. Everything except `GET /products` needs the IRIS
login (session cookie). Errors are `{ success: false, message }`; 4xx messages are safe
to show to users, 5xx are always a generic "try again".

| Call | Body / params | Returns |
|---|---|---|
| `GET /products` | none (public) | `products: [{ id, name, category, groupKey, variant, unitPrice, maxQuantity }]` |
| `POST /quote` | `{ items: [{ productId, quantity }], couponCode? }` | `quote: { items[{ productId, name, category, variant, quantity, unitPrice, lineTotal }], subtotal, discount, total, couponCode, currency }` |
| `POST /` | `{ items, couponCode?, customerPhone, idempotencyKey }` | `201 payment: { paymentId, orderId, paymentSessionId, status, amount, currency }` |
| `GET /:id` | order id | `payment: { paymentId, orderId, status, amount, items, subtotal, discount, couponCode, paidAt, failureReason, createdAt }` (owner only; refreshes from Cashfree if not final) |
| `GET /` | none | `payments: [...]` the user's own orders, newest first (stored status only) |
| `POST /webhook/cashfree` | Cashfree → server | Signature-checked; updates the same rows |

Rules the API enforces: at most 20 lines per cart, quantity a whole number ≥ 1 and ≤ the
product's `max_quantity`, total at least ₹1.00, `customerPhone` is a 10-digit Indian
mobile, `idempotencyKey` is required (≤128 chars).

**Idempotency key**: generate one per checkout attempt (`MerchTest.jsx` does it) and
reuse it only when retrying *after a network error*. After any server error, use a new
key. The server answers a reused key with the same order, a `409` if the cart changed or
the order is dead, or the receipt if it is already paid.

### Tables (Supabase)

- `payment_products` (id, name, category, group_key, variant, unit_price, max_quantity, active)
- `payment_coupons` (code, discount_type PERCENT/FLAT, discount_value, max_discount, min_order_amount, max_uses, per_user_limit, valid_from/until, active)
- `payments` (one row per order; stores the **price snapshot**: `items`, `subtotal_amount`, `discount_amount`, `coupon_code`, plus `purpose`, `reference_id`, provider ids, `status`)
- `payment_events` (one row per webhook; the unique `provider_event_key` makes replays harmless)
- `sessions.user_data` (login profile; run `server/sql/add_session_user_data.sql`)

SQL to create all of it: `server/sql/create_payment_catalog.sql`. Test merch rows:
`server/sql/seed_test_merch.sql` (placeholder prices).

## 3. Adding a product (the usual case: no code)

### 3a. A plain product (a sticker, a pass, a food coupon's catalog entry)

```sql
INSERT INTO payment_products (id, name, category, unit_price, max_quantity)
VALUES ('food-lunch', 'Lunch coupon', 'FOOD', 80.00, 10);
```

It shows up in `GET /products` and can be bought through `/quote` and `POST /`. For a
food coupon this row is only the *purchase*; the QR code comes from section 4a.
`id` is permanent (old orders reference it); use `active = false` to retire a product.

### 3b. A product with variants (sizes, flavours)

One row **per variant**, sharing a `group_key`, with the choice in `variant`. The price
is per row, so different sizes can cost different amounts.

```sql
INSERT INTO payment_products (id, name, category, group_key, variant, unit_price, max_quantity) VALUES
  ('hoodie-m', 'Hoodie', 'MERCH', 'hoodie', 'M', 799.00, 3),
  ('hoodie-l', 'Hoodie', 'MERCH', 'hoodie', 'L', 799.00, 3);
```

The cart line is the variant row (`productId: 'hoodie-m'`); the frontend groups rows by
`groupKey` to show one card. `max_quantity` is per variant row.

### 3c. A coupon

```sql
INSERT INTO payment_coupons (code, discount_type, discount_value, max_discount, max_uses, per_user_limit)
VALUES ('WELCOME10', 'PERCENT', 10, 50.00, 200, 1);
```

Codes are upper-case. A use is held by a paid order or an unpaid one younger than 30
minutes. A coupon that would take the total below ₹1 is rejected (Cashfree minimum).
**Coupons apply to the whole cart, not to one category** (see gaps).

## 4. When a database row is not enough

Decide with this table before writing code.

| You need | Today | What to do |
|---|---|---|
| Just sell it, show an order with items | works | Section 3. The order in **My orders** (item list, total, status, order id) is the proof of purchase. |
| Different price per variant, quantity limit per order | works | `unit_price`, `max_quantity` |
| **Something to happen after payment** (food coupon QR codes, mark a team registered, send an email) | **not built** | Post-payment step, section 4a |
| **Rules before payment** (only team members, one per person, stock, sale window) | **not built** | Product rules, section 4b |
| A price decided by a record (team fee depends on team size) | not built | Model the fee as a product and let a product rule check the record, 4b. Do **not** add an `amount` field to the request. |
| User picks the amount (donation) | not built | Needs a `pricing: variable` product with server-side min/max. Ask before building. |
| Refunds | not built | Cashfree supports it; `refundPaymentSchema` exists but there is no endpoint |

### 4a. Food coupons: buy, get a QR code, scan once (spec, not built)

**What the user experiences:** buys N food coupons through the normal checkout; once the
payment succeeds they have N QR codes (one per coupon, so they can share or use them
separately). A staff member scans a code at the stall; it works exactly once.

**What the payment module already gives you**

- The product row (`category = 'FOOD'`) and the checkout, quote, coupons and status
  page (sections 2 and 3).
- The order stores a price snapshot in `payments.items`
  (`[{ productId, name, category, variant, quantity, unitPrice, lineTotal }]`), so after
  payment you know exactly what was bought and how many, **by category**, even if prices
  or products change later.
- Exactly **two code paths** turn an order into `SUCCESS`, and `SUCCESS` is final and
  never downgraded:
  1. the Cashfree webhook, `controllers/payment.webhook.controller.js`
  2. the status check, `getPaymentStatus` in `services/payment.service.js`
  Whichever runs first wins; the other later sees an already `SUCCESS` order.
- The buyer's identity (`payments.user_iris_id`, the IRIS reg number) and a logged-in
  session (`requireAuth`, `req.user.irisId`).

**What is missing and has to be built** (nothing below exists in the code):

1. **A `vouchers` table**, one row **per unit** bought:
   `id`, `payment_id` → payments, `user_iris_id`, `product_id`, `product_name`,
   `unit_index` (1..quantity), `token`, `status` (`ISSUED` / `REDEEMED` / `VOID`),
   `redeemed_at`, `redeemed_by`, `created_at`, with **`UNIQUE (token)`** and
   **`UNIQUE (payment_id, product_id, unit_index)`**.
2. **A post-payment step** that creates the vouchers when the order is `SUCCESS`. Call
   it from **both** success paths above. Rules for it:
   - **Idempotent.** It will run more than once (webhook retries, the status page
     polling, a user reopening the page). Skip units that already have a voucher and
     treat a duplicate-key error (`23505`) as "already done". The composite unique
     constraint above is what guarantees no unit ever gets two vouchers.
   - **Never throws into the payment.** The money is taken, so a failure here must not
     turn the order into an error or `FAILED`. Log it and make it retryable: re-run the
     step whenever the user's vouchers are listed or the paid order is looked at.
   - Read what to issue from the stored `payments.items` (`category === 'FOOD'`,
     `quantity` units each), never from the current `payment_products`.
   - Only for `SUCCESS`. Never issue for `PENDING`, `FAILED` or `CANCELLED`.
3. **The token.** `crypto.randomBytes(24).toString('base64url')` (192 bits). The QR code
   encodes **only the token**: not the payment id, user id or any guessable number.
   Treat it like a password: return it only to the owner, never in logs, and never in
   the public `/products` or the order list.
4. **Redeem = one conditional UPDATE**, not read-then-write:
   ```sql
   UPDATE vouchers SET status = 'REDEEMED', redeemed_at = now(), redeemed_by = $staff
   WHERE token = $token AND status = 'ISSUED' RETURNING *;
   ```
   One row back means this scan won. Zero rows means look the token up to say why: not
   found (404 "invalid"), `REDEEMED` (409 "already used", show when), or `VOID` (409).
   Two staff scanning the same QR at the same moment must result in exactly one success;
   write a test that fires two redeems in parallel.
5. **Endpoints** (to add to `routes/payment.routes.js` or a new `voucher.routes.js`):
   - `GET /api/payments/vouchers`: the logged-in user's vouchers with their tokens, so
     the frontend can draw the QR codes. **Register it above `GET /:id`**, otherwise
     `vouchers` is read as an order id.
   - `POST` redeem (name it as you like): takes `{ token }`, **staff only**. The repo
     already has coordinator auth (`middleware/coordinatorAuth.middleware.js`); check
     whether it fits or whether the stall volunteers need a separate role. Record who
     scanned in `redeemed_by`. Do not let normal users call it.
6. **Refunds and cancellations.** There are no refunds yet. When they exist, set the
   order's unused vouchers to `VOID` in the same step. Redeem must refuse `VOID`.
7. **Frontend.** A "My vouchers" page (or a section in My orders) listing vouchers with
   status and a QR code made from the token (add a QR library, e.g. `qrcode.react`), a
   used state once `REDEEMED`, and a staff scanner page (camera QR reader) that calls the
   redeem endpoint and shows a clear green "valid, now used" or red "already used" result.
   The status page (`/payment/status`) should link to the vouchers once the order is paid.

**Edge cases to decide or test**

- A cart mixing food coupons and merch: only the `FOOD` lines produce vouchers; merch
  needs nothing. Group by `category` when walking `payment.items`.
- A `SUCCESS` order whose voucher step failed: the user sees no QR codes. Re-run the step
  when they open their vouchers, otherwise the order is stuck paid-but-empty.
- Coupon codes (discounts) and voucher codes are different things: `payment_coupons`
  discounts a checkout; `vouchers` are bought items. Do not reuse the word "coupon" in
  the new endpoints and tables for the QR items, to avoid mixing them up.
- Offline scanning, expiry dates and transferring a voucher are not covered. If a
  voucher must expire after the event, add `valid_until` and check it in the redeem
  `WHERE`.
- Screenshots are copyable: the one-time rule is what protects the stall, not secrecy
  of the image. First scan wins.

**Tests to write** (follow `server/test/payment.webhook.test.js` and
`server/test/helpers/fakeSupabase.js`, which will need the composite unique constraint
for `vouchers`): issues `quantity` vouchers per FOOD line and none for merch; running
the step twice (and concurrently) creates no duplicates; the webhook and the status check
both issue; nothing is issued before `SUCCESS`; tokens are unique and long; only the
owner sees tokens; redeem succeeds once, then 409; parallel redeems give one winner;
unknown token is 404; `VOID` is refused.

### 4b. Rules before payment (proposal, not built)

Add an optional per-category check that runs **inside `quoteOrder`, before pricing**, so
`/quote` (what the user sees) and `POST /` (what is charged) can never disagree:

```js
// services/pricing.service.js (proposal)
const rules = {
  EVENT_PASS: async ({ lines, user }) => {
    // throw new PaymentError("You already have a pass", 400) if user already bought one
  },
};
```

Typical rules and where the data lives: *one per person* → count the user's `SUCCESS`
orders containing that product; *stock* → add a `stock` column and reserve it when the
order row is created, release when it ends `FAILED`/`CANCELLED` (use the same
"insert first, then check the ordered list" pattern as `claimCouponSlot` in
`pricing.service.js`, otherwise two simultaneous buyers can oversell); *sale window* →
`available_from/until` columns; *who may buy* → check the IRIS profile or team tables.

### 4c. Coupons per product (proposal, not built)

To make a coupon valid only for some category, add `applies_to_category` to
`payment_coupons` and compute the discount on the matching lines only inside
`applyCoupon`. Today a food coupon code would also discount merch.

## 5. Frontend

Everything you need is in `src/api/payments.js`:
`getProducts`, `quoteOrder`, `createPayment`, `getPayment`, `getMyPayments`
(they throw an `Error` whose message is the server's; `error.status` is the HTTP status).

Shared pages already work for any product:

- `/payment/status` — where Cashfree returns the user; polls until the order is final.
  The return URL is **global** (`$FRONTEND_URL/payment/status?order_id={order_id}`), so a
  new product does not need its own return page.
- `/my-orders` — all orders of the user with status badges.
- `src/components/merch-test/orderFormat.js` — `rupees`, `itemLabel`, `STATUS_STYLES`.

**To add a product page**, copy the flow in `src/components/merch-test/MerchTest.jsx`:

1. `getProducts()` then keep `category === 'FOOD'` (or your category). The endpoint
   returns every active product, so filter on the client.
2. Build the cart as `[{ productId, quantity }]`. Never put a price in it.
3. On every cart or coupon change call `quoteOrder` and show **the server's** numbers.
4. Pay: `createPayment({ items, couponCode, customerPhone, idempotencyKey })`, then
   `load({ mode })` from `@cashfreepayments/cashfree-js` and
   `checkout({ paymentSessionId, redirectTarget: '_self' })`. If the returned status is
   `SUCCESS`, go to `/payment/status?order_id=...` instead.
5. Handle login: if `/api/auth/me` fails, send the user to
   `${API_URL}/auth/iris?redirect=<your page>` (see the logged-out branch in `MerchTest`).
   A failed login comes back with `?login_error=...`.

How each product type maps to UI:

| Product | UI | Cart line |
|---|---|---|
| Merch with sizes | quantity stepper, size per unit (`MerchTest`) | the variant row id, quantity = units of that size |
| Food coupon | quantity stepper only; QR codes appear after payment (4a) | `{ productId: 'food-lunch', quantity }` |
| Pass / fee (one per user) | a single "Buy" button, no stepper | `{ productId, quantity: 1 }`; enforce "one" with a rule (4b), not just by hiding the stepper |

**Recommended refactor (not done):** `MerchTest.jsx` holds the whole checkout (quote,
coupon, phone, idempotency key, Cashfree, error handling) next to merch-specific UI.
Before building a second product page, extract it into `useCheckout(items)` and a
`<CheckoutSummary />`, so each product page is only its picker. Otherwise the checkout
logic gets copied and drifts. `MerchTest` is a test page; the real merch page and design
are still to do, and the old `/Merch` page still links to a Google Form.

## 6. Rules that must not be broken

1. **Never accept an amount, price or discount from the client.** Validators strip
   unknown fields on purpose; keep it that way.
2. **Every order goes through `createPayment`.** It does the pricing, saves the snapshot,
   and handles replays. Do not call Cashfree directly from a new controller.
3. **Use the stored `items` snapshot** for receipts and fulfilment, not today's
   `payment_products` prices (prices change).
4. **Identity comes from the session** (`req.user.irisId`), never from the body.
   `user_meta` cookies are not trusted.
5. **Fulfil only on `SUCCESS`, and idempotently** (4a).
6. **Throw `PaymentError`** for anything the user can fix; anything else becomes a
   generic 500 and is logged.
7. Keep the Supabase **secret** key (`sb_secret_…`) server-side only. A publishable key
   fails with "violates row-level security".

## 7. Setup and testing

Local (details in `server/.env.example`):

1. `/etc/hosts`: `127.0.0.1 kannadavedike.dev.local`. IRIS only allows
   `https://kannadavedike.dev.local:5000/api/auth/iris/callback` locally.
2. `server/.env`: Supabase URL + secret key, `CASHFREE_CLIENT_ID/SECRET` (sandbox),
   `IRIS_CLIENT_ID/SECRET/REDIRECT_URI`, and `FRONTEND_URL`. **`FRONTEND_URL` is the one
   place the frontend port is set**; Vite, CORS, the login redirect and the Cashfree
   return URL all follow it.
3. Run the SQL files in Supabase, then `cd server && npm run dev`, and `npm run dev` in
   the project root. Open the site on `http://kannadavedike.dev.local:<port>`, **not**
   `localhost` (cookies are per host name).

Sandbox payments: card `4111 1111 1111 1111`, any future expiry, CVV `123`, OTP `111000`;
UPI `success@upi` / `failure@upi` (check Cashfree's "test data" docs if they change).
Locally the webhook cannot arrive; the status page asks Cashfree directly, so you do not
need it to test. To test the webhook, tunnel (ngrok/cloudflared) and set
`CASHFREE_WEBHOOK_URL=https://<tunnel>/api/payments/webhook/cashfree`.

Automated tests: `cd server && npm test` (184 tests, no network, under a second; they
also run in CI before deploy). They use an in-memory stand-in for Supabase
(`server/test/helpers/fakeSupabase.js`). For a new rule or handler, add tests next to
`pricing.service.test.js` / `payment.service.test.js`; copy how they `seed` rows and call
the service. The frontend has no automated tests yet.

## 8. Known gaps and open decisions

- Food coupon QR codes (vouchers table, post-payment issuing, scan-once redeem, staff
  scanner, "My vouchers" page): **designed in 4a, not built**, to be done separately.
- Product rules, stock, category-scoped coupons, variable amounts, refunds:
  **not built** (sections 4b, 4c and the table in section 4).
- Production: real Cashfree keys with `CASHFREE_ENV=PRODUCTION`, the production
  `FRONTEND_URL`/`IRIS_REDIRECT_URI`, the webhook URL registered in the Cashfree
  dashboard and reachable from the internet, SQL run on the production Supabase, and the
  new `IRIS_*`/`CASHFREE_*` variables passed through the deploy.
- `GET /products` returns every active product; there is no per-page catalog filter on
  the server.
- CORS currently allows every origin (existing behaviour, left unchanged).
- `teamAuth.middleware.js` still reads the editable `user_meta` cookie (team features).
- The IRIS client secret was pasted into a chat; rotate it.
- Table `payment_attempts` exists in Supabase but nothing uses it.

## 9. Where things are

```
server/src/routes/payment.routes.js          route table
server/src/controllers/payment.controller.js request validation, error mapping
server/src/controllers/payment.webhook.controller.js   webhook
server/src/services/pricing.service.js       quote, coupons, catalog   ← rules go here
server/src/services/payment.service.js       create order, replays, status, list
server/src/services/cashfree.service.js      the only code that talks to Cashfree
server/src/config/urls.js                    FRONTEND_URL → return URL, CORS origins
server/src/validators/payment.validator.js   request shapes and limits
server/sql/*.sql                             schema + test data
server/test/                                 unit tests
src/api/payments.js                          frontend client
src/components/merch-test/                   test checkout, status page, My orders
```
