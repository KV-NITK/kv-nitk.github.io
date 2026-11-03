import { listPasses, PassListError } from "../services/passList.service.js";
import { listPassesSchema } from "../validators/passList.validator.js";

/**
 * GET /api/passes/list?category=&status=ISSUED|CLAIMED&fit=&size=&q=&page=
 * Any active staff member (volunteer or admin). Claiming and reverting go through
 * the same /scan and /revert routes as before, with their own rules.
 */
export const listPassesController = async (req, res) => {
  const parsed = listPassesSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid request",
    });
  }

  try {
    const result = await listPasses(parsed.data);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof PassListError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    console.error("listPassesController error:", error);

    return res.status(500).json({ success: false, message: "Failed to load the pass list" });
  }
};
