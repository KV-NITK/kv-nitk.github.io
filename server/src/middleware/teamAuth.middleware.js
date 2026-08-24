import { getSession } from "../services/session.service.js";

export const requireTeamAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.team_session_id;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Team authentication required",
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Team session expired or invalid",
      });
    }

    if (session.session_type !== "team") {
      return res.status(401).json({
        success: false,
        message: "Invalid team session",
      });
    }

    req.team = {
      id: session.user_id,
    };

    next();
  } catch (error) {
    console.error("Team auth error:", error);

    return res.status(500).json({
      success: false,
      message: "Team authentication check failed",
    });
  }
};