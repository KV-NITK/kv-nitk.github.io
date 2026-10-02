import { mock } from "node:test";

const srcUrl = (path) => new URL(`../../src/${path}`, import.meta.url).href;

// Node 24+ calls the option `exports` (and deprecates `namedExports`); Node 22 only knows `namedExports`.
const EXPORTS_KEY = Number(process.versions.node.split(".")[0]) >= 24 ? "exports" : "namedExports";

export const mockModule = (path, exports) => mock.module(srcUrl(path), { [EXPORTS_KEY]: exports });

// Replace the Supabase client module with a fake before the code under test is imported
export const mockSupabase = (client) =>
  mockModule("config/supabase.js", { supabase: client });

// Replace cashfree.service with controllable fakes
export const mockCashfreeService = (impl) =>
  mockModule("services/cashfree.service.js", {
    createCashfreeOrder: (...args) => impl.createCashfreeOrder(...args),
    getCashfreePayments: (...args) => impl.getCashfreePayments(...args),
    getCashfreeOrder: (...args) => impl.getCashfreeOrder?.(...args),
    verifyCashfreeWebhook: (...args) => impl.verifyCashfreeWebhook(...args),
  });

export const importSrc = (path) => import(srcUrl(path));
