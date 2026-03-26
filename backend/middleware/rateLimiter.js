const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    res
      .status(429)
      .json({ msg: 'Too many login attempts. Please try again later.' });
  },
  skip: (req) => {
    // Skip rate limiting for non-POST requests
    return req.method !== 'POST';
  },
});

// Rate limiting for registration - 3 attempts per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts
  message: 'Too many registration attempts. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json({ msg: 'Too many registration attempts. Please try again later.' });
  },
  skip: (req) => {
    return req.method !== 'POST';
  },
});

// General API rate limiting - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  generalLimiter,
};
