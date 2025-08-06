#!/usr/bin/env node

/**
 * Script de verificación de seguridad
 * Ejecutar antes de deploy para validar configuración
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const checks = [];

// Verificar archivos .env
const checkEnvFiles = () => {
  const backendEnv = 'backend/.env';
  const frontendEnv = 'frontend/.env.production';
  
  if (!existsSync(backendEnv)) {
    checks.push({
      type: 'error',
      message: 'Archivo backend/.env no encontrado'
    });
  }
  
  if (!existsSync(frontendEnv)) {
    checks.push({
      type: 'warning',
      message: 'Archivo frontend/.env.production no encontrado'
    });
  }
  
  // Verificar credenciales por defecto
  if (existsSync(backendEnv)) {
    const envContent = readFileSync(backendEnv, 'utf8');
    
    const dangerousPatterns = [
      'password123',
      'admin',
      'test123',
      'secret123',
      'your_password_here'
    ];
    
    dangerousPatterns.forEach(pattern => {
      if (envContent.toLowerCase().includes(pattern)) {
        checks.push({
          type: 'error',
          message: `Credencial insegura detectada: ${pattern}`
        });
      }
    });
  }
};

// Verificar archivos de sanitización
const checkSanitizers = () => {
  const backendSanitizer = 'backend/utils/sanitizer.js';
  const frontendSanitizer = 'frontend/src/utils/sanitizer.js';
  
  if (!existsSync(backendSanitizer)) {
    checks.push({
      type: 'error',
      message: 'Sanitizador del backend no encontrado'
    });
  }
  
  if (!existsSync(frontendSanitizer)) {
    checks.push({
      type: 'error',
      message: 'Sanitizador del frontend no encontrado'
    });
  }
};

// Verificar middleware de autorización
const checkAuthMiddleware = () => {
  const authMiddleware = 'backend/middleware/authorizationMiddleware.js';
  
  if (!existsSync(authMiddleware)) {
    checks.push({
      type: 'error',
      message: 'Middleware de autorización no encontrado'
    });
  }
};

// Ejecutar verificaciones
console.log('🔍 Ejecutando verificación de seguridad...\n');

checkEnvFiles();
checkSanitizers();
checkAuthMiddleware();

// Mostrar resultados
const errors = checks.filter(c => c.type === 'error');
const warnings = checks.filter(c => c.type === 'warning');

if (errors.length > 0) {
  console.log('❌ ERRORES CRÍTICOS:');
  errors.forEach(error => {
    console.log(`   - ${error.message}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:');
  warnings.forEach(warning => {
    console.log(`   - ${warning.message}`);
  });
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Todas las verificaciones de seguridad pasaron');
} else if (errors.length === 0) {
  console.log('✅ Verificaciones críticas pasaron (solo advertencias)');
} else {
  console.log('❌ Verificación de seguridad falló');
  process.exit(1);
}

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. Ejecutar: npm run test:security');
console.log('2. Revisar logs de seguridad');
console.log('3. Validar variables de entorno');
console.log('4. Probar autenticación en rutas protegidas');