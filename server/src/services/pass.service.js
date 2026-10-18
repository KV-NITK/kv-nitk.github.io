import crypto from "crypto";
import { supabase } from "../config/supabase.js";

/**
 * Idempotently issues claimable items (food coupons, merch) for a SUCCESS payment.
 * Inspects payment.items; for every item in FOOD or MERCH category,
 * loops `quantity` times and inserts into claimable_items with unique tokens.
 */
export const issuePassesForPayment = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  // 1. Fetch payment
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError) {
    console.error("Failed to fetch payment for pass issuance:", paymentError);
    throw new Error("Failed to fetch payment");
  }

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }

  if (payment.status !== "SUCCESS") {
    console.warn(
      `[issuePassesForPayment] Payment ${paymentId} status is '${payment.status}', expected 'SUCCESS'. Skipping pass issuance.`
    );
    return [];
  }

  // 2. Check if passes were already issued for this payment (idempotency)
  const { data: existingPasses, error: checkError } = await supabase
    .from("claimable_items")
    .select("*")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: true });

  if (checkError) {
    console.error("Failed to check existing passes for payment:", checkError);
    throw new Error("Failed to verify existing passes");
  }

  if (existingPasses && existingPasses.length > 0) {
    return existingPasses;
  }

  // 3. Parse items
  let rawItems = payment.items;
  if (typeof rawItems === "string") {
    try {
      rawItems = JSON.parse(rawItems);
    } catch {
      rawItems = [];
    }
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return [];
  }

  const rowsToInsert = [];
  // Numbered across the whole order (not per line), so (payment_id, item_index)
  // is unique and a second issuing of the same order cannot insert again
  let itemIndex = 0;

  for (const item of rawItems) {
    const category = String(item.category || "").trim().toUpperCase();
    if (category !== "FOOD" && category !== "MERCH") {
      continue;
    }

    const quantity = Math.max(0, parseInt(item.quantity, 10) || 0);
    const itemName = item.name || (category === "FOOD" ? "Bhoori Bhojana" : "Merchandise");
    const variant = item.variant ? String(item.variant).trim() : null;

    // One row, and so one QR code, per unit bought
    for (let n = 0; n < quantity; n++) {
      rowsToInsert.push({
        id: crypto.randomUUID(),
        payment_id: payment.id,
        user_iris_id: payment.user_iris_id,
        category,
        // Required by the table (NOT NULL); without it every insert fails
        product_id: String(item.productId || ""),
        item_name: itemName,
        variant,
        item_index: ++itemIndex,
        status: "ISSUED",
        token: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      });
    }
  }

  if (rowsToInsert.length === 0) {
    return [];
  }

  // 4. Insert passes
  const { data: inserted, error: insertError } = await supabase
    .from("claimable_items")
    .insert(rowsToInsert)
    .select();

  if (insertError) {
    // The webhook and the status check can issue at the same moment; the unique
    // index (sql/002_food_coupons.sql) makes the second insert fail, so the
    // passes the first one wrote are returned instead
    const { data: fallbackPasses } = await supabase
      .from("claimable_items")
      .select("*")
      .eq("payment_id", paymentId);

    if (fallbackPasses && fallbackPasses.length > 0) {
      return fallbackPasses;
    }

    console.error("Failed to insert claimable items:", insertError);
    throw new Error("Failed to issue passes");
  }

  return inserted || [];
};

/**
 * Issues passes for any of the user's paid orders that have none yet. Passes
 * are normally issued when the payment succeeds (webhook or status check), but
 * if that failed, or the buyer never came back to the status page, opening My
 * Orders makes them. Best effort: a failure here never hides the passes that
 * already exist.
 */
const issueMissingPasses = async (userIrisId) => {
  try {
    const { data: paid, error } = await supabase
      .from("payments")
      .select("id, items")
      .eq("user_iris_id", userIrisId)
      .eq("status", "SUCCESS");

    if (error || !paid?.length) return;

    const { data: issued } = await supabase
      .from("claimable_items")
      .select("payment_id")
      .eq("user_iris_id", userIrisId);

    const hasPasses = new Set((issued || []).map((row) => row.payment_id));

    const needsPasses = (payment) =>
      !hasPasses.has(payment.id) &&
      Array.isArray(payment.items) &&
      payment.items.some((item) => ["FOOD", "MERCH"].includes(String(item.category || "").toUpperCase()));

    for (const payment of paid.filter(needsPasses)) {
      await issuePassesForPayment(payment.id);
    }
  } catch (err) {
    console.error("Failed to issue missing passes:", err);
  }
};

/**
 * Fetches user's claimable passes ordered by created_at desc.
 */
export const getUserPasses = async (userIrisId) => {
  if (!userIrisId) {
    throw new Error("User identity is required");
  }

  await issueMissingPasses(userIrisId);

  const { data, error } = await supabase
    .from("claimable_items")
    .select("*")
    .eq("user_iris_id", userIrisId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch passes for user:", error);
    throw new Error("Failed to fetch user passes");
  }

  return data || [];
};

/**
 * Scans / claims a pass token via atomic RPC.
 */
export const scanPass = async (token, staffIrisId) => {
  if (!token) {
    throw new Error("Pass token is required");
  }

  if (!staffIrisId) {
    throw new Error("Staff ID is required");
  }

  const cleanToken = typeof token === "string" ? token.trim() : token;

  const { data, error } = await supabase.rpc("claim_event_pass", {
    p_token: cleanToken,
    p_staff_iris_id: staffIrisId,
  });

  if (error) {
    console.error("Error executing claim_event_pass RPC:", error);
    throw new Error("Failed to claim pass: " + error.message);
  }

  return data;
};
