import { supabase } from "../src/config/supabase.js";
import { issuePassesForPayment } from "../src/services/pass.service.js";

const paymentId = "bc4ae81e-edde-458b-b907-c579fcf089b9";

async function main() {
  console.log(`Updating order ${paymentId} in payments table: status = 'SUCCESS'...`);

  const { data: updatedPayment, error: updateError } = await supabase
    .from("payments")
    .update({
      status: "SUCCESS",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to update payment status:", updateError);
    process.exit(1);
  }

  console.log("Payment record updated successfully:", {
    id: updatedPayment.id,
    status: updatedPayment.status,
    customer_name: updatedPayment.customer_name,
    amount: updatedPayment.amount,
  });

  console.log(`\nIssuing passes via issuePassesForPayment('${paymentId}')...`);
  const issued = await issuePassesForPayment(paymentId);
  console.log(`Pass issuance completed. Returned count: ${issued.length}`);

  console.log(`\nQuerying claimable_items for payment_id: ${paymentId}...`);
  const { data: claimableItems, error: queryError } = await supabase
    .from("claimable_items")
    .select("id, payment_id, user_iris_id, category, item_name, variant, item_index, status, token, created_at")
    .eq("payment_id", paymentId)
    .order("category", { ascending: true })
    .order("item_index", { ascending: true });

  if (queryError) {
    console.error("Failed to query claimable_items:", queryError);
    process.exit(1);
  }

  console.log(`\nRetrieved ${claimableItems.length} claimable item(s):`);
  console.table(
    claimableItems.map((item) => ({
      category: item.category,
      item_name: item.item_name,
      variant: item.variant || "-",
      index: item.item_index,
      status: item.status,
      token: item.token,
    }))
  );

  console.log("\nDetailed claimable items:");
  console.log(JSON.stringify(claimableItems, null, 2));
}

main().catch((err) => {
  console.error("Unexpected error in test-mint:", err);
  process.exit(1);
});
