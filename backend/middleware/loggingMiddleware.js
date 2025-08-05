// Request logging middleware
import { logApiRequest, logSecurityEvent, apiLogger } from '../utils/logger.js';
import logMonitor from '../utils/logMonitor.js';
import uptimeMonitor from '../utils/uptimeMonitor.js';

// Enhanced request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log to API logger
    apiLogger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || 'anonymous'
    });
    
    // Add to monitors
    logMonitor.addApiRequest({
      method: req.method,
      url: req.originalUrl,
      responseTime,
      statusCode: res.statusCode
    });
    
    uptimeMonitor.addRequest(responseTime, res.statusCode >= 400);
    
    // Legacy logging
    logApiRequest(req, res, responseTime);
    originalSend.call(this, data);
  };
  
  next();
};

// Enhanced security event middleware
export const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    { pattern: /\.\.\//,  type: 'PATH_TRAVERSAL' },
    { pattern: /<script/i, type: 'XSS_ATTEMPT' },
    { pattern: /union.*select/i, type: 'SQL_INJECTION' },
    { pattern: /\$where/i, type: 'NOSQL_INJECTION' },
    { pattern: /eval\(/i, type: 'CODE_INJECTION' }
  ];
  
  const requestData = JSON.stringify(req.body) + req.originalUrl + JSON.stringify(req.query);
  
  for (const { pattern, type } of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      const securityEvent = {
        type,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        pattern: pattern.toString(),
        timestamp: new Date().toISOString()
      };
      
      logSecurityEvent('Suspicious request detected', securityEvent);
      
      logMonitor.addSecurityEvent({
        type,
        ip: req.ip,
        details: securityEvent
      });
      
      break;
    }
  }
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  // This will be handled by the main error handler
  // but we can add specific logging here if needed
  next(err);
};