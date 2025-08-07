// Environment configuration handler
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const loadEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    dotenv.config({ path: '.env.production' });
    console.log('🚀 Loaded PRODUCTION environment variables');
  } else {
    dotenv.config();
    console.log('🔧 Loaded DEVELOPMENT environment variables');
  }
};

// Environment configuration object
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Database
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  
  // External APIs
  EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Security
  SESSION_SECRET: process.env.SESSION_SECRET,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Helper methods
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV !== 'production'
};

// Validate required environment variables
export const validateEnvironment = () => {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'FRONTEND_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are present');
};

export default loadEnvironment;