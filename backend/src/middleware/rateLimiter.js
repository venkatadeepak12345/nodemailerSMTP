const ipRequests = new Map();

// Clean up expired rate limiting entries every 10 minutes to save memory
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now > data.resetTime) {
      ipRequests.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Custom Rate Limiter Middleware
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} maxRequests - Max number of requests allowed within the window
 */
module.exports = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    // Bypass rate limiting during local development testing
    return next();

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const data = ipRequests.get(ip);

    // If window has passed, reset the counter
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Increment count
    data.count += 1;

    // Check rate limit
    if (data.count > maxRequests) {
      const remainingSeconds = Math.ceil((data.resetTime - now) / 1000);
      return res.status(429).json({
        error: `Too many requests from this IP address. Please try again in ${remainingSeconds} seconds.`
      });
    }

    next();
  };
};
