import { getUserPasses, scanPass } from "../services/pass.service.js";
import { scanPassSchema } from "../validators/pass.validator.js";

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
      message: error.message || "Failed to fetch user passes",
    });
  }
};

/**
 * POST /api/passes/scan
 * Allows event staff to scan and claim a user pass token.
 */
export const scanPassController = async (req, res) => {
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
    const result = await scanPass(parsed.data.token, staffIrisId);

    return res.status(200).json({
      success: result.result === "OK",
      ...result,
    });
  } catch (error) {
    console.error("scanPassController error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process pass scan",
    });
  }
};
