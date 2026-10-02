import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { importSrc } from "./helpers/mocks.js";

const { getFrontendUrl, getPaymentReturnUrl, getAllowedOrigins } = await importSrc("config/urls.js");

const KEYS = ["FRONTEND_URL", "CASHFREE_RETURN_URL"];

describe("frontend urls come from FRONTEND_URL alone", () => {
  let saved;

  beforeEach(() => {
    saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
    delete process.env.CASHFREE_RETURN_URL;
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("builds the Cashfree return url from FRONTEND_URL, keeping the {order_id} placeholder", () => {
    process.env.FRONTEND_URL = "http://kannadavedike.dev.local:5173";
    assert.equal(getPaymentReturnUrl(), "http://kannadavedike.dev.local:5173/payment/status?order_id={order_id}");
  });

  it("follows a port change with no other setting touched", () => {
    process.env.FRONTEND_URL = "http://kannadavedike.dev.local:6000";
    assert.equal(getPaymentReturnUrl(), "http://kannadavedike.dev.local:6000/payment/status?order_id={order_id}");
    assert.ok(getAllowedOrigins().includes("http://localhost:6000"));
    assert.ok(!getAllowedOrigins().some((o) => o.includes("5173")));
  });

  it("ignores a trailing slash", () => {
    process.env.FRONTEND_URL = "https://kannadavedike.nitk.ac.in/";
    assert.equal(getFrontendUrl(), "https://kannadavedike.nitk.ac.in");
    assert.equal(getPaymentReturnUrl(), "https://kannadavedike.nitk.ac.in/payment/status?order_id={order_id}");
  });

  it("lets CASHFREE_RETURN_URL override the default", () => {
    process.env.FRONTEND_URL = "http://a.test:5173";
    process.env.CASHFREE_RETURN_URL = "https://custom.test/done?order_id={order_id}";
    assert.equal(getPaymentReturnUrl(), "https://custom.test/done?order_id={order_id}");
  });

  it("allows the dev hosts on the configured port, without duplicates", () => {
    process.env.FRONTEND_URL = "http://kannadavedike.dev.local:5173";
    assert.deepEqual(getAllowedOrigins(), [
      "http://kannadavedike.dev.local:5173",
      "http://localhost:5173",
      "https://kannadavedike.dev.local:5173",
    ]);
  });

  it("allows just the site itself in production (no port)", () => {
    process.env.FRONTEND_URL = "https://kannadavedike.nitk.ac.in";
    assert.ok(getAllowedOrigins().includes("https://kannadavedike.nitk.ac.in"));
    assert.ok(!getAllowedOrigins().some((o) => /:\d+$/.test(o)));
  });

  it("copes with FRONTEND_URL missing or not a URL", () => {
    delete process.env.FRONTEND_URL;
    assert.deepEqual(getAllowedOrigins(), []);

    process.env.FRONTEND_URL = "not a url";
    assert.deepEqual(getAllowedOrigins(), ["not a url"]);
  });
});
