/**
 * Monitor de performance del frontend
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      this.observeWebVitals();
      this.observeNavigation();
      this.observeResources();
    }
  }

  // Observar Web Vitals
  observeWebVitals() {
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.recordMetric.bind(this));
        getFID(this.recordMetric.bind(this));
        getFCP(this.recordMetric.bind(this));
        getLCP(this.recordMetric.bind(this));
        getTTFB(this.recordMetric.bind(this));
      });
    }
  }

  // Observar navegación
  observeNavigation() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric({
              name: 'navigation',
              value: entry.loadEventEnd - entry.fetchStart,
              entries: [entry]
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  // Observar recursos
  observeResources() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 1000) { // Solo recursos lentos
            this.recordMetric({
              name: 'slow-resource',
              value: entry.duration,
              resource: entry.name,
              entries: [entry]
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  // Registrar métrica
  recordMetric(metric) {
    const timestamp = Date.now();
    const key = `${metric.name}_${timestamp}`;
    
    this.metrics.set(key, {
      ...metric,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Enviar a analytics si está disponible
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        custom_parameter: metric.resource || 'general'
      });
    }

    // Limpiar métricas antiguas (mantener solo últimas 100)
    if (this.metrics.size > 100) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }
  }

  // Medir tiempo de componente
  measureComponent(componentName) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric({
          name: 'component-render',
          value: duration,
          component: componentName
        });
        return duration;
      }
    };
  }

  // Medir tiempo de API
  measureApiCall(endpoint) {
    const startTime = performance.now();
    
    return {
      end: (success = true) => {
        const duration = performance.now() - startTime;
        this.recordMetric({
          name: 'api-call',
          value: duration,
          endpoint,
          success
        });
        return duration;
      }
    };
  }

  // Obtener resumen de métricas
  getMetricsSummary() {
    const metrics = Array.from(this.metrics.values());
    
    const summary = {
      totalMetrics: metrics.length,
      webVitals: {},
      apiCalls: [],
      componentRenders: [],
      slowResources: []
    };

    metrics.forEach(metric => {
      switch (metric.name) {
        case 'CLS':
        case 'FID':
        case 'FCP':
        case 'LCP':
        case 'TTFB':
          summary.webVitals[metric.name] = metric.value;
          break;
        case 'api-call':
          summary.apiCalls.push({
            endpoint: metric.endpoint,
            duration: metric.value,
            success: metric.success
          });
          break;
        case 'component-render':
          summary.componentRenders.push({
            component: metric.component,
            duration: metric.value
          });
          break;
        case 'slow-resource':
          summary.slowResources.push({
            resource: metric.resource,
            duration: metric.value
          });
          break;
      }
    });

    return summary;
  }

  // Limpiar observadores
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Instancia global
export const performanceMonitor = new PerformanceMonitor();

// Hook para React
export const usePerformanceMonitor = () => {
  return {
    measureComponent: performanceMonitor.measureComponent.bind(performanceMonitor),
    measureApiCall: performanceMonitor.measureApiCall.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetricsSummary.bind(performanceMonitor)
  };
};