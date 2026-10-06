import { Cashfree, CFEnvironment } from "cashfree-pg";

let client = null;

// Created on first use, not at import time: a missing Cashfree key must only
// break payments, not stop the whole API from starting.
export const getCashfree = () => {
  if (client) {
    return client;
  }

  const clientId = process.env.CASHFREE_CLIENT_ID?.trim();
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET?.trim();
  const environment = process.env.CASHFREE_ENV?.trim() || "SANDBOX";

  console.log("=== CASHFREE DEBUG ===");
  console.log("CASHFREE_CLIENT_ID:", clientId ? clientId.substring(0, 8) + "..." : "MISSING");
  console.log("CASHFREE_CLIENT_SECRET:", clientSecret ? clientSecret.substring(0, 12) + "..." : "MISSING");
  console.log("CASHFREE_ENV raw:", JSON.stringify(environment));
  console.log("CFEnvironment.PRODUCTION:", CFEnvironment.PRODUCTION);
  console.log("CFEnvironment.SANDBOX:", CFEnvironment.SANDBOX);
  const envValue = environment.trim() === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  console.log("Using environment value:", envValue);
  console.log("=== END DEBUG ===");

  if (!clientId) {
    throw new Error("Missing CASHFREE_CLIENT_ID");
  }

  if (!clientSecret) {
    throw new Error("Missing CASHFREE_CLIENT_SECRET");
  }

  client = new Cashfree(
    envValue,
    clientId.trim(),
    clientSecret.trim()
  );

  return client;
};
