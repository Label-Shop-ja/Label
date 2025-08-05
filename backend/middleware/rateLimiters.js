// Specific rate limiters for different endpoints
import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction() ? 5 : 50, // 5 attempts in production, 50 in development
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction() ? 100 : 1000, // 100 requests in production, 1000 in development
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.isProduction() ? 20 : 100, // 20 uploads per hour in production
  message: {
    error: 'Upload limit exceeded, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again in an hour.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});