import crypto from "crypto";

// Same idea as adminAuth.middleware.js, but with its own password
// (STAFF_ADMIN_PASSCODE) and its own wrong-guess counter. Knowing the orders
// password does not open this: this page can make someone an admin.
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map();

const hash = (value) => crypto.createHash("sha256").update(String(value)).digest();

const passcodeMatches = (provided, expected) =>
  crypto.timingSafeEqual(hash(provided), hash(expected));

export const requireStaffAdminPasscode = (req, res, next) => {
  const expected = process.env.STAFF_ADMIN_PASSCODE;

  if (!expected) {
    console.error("STAFF_ADMIN_PASSCODE is not configured");

    return res.status(500).json({
      success: false,
      message: "Staff admin access is not configured",
    });
  }

  const now = Date.now();
  const record = failures.get(req.ip);

  if (record && now > record.resetAt) {
    failures.delete(req.ip);
  }

  const current = failures.get(req.ip);

  if (current && current.count >= MAX_FAILURES) {
    return res.status(429).json({
      success: false,
      message: "Too many wrong passwords. Try again in a few minutes.",
    });
  }

  const provided = req.headers["x-staff-admin-passcode"];

  if (typeof provided !== "string" || !passcodeMatches(provided, expected)) {
    failures.set(req.ip, {
      count: (current?.count ?? 0) + 1,
      resetAt: current?.resetAt ?? now + WINDOW_MS,
    });

    return res.status(401).json({
      success: false,
      message: "Wrong password",
    });
  }

  failures.delete(req.ip);
  next();
};
