import { authenticateTeam } from "../services/team-auth.service.js";
import {
  createSession,
  deleteSession,
} from "../services/session.service.js";
import { supabase } from "../config/supabase.js";

const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  ...(maxAge ? { maxAge } : {}),
});

export const teamLogin = async (req, res) => {
  try {
    const { teamName, password } = req.body;

    if (!teamName || !password) {
      return res.status(400).json({
        success: false,
        message: "Team name and password are required",
      });
    }

    const team = await authenticateTeam(teamName, password);

    if (!team) {
      return res.status(401).json({
        success: false,
        message: "Invalid team name or password",
      });
    }

    // Create a TEAM session
    const { sessionId } = await createSession(
      team.id,
      "team"
    );

    res.cookie("team_session_id", sessionId, getCookieOptions(24 * 60 * 60 * 1000));

    return res.json({
      success: true,
      message: "Team login successful",
      team: {
        id: team.id,
        teamName: team.teamName,
      },
    });
  } catch (error) {
    console.error("Team login error:", error);

    return res.status(500).json({
      success: false,
      message: "Team login failed",
    });
  }
};


export const getTeamMe = async (req, res) => {
  try {
    const { data: team, error } = await supabase
      .from("teams")
      .select("id, team_name, status")
      .eq("id", req.team.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.json({
      success: true,
      team: {
        id: team.id,
        teamName: team.team_name,
        status: team.status,
      },
    });
  } catch (error) {
    console.error("Get team error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get team",
    });
  }
};

export const teamLogout = async (req, res) => {
  try {
    const sessionId = req.cookies.team_session_id;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    res.clearCookie("team_session_id", getCookieOptions());

    return res.json({
      success: true,
      message: "Team logged out successfully",
    });
  } catch (error) {
    console.error("Team logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};