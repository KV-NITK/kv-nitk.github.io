import { getSession } from "../services/session.service.js";

export const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    req.user = {
      irisId: session.user_id,
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