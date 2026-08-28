import { getSession } from "../services/session.service.js";
import { getUserTeam } from "../services/team.service.js";

export const requireTeamAuth = async (req, res, next) => {
  try {
    // 1. Check for team_session_id cookie
    const teamSessionId = req.cookies.team_session_id;

    if (teamSessionId) {
      const teamSession = await getSession(teamSessionId);
      if (teamSession && teamSession.session_type === "team") {
        req.team = {
          id: teamSession.user_id,
        };
        return next();
      }
    }

    // 2. Fallback: Check for IRIS user session_id cookie
    const userSessionId = req.cookies.session_id;

    if (userSessionId) {
      const userSession = await getSession(userSessionId);

      if (userSession) {
        let userData = userSession.user_data;

        if (!userData && req.cookies.user_meta) {
          try {
            userData = JSON.parse(
              Buffer.from(req.cookies.user_meta, "base64").toString("utf-8")
            );
          } catch (e) {
            // ignore JSON parse error
          }
        }

        userData = userData || {};

        const user = {
          irisId: userSession.user_id,
          name: userData.name || userSession.name || "",
          email: userData.email || userSession.email || "",
          rollNo: userData.rollNo || userSession.roll_no || "",
        };

        const userTeam = await getUserTeam(user);

        if (userTeam && userTeam.id) {
          req.team = {
            id: userTeam.id,
          };

          // Issue team_session_id cookie so subsequent calls hit team session directly
          try {
            const { sessionId: newTeamSessionId } = await createSession(userTeam.id, "team");
            res.cookie("team_session_id", newTeamSessionId, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 24 * 60 * 60 * 1000,
            });
          } catch (e) {
            console.error("Failed to create team session cookie during fallback:", e);
          }

          return next();
        }
      }
    }

    return res.status(401).json({
      success: false,
      message: "Team authentication required",
    });
  } catch (error) {
    console.error("Team auth error:", error);

    return res.status(500).json({
      success: false,
      message: "Team authentication check failed",
    });
  }
};