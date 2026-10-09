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

  for (const item of rawItems) {
    const category = String(item.category || "").trim().toUpperCase();
    if (category !== "FOOD" && category !== "MERCH") {
      continue;
    }

    const quantity = Math.max(0, parseInt(item.quantity, 10) || 0);
    const itemName = item.name || (category === "FOOD" ? "Bhoori Bhojana" : "Merchandise");
    const variant = item.variant ? String(item.variant).trim() : null;

    for (let index = 1; index <= quantity; index++) {
      rowsToInsert.push({
        id: crypto.randomUUID(),
        payment_id: payment.id,
        user_iris_id: payment.user_iris_id,
        category,
        item_name: itemName,
        variant,
        item_index: index,
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
    // If another concurrent execution already inserted, return the existing passes
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
 * Fetches user's claimable passes ordered by created_at desc.
 */
export const getUserPasses = async (userIrisId) => {
  if (!userIrisId) {
    throw new Error("User identity is required");
  }

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

  const tRpc = Date.now();
  console.log(`[scanPass] Invoking claim_event_pass RPC:`, {
    p_token: cleanToken,
    p_staff_iris_id: staffIrisId,
  });

  const { data, error } = await supabase.rpc("claim_event_pass", {
    p_token: cleanToken,
    p_staff_iris_id: staffIrisId,
  });

  console.log(`[scanPass] claim_event_pass RPC completed in ${Date.now() - tRpc}ms, raw response:`, { data, error });

  if (error) {
    console.error("Error executing claim_event_pass RPC:", error);
    throw new Error("Failed to claim pass: " + error.message);
  }

  return data;
};
