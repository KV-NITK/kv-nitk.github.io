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

  if (!clientId) {
    throw new Error("Missing CASHFREE_CLIENT_ID");
  }

  if (!clientSecret) {
    throw new Error("Missing CASHFREE_CLIENT_SECRET");
  }

  const env = environment.toUpperCase() === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  client = new Cashfree(
    env,
    clientId,
    clientSecret
  );

  return client;
};
