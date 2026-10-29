import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const { getInventoryController, setStockController, addSpotSaleController, undoSpotSaleController } =
  await importSrc("controllers/inventory.controller.js");

const call = async (controller, { params = {}, body } = {}) => {
  const res = fakeRes();
  await controller({ params, body }, res);
  return res;
};

const INVENTORY = {
  rows: [{ productId: "tshirt-b-m", fit: "Oversized", size: "M", stock: 40, claimed: 31, spot: 2, toCollect: 6 }],
  unmatched: { claimed: 1, toCollect: 0 },
  spotSales: [{ id: 3, productId: "tshirt-b-m", fit: "Oversized", size: "M", quantity: 2, studentName: "Rahul", createdAt: "2026-10-30T06:00:00Z" }],
};

// Records the last call to each database function, and answers with INVENTORY
let calls;
const answer = (name, result = { data: INVENTORY, error: null }) =>
  db.registerRpc(name, (args) => {
    calls[name] = args;
    return result;
  });

beforeEach(() => {
  calls = {};
  for (const name of ["merch_inventory", "set_merch_stock", "add_merch_spot_sale", "undo_merch_spot_sale"]) answer(name);
});

describe("inventory", () => {
  it("returns the rows, unmatched counts and spot sales", async () => {
    const res = await call(getInventoryController);
    assert.equal(res.statusCode, 200);
    assert.deepEqual([res.body.rows, res.body.unmatched, res.body.spotSales], [INVENTORY.rows, INVENTORY.unmatched, INVENTORY.spotSales]);
  });

  it("says to run the migration (503) when it is missing", async () => {
    answer("merch_inventory", { data: null, error: { code: "PGRST202", message: "Could not find the function" } });
    const res = await call(getInventoryController);
    assert.equal(res.statusCode, 503);
    assert.match(res.body.message, /008_merch_inventory/);
  });
});

describe("set stock", () => {
  it("saves every row in one call", async () => {
    const items = [{ productId: "tshirt-b-m", stock: 40 }, { productId: "tshirt-a-l", stock: 0 }];
    const res = await call(setStockController, { body: { items } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls.set_merch_stock, { p_items: items });
    assert.deepEqual(res.body.rows, INVENTORY.rows);
  });

  it("rejects negative, fractional, text or missing stock, odd product ids and empty lists", async () => {
    const bad = [
      {},
      { items: [] },
      { items: [{ productId: "tshirt-b-m", stock: -1 }] },
      { items: [{ productId: "tshirt-b-m", stock: 1.5 }] },
      { items: [{ productId: "tshirt-b-m", stock: "40" }] },
      { items: [{ productId: "tshirt-b-m" }] },
      { items: [{ productId: "Robert'); DROP", stock: 1 }] },
    ];
    for (const body of bad) {
      assert.equal((await call(setStockController, { body })).statusCode, 400, JSON.stringify(body));
    }
    assert.equal(calls.set_merch_stock, undefined);
  });

  it("an unknown product from the database is a 400 with a clear message", async () => {
    answer("set_merch_stock", { data: null, error: { message: "UNKNOWN_PRODUCT" } });
    const res = await call(setStockController, { body: { items: [{ productId: "tshirt-z-m", stock: 1 }] } });
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Unknown product/);
  });
});

describe("spot sales", () => {
  it("defaults the quantity to 1 and leaves the name out when blank", async () => {
    for (const studentName of [undefined, "", "   "]) {
      const res = await call(addSpotSaleController, { body: { productId: "tshirt-b-m", studentName } });
      assert.equal(res.statusCode, 201);
      assert.deepEqual(calls.add_merch_spot_sale, { p_product_id: "tshirt-b-m", p_quantity: 1, p_student_name: null });
    }
  });

  it("passes the quantity and a trimmed name", async () => {
    await call(addSpotSaleController, { body: { productId: "tshirt-a-xl", quantity: 3, studentName: "  Rahul K " } });
    assert.deepEqual(calls.add_merch_spot_sale, { p_product_id: "tshirt-a-xl", p_quantity: 3, p_student_name: "Rahul K" });
  });

  it("rejects a quantity of 0, over 100 or not whole, a missing product and a long name", async () => {
    const bad = [
      { productId: "tshirt-b-m", quantity: 0 },
      { productId: "tshirt-b-m", quantity: 101 },
      { productId: "tshirt-b-m", quantity: 1.5 },
      { quantity: 1 },
      { productId: "tshirt-b-m", studentName: "x".repeat(81) },
    ];
    for (const body of bad) {
      assert.equal((await call(addSpotSaleController, { body })).statusCode, 400, JSON.stringify(body));
    }
    assert.equal(calls.add_merch_spot_sale, undefined);
  });

  it("undoes a spot sale by id and returns the updated inventory", async () => {
    const res = await call(undoSpotSaleController, { params: { id: "3" } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls.undo_merch_spot_sale, { p_id: 3 });
    assert.deepEqual(res.body.rows, INVENTORY.rows);
  });

  it("undo: 409 if already undone, 404 if unknown, 400 for a bad id", async () => {
    answer("undo_merch_spot_sale", { data: null, error: { message: "ALREADY_UNDONE" } });
    assert.equal((await call(undoSpotSaleController, { params: { id: "3" } })).statusCode, 409);
    answer("undo_merch_spot_sale", { data: null, error: { message: "SPOT_SALE_NOT_FOUND" } });
    assert.equal((await call(undoSpotSaleController, { params: { id: "99" } })).statusCode, 404);
    for (const id of ["0", "-2", "abc", "1.5"]) {
      assert.equal((await call(undoSpotSaleController, { params: { id } })).statusCode, 400, id);
    }
  });
});
