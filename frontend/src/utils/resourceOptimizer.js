// Resource optimization utilities
import { trackEvent } from './analytics';

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    { href: '/api/auth/me', as: 'fetch' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.as === 'font') link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  });
};

// Prefetch next likely resources
export const prefetchResources = (routes = []) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }
};

// Optimize images for different screen sizes
export const getOptimizedImageUrl = (url, width = 'auto', quality = 'auto') => {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }

  const transformations = [
    'f_auto', // Auto format
    `q_${quality}`, // Quality
    width !== 'auto' ? `w_${width}` : 'w_auto', // Width
    'c_scale', // Scale mode
    'dpr_auto' // Auto DPR
  ].join(',');

  return url.replace('/upload/', `/upload/${transformations}/`);
};

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Measure and track performance
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const duration = performance.now() - start;
    
    if (duration > 100) { // Only track slow operations
      trackEvent('slow_operation', 'performance', name, Math.round(duration));
    }
    
    return result;
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check connection quality
export const getConnectionQuality = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Adaptive loading based on connection
export const shouldLoadHighQuality = () => {
  const connection = getConnectionQuality();
  
  if (!connection) return true; // Default to high quality
  
  // Don't load high quality on slow connections or data saver mode
  if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return false;
  }
  
  return true;
};