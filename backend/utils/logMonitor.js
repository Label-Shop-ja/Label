// Advanced log monitoring and alerting system
import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { logError, logWarning, logInfo } from './logger.js';

class LogMonitor {
  constructor() {
    this.alertThresholds = {
      errorRate: 10, // errors per minute
      securityEvents: 5, // security events per hour
      diskUsage: 1000, // MB
      responseTime: 5000 // ms
    };
    
    this.metrics = {
      errors: [],
      securityEvents: [],
      apiRequests: [],
      performance: []
    };
  }

  // Monitor error rate
  checkErrorRate() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Count recent errors
    const recentErrors = this.metrics.errors.filter(
      error => error.timestamp > oneMinuteAgo
    );
    
    if (recentErrors.length > this.alertThresholds.errorRate) {
      this.sendAlert('HIGH_ERROR_RATE', {
        count: recentErrors.length,
        threshold: this.alertThresholds.errorRate,
        timeframe: '1 minute'
      });
    }
    
    // Clean old metrics
    this.metrics.errors = this.metrics.errors.filter(
      error => error.timestamp > oneMinuteAgo
    );
  }

  // Monitor security events
  checkSecurityEvents() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    const recentEvents = this.metrics.securityEvents.filter(
      event => event.timestamp > oneHourAgo
    );
    
    if (recentEvents.length > this.alertThresholds.securityEvents) {
      this.sendAlert('HIGH_SECURITY_ACTIVITY', {
        count: recentEvents.length,
        threshold: this.alertThresholds.securityEvents,
        timeframe: '1 hour',
        events: recentEvents.slice(-5) // Last 5 events
      });
    }
    
    this.metrics.securityEvents = this.metrics.securityEvents.filter(
      event => event.timestamp > oneHourAgo
    );
  }

  // Monitor disk usage
  checkDiskUsage() {
    const logsPath = resolve('logs');
    
    if (!existsSync(logsPath)) return;
    
    let totalSize = 0;
    const files = readdirSync(logsPath, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile()) {
        const filePath = resolve(logsPath, file.name);
        totalSize += statSync(filePath).size;
      }
    }
    
    const sizeInMB = totalSize / 1024 / 1024;
    
    if (sizeInMB > this.alertThresholds.diskUsage) {
      this.sendAlert('HIGH_DISK_USAGE', {
        currentSize: sizeInMB.toFixed(2),
        threshold: this.alertThresholds.diskUsage,
        unit: 'MB'
      });
    }
  }

  // Monitor API performance
  checkApiPerformance() {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000;
    
    const recentRequests = this.metrics.apiRequests.filter(
      req => req.timestamp > fiveMinutesAgo
    );
    
    if (recentRequests.length === 0) return;
    
    const avgResponseTime = recentRequests.reduce(
      (sum, req) => sum + req.responseTime, 0
    ) / recentRequests.length;
    
    if (avgResponseTime > this.alertThresholds.responseTime) {
      this.sendAlert('SLOW_API_PERFORMANCE', {
        averageResponseTime: avgResponseTime.toFixed(2),
        threshold: this.alertThresholds.responseTime,
        requestCount: recentRequests.length,
        timeframe: '5 minutes'
      });
    }
    
    this.metrics.apiRequests = this.metrics.apiRequests.filter(
      req => req.timestamp > fiveMinutesAgo
    );
  }

  // Add metrics
  addError(error) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack
    });
  }

  addSecurityEvent(event) {
    this.metrics.securityEvents.push({
      timestamp: Date.now(),
      type: event.type,
      ip: event.ip,
      details: event.details
    });
  }

  addApiRequest(request) {
    this.metrics.apiRequests.push({
      timestamp: Date.now(),
      method: request.method,
      url: request.url,
      responseTime: request.responseTime,
      statusCode: request.statusCode
    });
  }

  // Send alert
  sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data,
      severity: this.getAlertSeverity(type)
    };
    
    logWarning(`ALERT: ${type}`, alert);
    
    // In production, you could send to external monitoring services
    // like Slack, Discord, email, or monitoring platforms
    console.log(`🚨 ALERT: ${type}`, JSON.stringify(data, null, 2));
  }

  // Get alert severity
  getAlertSeverity(type) {
    const severityMap = {
      HIGH_ERROR_RATE: 'critical',
      HIGH_SECURITY_ACTIVITY: 'high',
      HIGH_DISK_USAGE: 'medium',
      SLOW_API_PERFORMANCE: 'medium'
    };
    
    return severityMap[type] || 'low';
  }

  // Generate log summary
  generateSummary() {
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    
    const summary = {
      timestamp: new Date().toISOString(),
      period: '24 hours',
      metrics: {
        totalErrors: this.metrics.errors.filter(e => e.timestamp > oneDayAgo).length,
        securityEvents: this.metrics.securityEvents.filter(e => e.timestamp > oneDayAgo).length,
        apiRequests: this.metrics.apiRequests.filter(r => r.timestamp > oneDayAgo).length
      }
    };
    
    logInfo('Daily log summary', summary);
    return summary;
  }

  // Start monitoring
  startMonitoring() {
    logInfo('Log monitoring started');
    
    // Check every minute
    setInterval(() => {
      this.checkErrorRate();
      this.checkApiPerformance();
    }, 60000);
    
    // Check every 5 minutes
    setInterval(() => {
      this.checkSecurityEvents();
      this.checkDiskUsage();
    }, 300000);
    
    // Generate daily summary
    setInterval(() => {
      this.generateSummary();
    }, 86400000);
  }
}

export default new LogMonitor();