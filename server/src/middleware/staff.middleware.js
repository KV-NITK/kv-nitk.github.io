import { supabase } from "../config/supabase.js";

/**
 * Middleware to restrict route access to active event staff (VOLUNTEER, ADMIN).
 * Pre-condition: requireAuth middleware has already run and attached req.user.
 */
export const requireStaff = async (req, res, next) => {
  try {
    const userIrisId = req.user?.irisId;

    if (!userIrisId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { data: staff, error } = await supabase
      .from("event_staff")
      .select("iris_id, role, active")
      .eq("iris_id", userIrisId)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("Staff authorization lookup error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify staff permissions",
      });
    }

    if (!staff) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Active event staff permissions required",
      });
    }

    req.staff = staff;
    next();
  } catch (error) {
    console.error("Staff middleware unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};
