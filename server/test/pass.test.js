import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createFakeDb, fakeRes } from "./helpers/fakeSupabase.js";
import { mockSupabase, importSrc } from "./helpers/mocks.js";

const db = createFakeDb();
mockSupabase(db.client);

const {
  merchSizeSchema,
  sizeEnumSchema,
  merchColorSchema,
  scanPassSchema,
  MERCH_SIZES,
  MERCH_COLORS,
} = await importSrc("validators/pass.validator.js");

const {
  issuePassesForPayment,
  getUserPasses,
  scanPass,
} = await importSrc("services/pass.service.js");

const { requireStaff } = await importSrc("middleware/staff.middleware.js");

const {
  getMyPassesController,
  scanPassController,
} = await importSrc("controllers/pass.controller.js");

describe("pass validators", () => {
  it("validates allowed merch sizes case-insensitively and returns uppercase", () => {
    for (const size of ["xs", "s", "m", "l", "xl", "xxl"]) {
      const parsed = merchSizeSchema.safeParse(size);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data, size.toUpperCase());
    }

    for (const size of ["XS", "S", "M", "L", "XL", "XXL"]) {
      const parsed = merchSizeSchema.safeParse(size);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data, size);
    }
  });

  it("rejects invalid merch sizes", () => {
    const invalidSizes = ["XXXL", "small", "LARGE", "", "123", null, undefined];
    for (const size of invalidSizes) {
      const parsed = merchSizeSchema.safeParse(size);
      assert.equal(parsed.success, false);
    }
  });

  it("validates merch colors", () => {
    assert.equal(merchColorSchema.safeParse("Black").success, true);
    assert.equal(merchColorSchema.safeParse("White").success, true);
    assert.equal(merchColorSchema.safeParse("Red").success, false);
  });

  it("validates UUID token for scanner endpoint", () => {
    const validUuid = crypto.randomUUID();
    const validResult = scanPassSchema.safeParse({ token: validUuid });
    assert.equal(validResult.success, true);
    assert.equal(validResult.data.token, validUuid);

    const invalidResult = scanPassSchema.safeParse({ token: "not-a-uuid" });
    assert.equal(invalidResult.success, false);

    const missingResult = scanPassSchema.safeParse({});
    assert.equal(missingResult.success, false);
  });
});

describe("pass service", () => {
  beforeEach(() => {
    db.rows("payments").splice(0, Infinity);
    db.rows("claimable_items").splice(0, Infinity);
    db.rows("event_staff").splice(0, Infinity);
  });

  it("issues passes for SUCCESS payment with FOOD and MERCH items", async () => {
    const paymentId = crypto.randomUUID();
    db.rows("payments").push({
      id: paymentId,
      user_iris_id: "user-123",
      status: "SUCCESS",
      items: [
        { productId: "bhoori-bhojana", name: "Bhoori Bhojana Food Pass", category: "FOOD", quantity: 2 },
        { productId: "tshirt-black-m", name: "Parva T-Shirt", category: "MERCH", variant: "M", quantity: 1 },
        { productId: "donation", name: "Donation", category: "DONATION", quantity: 1 },
      ],
    });

    const passes = await issuePassesForPayment(paymentId);
    assert.equal(passes.length, 3);

    // 2 food passes
    const foodPasses = passes.filter((p) => p.category === "FOOD");
    assert.equal(foodPasses.length, 2);
    assert.equal(foodPasses[0].item_index, 1);
    assert.equal(foodPasses[1].item_index, 2);
    assert.equal(foodPasses[0].variant, null);
    assert.equal(foodPasses[0].status, "ISSUED");

    // 1 merch pass
    const merchPasses = passes.filter((p) => p.category === "MERCH");
    assert.equal(merchPasses.length, 1);
    assert.equal(merchPasses[0].variant, "M");
    assert.equal(merchPasses[0].item_index, 1);

    // Passes stored in DB
    assert.equal(db.rows("claimable_items").length, 3);
  });

  it("is idempotent: repeated calls return existing passes without duplication", async () => {
    const paymentId = crypto.randomUUID();
    db.rows("payments").push({
      id: paymentId,
      user_iris_id: "user-456",
      status: "SUCCESS",
      items: [
        { productId: "bhoori-bhojana", name: "Food Pass", category: "FOOD", quantity: 1 },
      ],
    });

    const firstRun = await issuePassesForPayment(paymentId);
    assert.equal(firstRun.length, 1);
    assert.equal(db.rows("claimable_items").length, 1);

    const secondRun = await issuePassesForPayment(paymentId);
    assert.equal(secondRun.length, 1);
    assert.equal(secondRun[0].id, firstRun[0].id);
    assert.equal(db.rows("claimable_items").length, 1);
  });

  it("does not issue passes if payment status is not SUCCESS", async () => {
    const paymentId = crypto.randomUUID();
    db.rows("payments").push({
      id: paymentId,
      user_iris_id: "user-789",
      status: "PENDING",
      items: [
        { productId: "bhoori-bhojana", name: "Food Pass", category: "FOOD", quantity: 1 },
      ],
    });

    const passes = await issuePassesForPayment(paymentId);
    assert.deepEqual(passes, []);
    assert.equal(db.rows("claimable_items").length, 0);
  });

  it("getUserPasses retrieves user passes ordered by created_at desc", async () => {
    const userIrisId = "user-999";
    db.rows("claimable_items").push(
      {
        id: crypto.randomUUID(),
        user_iris_id: userIrisId,
        item_name: "Pass Old",
        category: "FOOD",
        status: "ISSUED",
        created_at: "2026-10-01T10:00:00Z",
      },
      {
        id: crypto.randomUUID(),
        user_iris_id: userIrisId,
        item_name: "Pass New",
        category: "MERCH",
        status: "ISSUED",
        created_at: "2026-10-05T10:00:00Z",
      },
      {
        id: crypto.randomUUID(),
        user_iris_id: "other-user",
        item_name: "Other User Pass",
        category: "FOOD",
        status: "ISSUED",
        created_at: "2026-10-03T10:00:00Z",
      }
    );

    const userPasses = await getUserPasses(userIrisId);
    assert.equal(userPasses.length, 2);
    assert.equal(userPasses[0].item_name, "Pass New");
    assert.equal(userPasses[1].item_name, "Pass Old");
  });

  it("scanPass calls RPC claim_event_pass", async () => {
    const testToken = crypto.randomUUID();
    const testStaffId = "staff-01";

    db.registerRpc("claim_event_pass", (args) => {
      assert.equal(args.p_token, testToken);
      assert.equal(args.p_staff_iris_id, testStaffId);
      return {
        data: {
          result: "OK",
          item: { id: "item-1", status: "CLAIMED" },
        },
        error: null,
      };
    });

    const result = await scanPass(testToken, testStaffId);
    assert.equal(result.result, "OK");
    assert.equal(result.item.status, "CLAIMED");
  });
});

