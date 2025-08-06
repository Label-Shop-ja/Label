// Sentry configuration for error tracking
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { sanitizeForLog, sanitizeAnalyticsData } from './sanitizer.js';

export const initSentry = () => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
      ],
      tracesSampleRate: 0.1, // 10% of transactions
      environment: import.meta.env.VITE_APP_ENV,
      beforeSend(event) {
        // Filter out development errors
        if (event.exception) {
          const error = event.exception.values[0];
          if (error?.value?.includes('ChunkLoadError')) {
            return null; // Don't send chunk load errors
          }
        }
        return event;
      },
    });
  }
};

export const captureError = (error, context = {}) => {
  const sanitizedContext = sanitizeAnalyticsData(context);
  
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.captureException(error, { extra: sanitizedContext });
  } else {
    console.error('Error captured:', error, sanitizedContext);
  }
};

export const captureMessage = (message, level = 'info') => {
  const sanitizedMessage = sanitizeForLog(message);
  
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.captureMessage(sanitizedMessage, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${sanitizedMessage}`);
  }
};