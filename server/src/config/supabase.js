import dns from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = WebSocket;
}

const rawSupabaseUrl = process.env.SUPABASE_URL;
// Use SUPABASE_SERVICE_ROLE_KEY for server operations, falling back to SUPABASE_ANON_KEY
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!rawSupabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

// Configure custom Undici Agent forcing IPv4 DNS lookup to eliminate 5-10s Windows timeouts
const ipv4Agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { ...options, family: 4 }, callback);
    },
  },
  keepAliveTimeout: 30000,
  keepAliveMaxTimeout: 60000,
});

const customFetch = (url, options) => {
  return undiciFetch(url, {
    ...options,
    dispatcher: ipv4Agent,
  });
};

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: customFetch,
    },
  }
);