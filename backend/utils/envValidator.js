/**
 * Validador de variables de entorno
 */

const requiredEnvVars = {
  development: [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL'
  ],
  production: [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'EMAIL_HOST',
    'EMAIL_USERNAME',
    'EMAIL_PASSWORD'
  ]
};

/**
 * Valida que las variables de entorno requeridas estén presentes
 */
export const validateEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Copia .env.example a .env y configura las variables');
    process.exit(1);
  }
  
  // Validar longitud de secretos
  const secrets = ['JWT_SECRET', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  secrets.forEach(secret => {
    if (process.env[secret] && process.env[secret].length < 32) {
      console.error(`❌ ${secret} debe tener al menos 32 caracteres`);
      process.exit(1);
    }
  });
  
  console.log('✅ Variables de entorno validadas correctamente');
};

/**
 * Detecta credenciales hardcodeadas peligrosas
 */
export const detectHardcodedCredentials = () => {
  const dangerousPatterns = [
    'password123',
    'admin',
    'test',
    '123456',
    'secret',
    'default'
  ];
  
  const envVars = Object.entries(process.env);
  const suspicious = [];
  
  envVars.forEach(([key, value]) => {
    if (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY')) {
      dangerousPatterns.forEach(pattern => {
        if (value && value.toLowerCase().includes(pattern)) {
          suspicious.push(key);
        }
      });
    }
  });
  
  if (suspicious.length > 0) {
    console.warn('⚠️  Posibles credenciales inseguras detectadas:');
    suspicious.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('🔒 Considera usar credenciales más seguras en producción');
  }
};