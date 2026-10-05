import crypto from "node:crypto";

// Minimal in-memory stand-in for the parts of supabase-js the payment code uses:
// from(table).select/insert/update/delete + eq/neq/in/gt/order/limit + maybeSingle/single.
// Enforces the unique columns the real tables have (code 23505) and can inject
// one-off errors with failNext().

const UNIQUE = {
  payments: ["idempotency_key"],
  payment_events: ["provider_event_key"],
  claimable_items: ["token"],
};

export const createFakeDb = (seed = {}) => {
  const tables = {};
  const failures = [];

  for (const [name, rows] of Object.entries(seed)) {
    tables[name] = rows.map((row) => ({ ...row }));
  }

  const rowsOf = (name) => (tables[name] ??= []);

  // failNext("payments", "update", { code: "XX", message: "boom" })
  const failNext = (table, op, error) => failures.push({ table, op, error });

  const takeFailure = (table, op) => {
    const index = failures.findIndex((f) => f.table === table && f.op === op);
    return index === -1 ? null : failures.splice(index, 1)[0].error;
  };

  const from = (table) => {
    const q = { op: "select", filters: [], order: null, limit: null, payload: null, returning: false, mode: "many" };

    const matches = (row) =>
      q.filters.every(({ type, col, val }) => {
        if (type === "eq") return row[col] === val;
        if (type === "neq") return row[col] !== val;
        if (type === "in") return val.includes(row[col]);
        if (type === "gt") return row[col] > val;
        return true;
      });

    const execute = () => {
      const injected = takeFailure(table, q.op);
      if (injected) return { data: null, error: injected };

      const rows = rowsOf(table);

      if (q.op === "insert") {
        const payloadRows = Array.isArray(q.payload) ? q.payload : [q.payload];
        const inserted = [];

        for (const p of payloadRows) {
          const row = { created_at: new Date().toISOString(), ...p };
          if ((table === "payment_events" || table === "claimable_items") && !row.id) {
            row.id = crypto.randomUUID();
          }

          for (const col of UNIQUE[table] || []) {
            if (rows.some((r) => r[col] === row[col])) {
              return { data: null, error: { code: "23505", message: `duplicate key value violates unique constraint (${col})` } };
            }
          }

          rows.push(row);
          inserted.push({ ...row });
        }

        return shape(q.returning ? inserted : []);
      }

      if (q.op === "update") {
        const hit = rows.filter(matches);
        hit.forEach((row) => Object.assign(row, q.payload));
        return shape(q.returning ? hit.map((r) => ({ ...r })) : []);
      }

      if (q.op === "delete") {
        const keep = rows.filter((r) => !matches(r));
        tables[table] = keep;
        return shape([]);
      }

      let result = rows.filter(matches).map((r) => ({ ...r }));

      if (q.order) {
        const { col, ascending } = q.order;
        result.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (ascending ? 1 : -1));
      }

      if (q.limit !== null) result = result.slice(0, q.limit);

      return shape(result);
    };

    const shape = (rows) => {
      if (q.mode === "maybeSingle") return { data: rows[0] ?? null, error: null };
      if (q.mode === "single") {
        return rows.length === 1
          ? { data: rows[0], error: null }
          : { data: null, error: { code: "PGRST116", message: "no single row" } };
      }
      return { data: rows, error: null };
    };

    const api = {
      select: () => {
        if (q.op !== "select") q.returning = true;
        return api;
      },
      insert: (payload) => {
        q.op = "insert";
        q.payload = payload;
        return api;
      },
      update: (payload) => {
        q.op = "update";
        q.payload = payload;
        return api;
      },
      delete: () => {
        q.op = "delete";
        return api;
      },
      eq: (col, val) => (q.filters.push({ type: "eq", col, val }), api),
      neq: (col, val) => (q.filters.push({ type: "neq", col, val }), api),
      in: (col, val) => (q.filters.push({ type: "in", col, val }), api),
      gt: (col, val) => (q.filters.push({ type: "gt", col, val }), api),
      order: (col, { ascending = true } = {}) => ((q.order = { col, ascending }), api),
      limit: (n) => ((q.limit = n), api),
      maybeSingle: () => ((q.mode = "maybeSingle"), api),
      single: () => ((q.mode = "single"), api),
      then: (resolve, reject) => Promise.resolve(execute()).then(resolve, reject),
    };

    return api;
  };

  const rpcHandlers = {};
  const registerRpc = (name, handler) => {
    rpcHandlers[name] = handler;
  };
  const rpc = async (name, args) => {
    if (rpcHandlers[name]) {
      return rpcHandlers[name](args, tables);
    }
    return { data: null, error: null };
  };

  return { client: { from, rpc }, rows: rowsOf, failNext, registerRpc };
};

export const product = (id, price, extra = {}) => ({
  id,
  name: `Product ${id}`,
  category: "MERCH",
  group_key: id,
  fit: null,
  variant: null,
  unit_price: price,
  discount: 0,
  max_quantity: 5,
  active: true,
  ...extra,
});

export const coupon = (code, extra = {}) => ({
  code,
  discount_type: "FLAT",
  discount_value: 10,
  max_discount: null,
  min_order_amount: 0,
  max_uses: null,
  per_user_limit: 1,
  valid_from: null,
  valid_until: null,
  active: true,
  ...extra,
});

// Express-style response recorder
export const fakeRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    redirectedTo: null,
    cookies: {},
    cleared: [],
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res.body = body;
      return res;
    },
    redirect(url) {
      res.redirectedTo = url;
      res.statusCode = 302;
      return res;
    },
    cookie(name, value, options) {
      res.cookies[name] = { value, options };
      return res;
    },
    clearCookie(name) {
      res.cleared.push(name);
      return res;
    },
  };

  return res;
};
