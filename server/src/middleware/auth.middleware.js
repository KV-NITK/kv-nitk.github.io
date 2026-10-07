import { getSession } from "../services/session.service.js";
import { supabase } from "../config/supabase.js";

// In-memory cache for authorized event staff to avoid repeated DB lookups
const staffCache = new Map(); // irisId -> { staff, expiresAt }
const STAFF_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const clearStaffCache = (irisId) => {
  if (irisId) {
    staffCache.delete(irisId);
  } else {
    staffCache.clear();
  }
};

/**
 * Middleware to restrict route access to active event staff (VOLUNTEER, ADMIN).
 * Uses in-memory Map cache to avoid repeated Supabase queries during active scanning.
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

    // Check in-memory cache
    const cached = staffCache.get(userIrisId);
    if (cached && cached.expiresAt > Date.now()) {
      req.staff = cached.staff;
      return next();
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
      staffCache.delete(userIrisId);
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Active event staff permissions required",
      });
    }

    // Cache valid staff record
    staffCache.set(userIrisId, {
      staff,
      expiresAt: Date.now() + STAFF_CACHE_TTL_MS,
    });

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

export const requireAuth = async (req, res, next) => {
  try {
    const sessionId =
      req.cookies?.session_id ||
      req.headers?.["x-session-id"] ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7).trim()
        : null);

    if (!sessionId) {
      console.warn("requireAuth: No session_id cookie found in request cookies");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      console.warn("requireAuth: Session expired or not found in Supabase for sessionId:", sessionId);
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    // Profile comes from our own session row only. The user_meta cookie is
    // editable by the user, so it is never trusted for identity or payment details.
    const userData = session.user_data || {};

    req.user = {
      irisId: session.user_id,
      name: userData.name || session.name || "",
      email: userData.email || session.email || "",
      rollNo: userData.rollNo || session.roll_no || "",
    };

    // A session with no profile (made before profiles were stored, or whose
    // in-memory profile was lost on a restart) is as good as logged out: the
    // user has to sign in with IRIS again to get a name on it.
    if (!req.user.name) {
      return res.status(401).json({
        success: false,
        message: "Please log in with IRIS again",
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
    });
  }
};