import { supabase } from "../src/config/supabase.js";
import { issuePassesForPayment } from "../src/services/pass.service.js";

async function backfillPasses() {
  console.log("==================================================");
  console.log("Starting Pass Backfill Script");
  console.log("==================================================\n");

  console.log("Fetching all payments with status = 'SUCCESS'...");
  const { data: payments, error: fetchError } = await supabase
    .from("payments")
    .select("id, user_iris_id, customer_name, status, created_at, items")
    .eq("status", "SUCCESS")
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("Failed to fetch payments:", fetchError);
    process.exit(1);
  }

  if (!payments || payments.length === 0) {
    console.log("No payments with status = 'SUCCESS' found.");
    console.log("\nSummary: 0 orders processed, 0 passes minted, 0 orders skipped.");
    return;
  }

  console.log(`Found ${payments.length} SUCCESS payment(s) to verify.\n`);

  let ordersProcessed = 0;
  let ordersMinted = 0;
  let passesMinted = 0;
  let ordersSkipped = 0;
  const failureList = [];

  for (const payment of payments) {
    ordersProcessed++;
    const label = `[Order ${ordersProcessed}/${payments.length}] ${payment.id}`;

    try {
      // Check if passes already exist for this payment in claimable_items
      const { count, error: countError } = await supabase
        .from("claimable_items")
        .select("*", { count: "exact", head: true })
        .eq("payment_id", payment.id);

      if (countError) {
        console.error(`${label}: Error checking existing passes:`, countError);
        failureList.push({ id: payment.id, error: countError.message });
        continue;
      }

      if (count && count > 0) {
        console.log(`${label}: Already has ${count} pass(es) in claimable_items. (Skipped)`);
        ordersSkipped++;
        continue;
      }

      // No passes exist; issue them idempotently
      console.log(`${label}: Minting passes for ${payment.customer_name || payment.user_iris_id}...`);
      const minted = await issuePassesForPayment(payment.id);

      if (minted.length > 0) {
        console.log(`${label}: Successfully minted ${minted.length} pass(es).`);
        ordersMinted++;
        passesMinted += minted.length;
      } else {
        console.log(`${label}: No claimable FOOD or MERCH items found to mint. (Skipped)`);
        ordersSkipped++;
      }
    } catch (err) {
      console.error(`${label}: Failed during issuance:`, err.message);
      failureList.push({ id: payment.id, error: err.message });
    }
  }

  console.log("\n==================================================");
  console.log("Backfill Summary");
  console.log("==================================================");
  console.table({
    "Total Orders Processed": ordersProcessed,
    "Orders Backfilled": ordersMinted,
    "Total Passes Minted": passesMinted,
    "Orders Skipped (Already Present / No Items)": ordersSkipped,
    "Failed Orders": failureList.length,
  });

  if (failureList.length > 0) {
    console.error("Errors encountered for following orders:", failureList);
    process.exit(1);
  } else {
    console.log("Pass backfill completed successfully.\n");
  }
}

backfillPasses().catch((err) => {
  console.error("Unhandled error during backfill:", err);
  process.exit(1);
});
