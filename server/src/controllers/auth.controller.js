import crypto from "crypto";
import {
  createSession,
  deleteSession,
} from "../services/session.service.js";

import {
  getIrisAuthorizationUrl,
  getIrisProfile,
} from "../services/iris.service.js";

const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  ...(maxAge ? { maxAge } : {}),
});

export const irisLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("iris_oauth_state", state, getCookieOptions(10 * 60 * 1000));

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
      console.error("OAuth State Mismatch:", {
        queryState: state,
        cookieState: req.cookies.iris_oauth_state,
        cookies: req.cookies,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    res.clearCookie("iris_oauth_state", getCookieOptions());

    // Get IRIS profile
    const profile = await getIrisProfile(code);
    console.log("IRIS Profile received successfully:", profile);

    const userProfile = profile.user || profile;
    const user = {
      irisId: String(userProfile.reg_no || userProfile.id || userProfile.roll_no || "unknown"),
      name: `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() || userProfile.name || "IRIS Student",
      email: userProfile.email || "",
      rollNo: userProfile.roll_no || "",
      regNo: String(userProfile.reg_no || ""),
    };

    // Create YOUR application's session with profile info
    const { sessionId } = await createSession(
      user.irisId,
      "user",
      user
    );

    console.log("Created session for user:", user.email, "Session ID:", sessionId);

    // Send session ID and user metadata cookies
    res.cookie("session_id", sessionId, getCookieOptions(24 * 60 * 60 * 1000));
    const encodedUser = Buffer.from(JSON.stringify(user)).toString("base64");
    res.cookie("user_meta", encodedUser, getCookieOptions(24 * 60 * 60 * 1000));

    return res.redirect(
      `${process.env.FRONTEND_URL}/team-registration?t=${Date.now()}`
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

    res.clearCookie("session_id", getCookieOptions());
    res.clearCookie("user_meta", getCookieOptions());

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