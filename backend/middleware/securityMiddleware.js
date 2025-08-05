// Security middleware configuration
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { config } from '../config/environment.js';

// Rate limiting configuration
export const createRateLimit = () => {
  return rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes default
    max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000 / 60) // minutes
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    // Skip rate limiting in development for easier testing
    skip: (req) => config.isDevelopment() && req.ip === '::1'
  });
};

// Helmet security headers configuration
export const createHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", config.FRONTEND_URL],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for OAuth
  });
};

// MongoDB injection protection
export const mongoSanitizer = mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
});

// Additional security middleware
export const additionalSecurity = (req, res, next) => {
  // Remove X-Powered-By header (already handled by helmet, but double-check)
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Request-ID', req.id || Date.now().toString());
  
  next();
};