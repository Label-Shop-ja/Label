#!/usr/bin/env node

// Script para verificar y arreglar problemas de compatibilidad con React 19
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando compatibilidad con React 19...');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Verificar versiones problemáticas
const problematicDeps = {
  'react-tsparticles': '^2.12.2',
  'tsparticles-slim': '^2.12.0'
};

let hasIssues = false;

for (const [dep, version] of Object.entries(problematicDeps)) {
  if (packageJson.dependencies[dep] === version) {
    console.log(`⚠️  ${dep}@${version} podría tener problemas con React 19`);
    hasIssues = true;
  }
}

if (!hasIssues) {
  console.log('✅ No se encontraron problemas de compatibilidad obvios');
} else {
  console.log('\n💡 Recomendaciones:');
  console.log('1. Considera downgrading React a la versión 18.x');
  console.log('2. O actualiza las librerías problemáticas a versiones compatibles');
  console.log('3. Verifica la consola del navegador para errores específicos');
}

console.log('\n🔧 Para downgrader React, ejecuta:');
console.log('npm install react@^18.2.0 react-dom@^18.2.0');