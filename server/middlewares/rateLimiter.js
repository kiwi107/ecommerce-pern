// createRateLimiter.js
const rateLimitMap = new Map();

const RateLimiter = (maxAttempts, windowMs) => (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - entry.startTime > windowMs) {
        entry.count = 1;
        entry.startTime = now;
    } else {
        entry.count++;
    }

    if (entry.count > maxAttempts) {
        return res.status(429).json({
            error: `Too many requests. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
        });
    }

    rateLimitMap.set(ip, entry);
    next();
};

module.exports = RateLimiter;
