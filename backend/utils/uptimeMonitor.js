// Uptime and health monitoring system
import { logInfo, logWarning, logError } from './logger.js';
import mongoose from 'mongoose';

class UptimeMonitor {
  constructor() {
    this.startTime = Date.now();
    this.healthChecks = new Map();
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: []
    };
  }

  // Get system health status
  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const memUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      uptime: Math.floor(uptime / 1000), // seconds
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      metrics: {
        totalRequests: this.metrics.requests,
        totalErrors: this.metrics.errors,
        errorRate: this.metrics.requests > 0 ? 
          ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%' : '0%',
        avgResponseTime: this.getAverageResponseTime()
      }
    };
  }

  // Add request metrics
  addRequest(responseTime, isError = false) {
    this.metrics.requests++;
    if (isError) this.metrics.errors++;
    
    this.metrics.responseTime.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  // Get average response time
  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.responseTime.length);
  }

  // Check database connectivity
  async checkDatabase() {
    try {
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', message: 'Database connection OK' };
    } catch (error) {
      logError('Database health check failed', error);
      return { status: 'unhealthy', message: error.message };
    }
  }

  // Check external services
  async checkExternalServices() {
    const services = [];
    
    // Check Exchange Rate API
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000
      });
      services.push({
        name: 'ExchangeRate API',
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - Date.now()
      });
    } catch (error) {
      services.push({
        name: 'ExchangeRate API',
        status: 'unhealthy',
        error: error.message
      });
    }

    return services;
  }

  // Comprehensive health check
  async performHealthCheck() {
    const health = this.getHealthStatus();
    const dbCheck = await this.checkDatabase();
    const servicesCheck = await this.checkExternalServices();
    
    const overallHealth = {
      ...health,
      database: dbCheck,
      externalServices: servicesCheck,
      overall: dbCheck.status === 'healthy' ? 'healthy' : 'degraded'
    };
    
    // Log health status
    if (overallHealth.overall === 'healthy') {
      logInfo('Health check passed', overallHealth);
    } else {
      logWarning('Health check issues detected', overallHealth);
    }
    
    return overallHealth;
  }

  // Start periodic health checks
  startHealthChecks() {
    // Health check every 5 minutes
    setInterval(async () => {
      await this.performHealthCheck();
    }, 300000);
    
    // Memory monitoring every minute
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      this.metrics.memoryUsage.push(memMB);
      
      // Keep only last 60 readings (1 hour)
      if (this.metrics.memoryUsage.length > 60) {
        this.metrics.memoryUsage.shift();
      }
      
      // Alert on high memory usage
      if (memMB > 500) { // 500MB threshold
        logWarning('High memory usage detected', {
          current: memMB,
          threshold: 500,
          unit: 'MB'
        });
      }
    }, 60000);
    
    logInfo('Uptime monitoring started');
  }

  // Get metrics summary
  getMetricsSummary() {
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? 
        ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) : 0,
      avgResponseTime: this.getAverageResponseTime(),
      memoryTrend: this.metrics.memoryUsage.slice(-10) // Last 10 readings
    };
  }
}

export default new UptimeMonitor();