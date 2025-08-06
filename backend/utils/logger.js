// Professional logging system with Winston
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config/environment.js';
import { sanitizeForLog, sanitizeError } from './sanitizer.js';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logs directory structure if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs');
}
if (!existsSync('logs/.audit')) {
  mkdirSync('logs/.audit');
}

// Configure transports
const transports = [];

// Error log file (only errors)
transports.push(
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat,
    auditFile: 'logs/.audit/error-audit.json'
  })
);

// Security events log
transports.push(
  new DailyRotateFile({
    filename: 'logs/security-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxSize: '10m',
    maxFiles: '90d',
    format: logFormat,
    auditFile: 'logs/.audit/security-audit.json'
  })
);

// API requests log
transports.push(
  new DailyRotateFile({
    filename: 'logs/api-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '50m',
    maxFiles: '7d',
    format: logFormat,
    auditFile: 'logs/.audit/api-audit.json'
  })
);

// Combined log file (all levels)
transports.push(
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '14d',
    format: logFormat,
    auditFile: 'logs/.audit/combined-audit.json'
  })
);

// Console transport for development
if (config.isDevelopment()) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.isProduction() ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'label-backend' },
  transports
});

// Enhanced logging methods
export const logError = (message, error = null, meta = {}) => {
  logger.error(sanitizeForLog(message), {
    error: error ? sanitizeError(error) : null,
    ...Object.fromEntries(
      Object.entries(meta).map(([key, value]) => [key, sanitizeForLog(value)])
    )
  });
};

export const logWarning = (message, meta = {}) => {
  logger.warn(sanitizeForLog(message), 
    Object.fromEntries(
      Object.entries(meta).map(([key, value]) => [key, sanitizeForLog(value)])
    )
  );
};

export const logInfo = (message, meta = {}) => {
  logger.info(sanitizeForLog(message), 
    Object.fromEntries(
      Object.entries(meta).map(([key, value]) => [key, sanitizeForLog(value)])
    )
  );
};

export const logDebug = (message, meta = {}) => {
  logger.debug(sanitizeForLog(message), 
    Object.fromEntries(
      Object.entries(meta).map(([key, value]) => [key, sanitizeForLog(value)])
    )
  );
};

// Security event logging
export const logSecurityEvent = (event, details = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    type: 'security',
    timestamp: new Date().toISOString(),
    ...details
  });
};

// API request logging
export const logApiRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id || 'anonymous'
  };
  
  if (res.statusCode >= 400) {
    logger.error('API Request Failed', logData);
  } else {
    logger.info('API Request', logData);
  }
};

// Specialized loggers
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  defaultMeta: { service: 'label-security' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '90d'
    })
  ]
});

export const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'label-api' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/api-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '7d'
    })
  ]
});

export const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'label-performance' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

export default logger;