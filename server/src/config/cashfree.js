import { Cashfree } from "cashfree-pg";

const clientId = process.env.CASHFREE_CLIENT_ID;
const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
const environment = process.env.CASHFREE_ENV || "SANDBOX";

if (!clientId) {
  throw new Error("Missing CASHFREE_CLIENT_ID");
}

if (!clientSecret) {
  throw new Error("Missing CASHFREE_CLIENT_SECRET");
}

const cashfreeEnvironment =
  environment === "PRODUCTION"
    ? Cashfree.PRODUCTION
    : Cashfree.SANDBOX;

export const cashfree = new Cashfree(
  cashfreeEnvironment,
  clientId,
  clientSecret
);