describe("staff middleware", () => {
  beforeEach(() => {
    db.rows("event_staff").splice(0, Infinity);
  });

  it("blocks request if user is not authenticated", async () => {
    const req = {};
    const res = fakeRes();
    let nextCalled = false;

    await requireStaff(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it("blocks request with 403 if user is not in event_staff", async () => {
    const req = { user: { irisId: "student-not-staff" } };
    const res = fakeRes();
    let nextCalled = false;

    await requireStaff(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  it("blocks request with 403 if user in event_staff is inactive", async () => {
    db.rows("event_staff").push({ iris_id: "staff-inactive", role: "VOLUNTEER", active: false });
    const req = { user: { irisId: "staff-inactive" } };
    const res = fakeRes();
    let nextCalled = false;

    await requireStaff(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  it("allows request and sets req.staff if user is active staff", async () => {
    db.rows("event_staff").push({ iris_id: "staff-active", role: "VOLUNTEER", active: true });
    const req = { user: { irisId: "staff-active" } };
    const res = fakeRes();
    let nextCalled = false;

    await requireStaff(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.equal(req.staff.role, "VOLUNTEER");
  });
});

describe("pass controllers", () => {
  beforeEach(() => {
    db.rows("claimable_items").splice(0, Infinity);
    db.rows("event_staff").splice(0, Infinity);
  });

  it("getMyPassesController returns user passes", async () => {
    const userIrisId = "u-passes";
    db.rows("claimable_items").push({
      id: crypto.randomUUID(),
      user_iris_id: userIrisId,
      item_name: "Food Pass",
      category: "FOOD",
      status: "ISSUED",
      created_at: new Date().toISOString(),
    });

    const req = { user: { irisId: userIrisId } };
    const res = fakeRes();

    await getMyPassesController(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.passes.length, 1);
  });

  it("scanPassController rejects invalid token format with 400", async () => {
    const req = { user: { irisId: "staff-1" }, body: { token: "bad-token" } };
    const res = fakeRes();

    await scanPassController(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
  });

  it("scanPassController returns scan outcome from scanPass", async () => {
    const validToken = crypto.randomUUID();
    db.registerRpc("claim_event_pass", () => ({
      data: { result: "OK", item: { id: "item-123", status: "CLAIMED" } },
      error: null,
    }));

    const req = { user: { irisId: "staff-1" }, body: { token: validToken } };
    const res = fakeRes();

    await scanPassController(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.result, "OK");
  });
});
