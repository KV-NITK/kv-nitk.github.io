import crypto from "crypto";

// Wrong guesses per client address, so the password cannot be brute-forced.
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;

const hash = (value) => crypto.createHash("sha256").update(String(value)).digest();

const passcodeMatches = (provided, expected) =>
  crypto.timingSafeEqual(hash(provided), hash(expected));

// A guard that checks the password in `header` against the `envVar` env var. It is
// checked here, never in the browser: the pages only show what this lets through.
// Each guard keeps its own wrong-guess counter.
const makePasscodeGuard = ({ envVar, header, label }) => {
  const failures = new Map();

  return (req, res, next) => {
    const expected = process.env[envVar];

    if (!expected) {
      console.error(`${envVar} is not configured`);

      return res.status(500).json({
        success: false,
        message: `${label} access is not configured`,
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

    const provided = req.headers[header];

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
};

// The orders and analytics admin pages
export const requireAdminPasscode = makePasscodeGuard({
  envVar: "ADMIN_PASSCODE",
  header: "x-admin-passcode",
  label: "Admin",
});

// The staff admin page has its own password: knowing the orders one does not
// open it, because this page can make someone an admin.
export const requireStaffAdminPasscode = makePasscodeGuard({
  envVar: "STAFF_ADMIN_PASSCODE",
  header: "x-staff-admin-passcode",
  label: "Staff admin",
});

// The photo booth's scanner (/parva-26/photobooth/scan). The booth is run by
// someone with no IRIS login, so this password stands in for one; what it
// opens can only claim photo booth passes.
export const requireBoothPasscode = makePasscodeGuard({
  envVar: "PHOTO_BOOTH_PASSCODE",
  header: "x-booth-passcode",
  label: "Photo booth",
});
