// Script to check environment configuration
import dotenv from 'dotenv';
import { config, validateEnvironment } from '../config/environment.js';

// Load environment based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

console.log('🔍 ENVIRONMENT CONFIGURATION CHECK\n');
console.log(`Environment: ${env.toUpperCase()}`);
console.log('─'.repeat(50));

// Check all configuration values
const checkConfig = () => {
  console.log('📋 Configuration Values:');
  console.log(`NODE_ENV: ${config.NODE_ENV}`);
  console.log(`PORT: ${config.PORT}`);
  console.log(`MONGO_URI: ${config.MONGO_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`FRONTEND_URL: ${config.FRONTEND_URL}`);
  console.log(`JWT_SECRET: ${config.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`GOOGLE_CLIENT_ID: ${config.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`EMAIL_USERNAME: ${config.EMAIL_USERNAME || '❌ Missing'}`);
  console.log(`EXCHANGE_RATE_API_KEY: ${config.EXCHANGE_RATE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  console.log('\n🔐 Security Configuration:');
  console.log(`Session Secret: ${config.SESSION_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`Rate Limit Window: ${config.RATE_LIMIT_WINDOW_MS}ms`);
  console.log(`Rate Limit Max Requests: ${config.RATE_LIMIT_MAX_REQUESTS}`);
  
  console.log('\n🌐 CORS Configuration:');
  if (config.isProduction()) {
    console.log(`CORS Origins: ${config.CORS_ORIGIN || config.FRONTEND_URL}`);
  } else {
    console.log('CORS Origins: localhost:5173 + local IPs');
  }
};

// Run checks
try {
  checkConfig();
  console.log('\n🔍 Validating required variables...');
  validateEnvironment();
  console.log('\n✅ Environment configuration is valid!');
} catch (error) {
  console.error('\n❌ Environment configuration error:', error.message);
  process.exit(1);
}