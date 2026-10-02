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

// Only same-site paths are allowed as a post-login destination
const safeRedirectPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/team-registration";

// A failed login sends the browser back to the site (not a raw JSON page),
// with ?login_error=<reason> so the page can tell the user to try again.
const redirectLoginFailure = (req, res, reason) => {
  const redirectTo = safeRedirectPath(req.cookies.iris_redirect_to);

  res.clearCookie("iris_oauth_state", getCookieOptions());
  res.clearCookie("iris_redirect_to", getCookieOptions());

  const separator = redirectTo.includes("?") ? "&" : "?";

  return res.redirect(
    `${process.env.FRONTEND_URL}${redirectTo}${separator}login_error=${reason}`
  );
};

export const irisLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");
  const redirectPath = safeRedirectPath(req.query.redirect);

  res.cookie("iris_oauth_state", state, getCookieOptions(10 * 60 * 1000));
  res.cookie("iris_redirect_to", redirectPath, getCookieOptions(10 * 60 * 1000));

  const url = getIrisAuthorizationUrl(state);

  res.redirect(url);
};

export const irisCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      // IRIS sends ?error=access_denied (and no code) when the user declines
      return redirectLoginFailure(req, res, "denied");
    }

    // Verify OAuth state
    if (
      !state ||
      !req.cookies.iris_oauth_state ||
      state !== req.cookies.iris_oauth_state
    ) {
      console.error("OAuth State Mismatch:", {
        hasStateCookie: Boolean(req.cookies.iris_oauth_state),
        hasRedirectCookie: Boolean(req.cookies.iris_redirect_to),
        hasSessionCookie: Boolean(req.cookies.session_id),
      });
      return redirectLoginFailure(req, res, "state");
    }

    res.clearCookie("iris_oauth_state", getCookieOptions());

    // Get IRIS profile
    const profile = await getIrisProfile(code);
    

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

    

    // Send session ID and user metadata cookies
    res.cookie("session_id", sessionId, getCookieOptions(24 * 60 * 60 * 1000));
    const encodedUser = Buffer.from(JSON.stringify(user)).toString("base64");
    res.cookie("user_meta", encodedUser, getCookieOptions(24 * 60 * 60 * 1000));

    const redirectTo = safeRedirectPath(req.cookies.iris_redirect_to);
    res.clearCookie("iris_redirect_to", getCookieOptions());

    const separator = redirectTo.includes("?") ? "&" : "?";
    return res.redirect(
      `${process.env.FRONTEND_URL}${redirectTo}${separator}t=${Date.now()}`
    );

  } catch (error) {
    console.error(
      "IRIS OAuth error:",
      error.response?.data || error.message
    );

    return redirectLoginFailure(req, res, "failed");
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