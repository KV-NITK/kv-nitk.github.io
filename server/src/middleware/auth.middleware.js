import { getSession } from "../services/session.service.js";

export const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;

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