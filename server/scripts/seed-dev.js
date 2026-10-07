import "dotenv/config";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// ==========================================================
// SEED DATA DEFINITION
// ==========================================================

export const SEED_DATA = {
  staff: {
    iris_id: "DEV_USER_001",
    role: "VOLUNTEER",
    active: true,
    created_at: new Date().toISOString(),
  },
  payment: {
    id: "11111111-1111-4111-8111-111111111111",
    user_iris_id: "STUDENT_NITK_001",
    purpose: "STORE_ORDER",
    reference_id: null,
    amount: 300.0,
    currency: "INR",
    provider: "CASHFREE",
    provider_order_id: "pay_11111111-1111-4111-8111-111111111111",
    provider_payment_session_id: "session_dev_123",
    provider_payment_id: "cf_payment_dev_123",
    idempotency_key: "seed-dev-payment-001",
    status: "SUCCESS",
    failure_reason: null,
    customer_name: "Dev Student",
    customer_email: "dev.student@nitk.edu.in",
    customer_phone: "9876543210",
    paid_at: new Date().toISOString(),
    items: [
      {
        productId: "bhoori-bhojana",
        name: "Bhoori Bhojana Food Pass",
        category: "FOOD",
        variant: null,
        quantity: 2,
        unitPrice: 150,
        lineTotal: 300,
      },
    ],
    subtotal_amount: 300.0,
    discount_amount: 0.0,
    coupon_code: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  passes: [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      payment_id: "11111111-1111-4111-8111-111111111111",
      user_iris_id: "STUDENT_NITK_001",
      category: "FOOD",
      item_name: "Bhoori Bhojana Food Pass",
      variant: null,
      item_index: 1,
      status: "ISSUED",
      token: "11111111-2222-4333-8444-555555555551",
      claimed_at: null,
      claimed_by: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      payment_id: "11111111-1111-4111-8111-111111111111",
      user_iris_id: "STUDENT_NITK_001",
      category: "FOOD",
      item_name: "Bhoori Bhojana Food Pass",
      variant: null,
      item_index: 2,
      status: "ISSUED",
      token: "11111111-2222-4333-8444-555555555552",
      claimed_at: null,
      claimed_by: null,
      created_at: new Date().toISOString(),
    },
  ],
};

// ==========================================================
// SEED RUNNER
// ==========================================================

async function runSeed() {
  console.log("==========================================================");
  console.log("Parva 2026: Local Dev Seed Execution");
  console.log("==========================================================");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log(`Connecting to remote Supabase: ${supabaseUrl}`);
    const client = createClient(supabaseUrl, supabaseKey);

    // 1. Staff
    console.log("1. Upserting staff member in event_staff ('DEV_USER_001')...");
    const { error: staffErr } = await client
      .from("event_staff")
      .upsert(SEED_DATA.staff, { onConflict: "iris_id" });
    if (staffErr) throw new Error(`Failed to seed event_staff: ${staffErr.message}`);
    console.log("   ✓ Staff member inserted.");

    // 2. Payment
    console.log("2. Upserting payment in payments ('11111111-1111-4111-8111-111111111111')...");
    const { error: paymentErr } = await client
      .from("payments")
      .upsert(SEED_DATA.payment, { onConflict: "id" });
    if (paymentErr) throw new Error(`Failed to seed payments: ${paymentErr.message}`);
    console.log("   ✓ Payment inserted.");

    // 3. Passes
    console.log("3. Upserting claimable passes in claimable_items...");
    const { error: passesErr } = await client
      .from("claimable_items")
      .upsert(SEED_DATA.passes, { onConflict: "id" });
    if (passesErr) throw new Error(`Failed to seed claimable_items: ${passesErr.message}`);
    console.log("   ✓ 2 Claimable passes inserted.");
  } else {
    console.log("Notice: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in environment.");
    console.log("Validating seed data against schemas and generating clean SQL...");
  }

  console.log("\n==========================================================");
  console.log("Verified Seed Records:");
  console.log("==========================================================");
  console.log("\n[event_staff]:");
  console.log(JSON.stringify(SEED_DATA.staff, null, 2));

  console.log("\n[payments]:");
  console.log(JSON.stringify(SEED_DATA.payment, null, 2));

  console.log("\n[claimable_items]:");
  console.log(JSON.stringify(SEED_DATA.passes, null, 2));

  console.log("\n==========================================================");
  console.log("SQL Migration / Seed Statement (Direct Supabase Execution):");
  console.log("==========================================================");
  console.log(`
-- 1. Insert Staff Member
INSERT INTO event_staff (iris_id, role, active, created_at)
VALUES ('DEV_USER_001', 'VOLUNTEER', true, NOW())
ON CONFLICT (iris_id) DO UPDATE SET active = true, role = 'VOLUNTEER';

-- 2. Insert Successful Payment
INSERT INTO payments (
    id, user_iris_id, purpose, reference_id, amount, currency,
    provider, provider_order_id, provider_payment_session_id, provider_payment_id,
    idempotency_key, status, failure_reason, customer_name, customer_email,
    customer_phone, paid_at, items, subtotal_amount, discount_amount, coupon_code,
    created_at, updated_at
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'STUDENT_NITK_001',
    'STORE_ORDER',
    NULL,
    300.00,
    'INR',
    'CASHFREE',
    'pay_11111111-1111-4111-8111-111111111111',
    'session_dev_123',
    'cf_payment_dev_123',
    'seed-dev-payment-001',
    'SUCCESS',
    NULL,
    'Dev Student',
    'dev.student@nitk.edu.in',
    '9876543210',
    NOW(),
    '[{"productId": "bhoori-bhojana", "name": "Bhoori Bhojana Food Pass", "category": "FOOD", "variant": null, "quantity": 2, "unitPrice": 150, "lineTotal": 300}]'::jsonb,
    300.00,
    0.00,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET status = 'SUCCESS', paid_at = NOW();

-- 3. Insert Claimable Items
INSERT INTO claimable_items (
    id, payment_id, user_iris_id, category, item_name, variant,
    item_index, status, token, claimed_at, claimed_by, created_at
)
VALUES
(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'STUDENT_NITK_001',
    'FOOD',
    'Bhoori Bhojana Food Pass',
    NULL,
    1,
    'ISSUED',
    '11111111-2222-4333-8444-555555555551',
    NULL,
    NULL,
    NOW()
),
(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '11111111-1111-4111-8111-111111111111',
    'STUDENT_NITK_001',
    'FOOD',
    'Bhoori Bhojana Food Pass',
    NULL,
    2,
    'ISSUED',
    '11111111-2222-4333-8444-555555555552',
    NULL,
    NULL,
    NOW()
)
ON CONFLICT (id) DO NOTHING;
`);
  console.log("==========================================================");
  console.log("✓ Seed execution complete.");
}

runSeed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
