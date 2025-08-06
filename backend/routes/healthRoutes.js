// Health check and monitoring routes
import express from 'express';
import uptimeMonitor from '../utils/uptimeMonitor.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { healthRouteAuth, requireAuth } from '../middleware/authorizationMiddleware.js';

const router = express.Router();

// Basic health check
router.get('/health', healthRouteAuth, asyncHandler(async (req, res) => {
  const health = await uptimeMonitor.performHealthCheck();
  
  const statusCode = health.overall === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}));

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed metrics (protected in production)
router.get('/metrics', requireAuth, asyncHandler(async (req, res) => {
  
  const metrics = uptimeMonitor.getMetricsSummary();
  res.json(metrics);
}));

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', asyncHandler(async (req, res) => {
  const dbCheck = await uptimeMonitor.checkDatabase();
  
  if (dbCheck.status === 'healthy') {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: dbCheck.message });
  }
}));

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.json({ status: 'alive', uptime: process.uptime() });
});

export default router;