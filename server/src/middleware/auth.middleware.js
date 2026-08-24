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

    let userData = session.user_data;

    if (!userData && req.cookies.user_meta) {
      try {
        userData = JSON.parse(
          Buffer.from(req.cookies.user_meta, "base64").toString("utf-8")
        );
      } catch (e) {
        console.error("Failed to parse user_meta cookie:", e);
      }
    }

    userData = userData || {};

    req.user = {
      irisId: session.user_id,
      name: userData.name || session.name || "",
      email: userData.email || session.email || "",
      rollNo: userData.rollNo || session.roll_no || "",
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
    });
  }
};