// A fixed-window allowance per key (a client address, say), kept in memory.
// take(key, amount) spends up to `amount` and returns how much was allowed,
// so a batch can be cut short instead of refused outright.
export const createAllowance = ({ limit, windowMs }) => {
  const windows = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, w] of windows) if (now > w.resetAt) windows.delete(key);
  }, windowMs).unref();

  const take = (key, amount = 1) => {
    const now = Date.now();
    let w = windows.get(key);

    if (!w || now > w.resetAt) {
      w = { used: 0, resetAt: now + windowMs };
      windows.set(key, w);
    }

    const allowed = Math.max(0, Math.min(amount, limit - w.used));
    w.used += allowed;
    return allowed;
  };

  return { take };
};

// Middleware: at most `limit` requests per client address per window.
// trust proxy is set in app.js, so req.ip is the visitor and not nginx.
export const limitRequests = ({ limit, windowMs, message = "Too many requests. Please slow down." }) => {
  const allowance = createAllowance({ limit, windowMs });

  return (req, res, next) => {
    if (allowance.take(req.ip) === 0) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};
