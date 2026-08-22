import { rateLimit } from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, code: 'OTP_RATE_LIMITED', message: 'Too many OTP requests. Please try again later.' },
});

export const newsletterRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, code: 'NEWSLETTER_RATE_LIMITED', message: 'Too many subscription attempts. Please try again later.' },
});
