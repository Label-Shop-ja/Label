// Performance monitoring hook
import { useEffect, useRef } from 'react';
import { trackEvent } from '../utils/analytics';

export const usePerformanceMonitor = (componentName) => {
  const startTime = useRef(Date.now());
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Track component mount time
      const mountTime = Date.now() - startTime.current;
      
      if (mountTime > 1000) { // Only track slow components
        trackEvent('slow_component_mount', 'performance', componentName, mountTime);
      }
      
      // Track Web Vitals if available
      if ('web-vitals' in window) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS((metric) => trackEvent('CLS', 'web_vitals', componentName, metric.value));
          getFID((metric) => trackEvent('FID', 'web_vitals', componentName, metric.value));
          getFCP((metric) => trackEvent('FCP', 'web_vitals', componentName, metric.value));
          getLCP((metric) => trackEvent('LCP', 'web_vitals', componentName, metric.value));
          getTTFB((metric) => trackEvent('TTFB', 'web_vitals', componentName, metric.value));
        });
      }
    }

    return () => {
      // Track component unmount
      const totalTime = Date.now() - startTime.current;
      if (totalTime > 30000) { // Track long-lived components
        trackEvent('long_component_session', 'performance', componentName, totalTime);
      }
    };
  }, [componentName]);
};

// Hook for API call monitoring
export const useApiMonitor = () => {
  const trackApiCall = (endpoint, method, duration, status) => {
    trackEvent('api_call', 'performance', `${method} ${endpoint}`, duration);
    
    if (status >= 400) {
      trackEvent('api_error', 'errors', `${method} ${endpoint}`, status);
    }
    
    if (duration > 5000) {
      trackEvent('slow_api_call', 'performance', `${method} ${endpoint}`, duration);
    }
  };

  return { trackApiCall };
};