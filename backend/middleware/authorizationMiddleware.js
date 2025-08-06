import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { logSecurityEvent } from '../utils/logger.js';

/**
 * Middleware de autorización básica
 */
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurityEvent('Unauthorized access attempt', {
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    
    req.user = decoded;
    next();
  } catch (error) {
    logSecurityEvent('Invalid token used', {
      ip: req.ip,
      url: req.originalUrl,
      error: error.message
    });
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

/**
 * Middleware para rutas que requieren roles específicos
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      logSecurityEvent('Insufficient permissions', {
        userId: req.user.id,
        userRole,
        requiredRoles: allowedRoles,
        url: req.originalUrl
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Permisos insuficientes' 
      });
    }

    next();
  };
};

/**
 * Middleware para rutas administrativas
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware para rutas de salud (solo en desarrollo o con token válido)
 */
export const healthRouteAuth = (req, res, next) => {
  // En desarrollo, permitir acceso sin autenticación
  if (config.isDevelopment()) {
    return next();
  }
  
  // En producción, requerir autenticación
  return requireAuth(req, res, next);
};