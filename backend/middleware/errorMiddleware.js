// Professional error handling middleware
import { logError, logSecurityEvent } from '../utils/logger.js';
import { config } from '../config/environment.js';
import logMonitor from '../utils/logMonitor.js';

// Enhanced 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  
  // Log 404 errors for monitoring
  logError('404 Not Found', error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404);
  next(error);
};

// Professional error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Generate error ID for tracking
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Enhanced error logging
  const errorDetails = {
    errorId,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params
  };
  
  // Log different error types appropriately
  if (statusCode >= 500) {
    logError('Server Error', err, errorDetails);
    logMonitor.addError(err);
  } else if (statusCode === 401 || statusCode === 403) {
    logSecurityEvent('Authentication/Authorization Error', {
      ...errorDetails,
      message: err.message
    });
    logMonitor.addSecurityEvent({
      type: 'AUTH_ERROR',
      ip: req.ip,
      details: { statusCode, message: err.message }
    });
  } else {
    logError('Client Error', err, errorDetails);
  }
  
  // Prepare response
  const response = {
    success: false,
    message: err.message || 'An error occurred',
    errorId,
    timestamp: new Date().toISOString()
  };
  
  // Add stack trace in development
  if (config.isDevelopment()) {
    response.stack = err.stack;
    response.details = errorDetails;
  }
  
  // Add specific error handling for common cases
  if (err.name === 'ValidationError') {
    response.message = 'Validation failed';
    response.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  if (err.name === 'CastError') {
    response.message = 'Invalid ID format';
  }
  
  if (err.code === 11000) {
    response.message = 'Duplicate field value';
    response.field = Object.keys(err.keyValue)[0];
  }
  
  res.status(statusCode).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { notFound, errorHandler, asyncHandler };