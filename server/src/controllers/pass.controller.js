import { getUserPasses, scanPass, searchPasses, revertPass } from "../services/pass.service.js";
import {
  scanPassSchema,
  searchPassesSchema,
  revertPassSchema,
} from "../validators/pass.validator.js";

/**
 * GET /api/passes/my-passes
 * Returns claimable items (food coupons, merch) for the authenticated user.
 */
export const getMyPassesController = async (req, res) => {
  try {
    const userIrisId = req.user.irisId;
    const passes = await getUserPasses(userIrisId);

    return res.status(200).json({
      success: true,
      passes,
    });
  } catch (error) {
    console.error("getMyPassesController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your passes",
    });
  }
};

/**
 * GET /api/passes/staff/me
 * The signed-in staff member (requireStaff has already checked event_staff).
 */
export const staffMeController = (req, res) =>
  res.status(200).json({
    success: true,
    staff: {
      irisId: req.staff.iris_id,
      name: req.staff.name || req.user.name || "",
      role: req.staff.role,
    },
  });

/**
 * POST /api/passes/scan
 * Allows event staff to scan and claim a user pass token. `category` is the
 * scanner's mode; a pass of the other category is reported, never claimed.
 */
export const scanPassController = async (req, res) => {
  const t0 = Date.now();

  try {
    const parsed = scanPassSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid pass scan request",
        errors: parsed.error.flatten(),
      });
    }

    const staffIrisId = req.user.irisId;
    const result = await scanPass(parsed.data.token, staffIrisId, parsed.data.category);

    // Tokens are bearer secrets, so only the outcome is logged
    console.log(`[SCAN] ${result.result} by ${staffIrisId} in ${Date.now() - t0}ms`);

    return res.status(200).json({
      success: result.result === "OK",
      ...result,
    });
  } catch (error) {
    console.error("scanPassController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process pass scan",
    });
  }
};

/**
 * GET /api/passes/search?q=<reg / roll no>&category=FOOD|MERCH
 */
export const searchPassesController = async (req, res) => {
  const parsed = searchPassesSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid search",
    });
  }

  try {
    const passes = await searchPasses(parsed.data.q, parsed.data.category);

    return res.status(200).json({ success: true, passes });
  } catch (error) {
    console.error("searchPassesController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search passes",
    });
  }
};

/**
 * POST /api/passes/revert
 * Admin only. Sets a claimed pass back to ISSUED; the reversal is stamped with this staff member.
 */
export const revertPassController = async (req, res) => {
  // Reverting hands a claimed pass back out, so only admins may do it
  if (req.staff?.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      result: "FORBIDDEN",
      message: "Volunteers cannot revert a claim. Ask an admin to revert it.",
    });
  }

  const parsed = revertPassSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid revert request",
    });
  }

  try {
    const result = await revertPass(parsed.data.id, req.user.irisId);

    console.log(`[REVERT] ${result.result} by ${req.user.irisId}`);

    return res.status(200).json({
      success: result.result === "REVERTED",
      ...result,
    });
  } catch (error) {
    console.error("revertPassController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to revert pass",
    });
  }
};
