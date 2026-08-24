import crypto from "crypto";
import {
  createSession,
  deleteSession,
} from "../services/session.service.js";

import {
  getIrisAuthorizationUrl,
  getIrisProfile,
} from "../services/iris.service.js";

export const irisLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("iris_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });

  const url = getIrisAuthorizationUrl(state);

  res.redirect(url);
};

export const irisCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    // Verify OAuth state
    if (
      !state ||
      !req.cookies.iris_oauth_state ||
      state !== req.cookies.iris_oauth_state
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    res.clearCookie("iris_oauth_state");

    // Get IRIS profile
    const profile = await getIrisProfile(code);

    const user = {
      irisId: String(profile.reg_no),
      name: `${profile.first_name} ${profile.last_name}`.trim(),
      email: profile.email,
      rollNo: profile.roll_no,
    };

    // Create YOUR application's session
    const { sessionId } = await createSession(
  user.irisId,
  "user"
);

    // Send session ID as HTTP-only cookie
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/team-registration`
    );

  } catch (error) {
    console.error(
      "IRIS OAuth error:",
      error.response?.data || error.message
    );

    return res.status(401).json({
      success: false,
      message: "IRIS authentication failed",
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies.session_id;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    res.clearCookie("session_id", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};