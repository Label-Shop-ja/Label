// Frontend environment configuration
export const config = {
  // Environment
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Label',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Herramienta de Gestión Empresarial',
  
  // Analytics
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // Helper methods
  isProduction: () => import.meta.env.VITE_APP_ENV === 'production',
  isDevelopment: () => import.meta.env.VITE_APP_ENV !== 'production',
  
  // Get full API endpoint
  getApiEndpoint: (path) => `${config.API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
};

// Validate required environment variables
export const validateEnvironment = () => {
  const required = ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required frontend environment variables are present');
  return true;
};

export default config;