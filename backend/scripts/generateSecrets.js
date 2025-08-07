// Script to generate secure secrets for production
import crypto from 'crypto';

const generateSecrets = () => {
  console.log('🔐 GENERATING SECURE SECRETS FOR PRODUCTION\n');
  
  // Generate JWT secrets (64 characters each)
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const jwtAccessSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  
  console.log('📋 COPY THESE TO YOUR .env.production FILE:\n');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_ACCESS_SECRET=${jwtAccessSecret}`);
  console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
  console.log(`SESSION_SECRET=${sessionSecret}`);
  
  console.log('\n✅ All secrets generated successfully!');
  console.log('⚠️  IMPORTANT: Keep these secrets secure and never commit them to version control!');
};

generateSecrets();