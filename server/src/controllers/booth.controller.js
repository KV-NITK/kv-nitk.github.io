import { supabase } from "../config/supabase.js";
import { scanPass, searchPasses } from "../services/pass.service.js";
import { scanPassSchema, searchPassesSchema } from "../validators/pass.validator.js";

// The photo booth's scanner. The person at the booth has no IRIS login, so the
// booth password (requireBoothPasscode) lets them in, and every claim is made
// as this one event_staff row (server/sql/011_photo_booth_scanner.sql). That
// row's claims show up on the staff admin page like anyone's, and switching it
// to inactive there stops the booth scanner at once. Everything here is fixed
// to PHOTO: whatever category a request names, food and merch are never claimed
// or listed, and nothing here can revert a claim.
export const BOOTH_STAFF_ID = "PHOTO-BOOTH";
const CATEGORY = "PHOTO";

/**
 * GET /api/booth/me
 * Checks the password and says who the claims are made as.
 */
export const boothMeController = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("event_staff")
      .select("iris_id, name, role, active")
      .eq("iris_id", BOOTH_STAFF_ID)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(500).json({ success: false, message: "The photo booth scanner is not set up yet" });
    }

    return res.status(200).json({
      success: true,
      staff: { irisId: data.iris_id, name: data.name || "Photo booth", role: data.role, active: data.active },
    });
  } catch (error) {
    console.error("boothMeController error:", error);
    return res.status(500).json({ success: false, message: "Failed to check the photo booth scanner" });
  }
};

/**
 * POST /api/booth/scan { token }
 */
export const boothScanController = async (req, res) => {
  const parsed = scanPassSchema.safeParse({ token: req.body?.token, category: CATEGORY });

  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid pass scan request" });
  }

  try {
    const result = await scanPass(parsed.data.token, BOOTH_STAFF_ID, CATEGORY);

    // Tokens are bearer secrets, so only the outcome is logged
    console.log(`[SCAN] ${result.result} by ${BOOTH_STAFF_ID}`);

    return res.status(200).json({ success: result.result === "OK", ...result });
  } catch (error) {
    console.error("boothScanController error:", error);
    return res.status(500).json({ success: false, message: "Failed to process pass scan" });
  }
};

/**
 * GET /api/booth/search?q=<name / reg no>
 */
export const boothSearchController = async (req, res) => {
  const parsed = searchPassesSchema.safeParse({ q: req.query.q, category: CATEGORY });

  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || "Invalid search" });
  }

  try {
    const passes = await searchPasses(parsed.data.q, CATEGORY);

    return res.status(200).json({ success: true, passes });
  } catch (error) {
    console.error("boothSearchController error:", error);
    return res.status(500).json({ success: false, message: "Failed to search passes" });
  }
};
