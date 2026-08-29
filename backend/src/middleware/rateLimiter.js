const rateStore = new Map();

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateStore.entries()) {
    if (now > record.resetTime) {
      rateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 10; // 10 requests default
  const message = options.message || 'Too many requests from this IP. Please try again later.';

  return (req, res, next) => {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
    const key = `${req.baseUrl}${req.path}:${clientIp}`;
    const now = Date.now();

    if (!rateStore.has(key)) {
      rateStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateStore.get(key);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: retryAfterSeconds
      });
    }

    next();
  };
};

const loginLimiter = (req, res, next) => next();

const registerLimiter = (req, res, next) => next();

const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Rate limit exceeded. Please slow down your requests.'
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  generalLimiter
};
