import crypto from "crypto";

// Wrong guesses per client address, so the password cannot be brute-forced.
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map();

const hash = (value) => crypto.createHash("sha256").update(String(value)).digest();

const passcodeMatches = (provided, expected) =>
  crypto.timingSafeEqual(hash(provided), hash(expected));

// The admin pages send the password in the x-admin-passcode header. It is checked
// here, never in the browser: the pages only show what this lets through.
export const requireAdminPasscode = (req, res, next) => {
  const expected = process.env.ADMIN_PASSCODE;

  if (!expected) {
    console.error("ADMIN_PASSCODE is not configured");

    return res.status(500).json({
      success: false,
      message: "Admin access is not configured",
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

  const provided = req.headers["x-admin-passcode"];

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
