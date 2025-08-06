/**
 * Gestor de cache en memoria (fallback para Redis)
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  set(key, value, ttlSeconds = 3600) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
    return true;
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    return true;
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
    return true;
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}

// Instancia global de cache
const cache = new MemoryCache();

/**
 * Utilidades de cache
 */
export const cacheManager = {
  // Cache de tasas de cambio
  setExchangeRates: (rates, ttl = 3600) => {
    return cache.set('exchange_rates', rates, ttl);
  },

  getExchangeRates: () => {
    return cache.get('exchange_rates');
  },

  // Cache de productos por usuario
  setUserProducts: (userId, products, ttl = 1800) => {
    return cache.set(`products_${userId}`, products, ttl);
  },

  getUserProducts: (userId) => {
    return cache.get(`products_${userId}`);
  },

  invalidateUserProducts: (userId) => {
    return cache.delete(`products_${userId}`);
  },

  // Cache de estadísticas
  setUserStats: (userId, stats, ttl = 900) => {
    return cache.set(`stats_${userId}`, stats, ttl);
  },

  getUserStats: (userId) => {
    return cache.get(`stats_${userId}`);
  },

  // Cache genérico con prefijo
  set: (key, value, ttl = 3600) => {
    return cache.set(key, value, ttl);
  },

  get: (key) => {
    return cache.get(key);
  },

  delete: (key) => {
    return cache.delete(key);
  },

  // Limpiar cache por patrón
  deletePattern: (pattern) => {
    const keys = cache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => cache.delete(key));
    return keys.length;
  },

  // Estadísticas de cache
  getStats: () => {
    const keys = cache.keys();
    const now = Date.now();
    const expired = keys.filter(key => {
      const expiry = cache.ttl.get(key);
      return expiry && now > expiry;
    });

    return {
      totalKeys: keys.length,
      expiredKeys: expired.length,
      activeKeys: keys.length - expired.length,
      memoryUsage: process.memoryUsage()
    };
  }
};

/**
 * Middleware de cache para Express
 */
export const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `route_${req.originalUrl}_${req.user?.id || 'anonymous'}`;
    const cached = cacheManager.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Interceptar res.json para cachear respuesta
    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode === 200) {
        cacheManager.set(key, data, ttl);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};