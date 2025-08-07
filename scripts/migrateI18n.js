#!/usr/bin/env node

/**
 * Script para migrar textos hardcodeados a sistema i18n
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const FRONTEND_SRC = 'frontend/src';
const COMMON_HARDCODED_TEXTS = [
  { text: 'Guardar', key: 'common.save' },
  { text: 'Cancelar', key: 'common.cancel' },
  { text: 'Eliminar', key: 'common.delete' },
  { text: 'Editar', key: 'common.edit' },
  { text: 'Agregar', key: 'common.add' },
  { text: 'Buscar', key: 'common.search' },
  { text: 'Cargando...', key: 'common.loading' },
  { text: 'Error', key: 'common.error' },
  { text: 'Éxito', key: 'common.success' },
  { text: 'Confirmar', key: 'common.confirm' },
  { text: 'Cerrar', key: 'common.close' },
  { text: 'Sí', key: 'common.yes' },
  { text: 'No', key: 'common.no' },
  { text: 'Nombre', key: 'common.name' },
  { text: 'Descripción', key: 'common.description' },
  { text: 'Precio', key: 'common.price' },
  { text: 'Cantidad', key: 'common.quantity' },
  { text: 'Total', key: 'common.total' },
  { text: 'Fecha', key: 'common.date' },
  { text: 'Acciones', key: 'common.actions' }
];

/**
 * Busca archivos JSX recursivamente
 */
const findJsxFiles = (dir) => {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findJsxFiles(fullPath));
    } else if (stat.isFile() && ['.jsx', '.js'].includes(extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
};

/**
 * Migra un archivo JSX
 */
const migrateFile = (filePath) => {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Verificar si ya tiene useTranslation
  const hasUseTranslation = content.includes('useTranslation');
  
  if (!hasUseTranslation) {
    // Agregar import si no existe
    if (content.includes('import') && !content.includes('useTranslation')) {
      const importLine = "import { useTranslation } from '../../hooks/useTranslation';\n";
      content = content.replace(
        /(import.*from.*['"];?\n)/,
        `$1${importLine}`
      );
      modified = true;
    }
    
    // Agregar hook al componente
    const componentMatch = content.match(/const\s+(\w+)\s*=\s*\(/);
    if (componentMatch) {
      const hookLine = "  const { t } = useTranslation();\n";
      content = content.replace(
        /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/,
        `$&\n${hookLine}`
      );
      modified = true;
    }
  }
  
  // Reemplazar textos hardcodeados
  COMMON_HARDCODED_TEXTS.forEach(({ text, key }) => {
    const patterns = [
      new RegExp(`"${text}"`, 'g'),
      new RegExp(`'${text}'`, 'g'),
      new RegExp(`>{text}<`, 'g')
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `{t('${key}')}`);
        modified = true;
      }
    });
  });
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`✅ Migrado: ${filePath}`);
    return true;
  }
  
  return false;
};

/**
 * Ejecutar migración
 */
const runMigration = () => {
  console.log('🔄 Iniciando migración de i18n...\n');
  
  const jsxFiles = findJsxFiles(FRONTEND_SRC);
  let migratedCount = 0;
  
  jsxFiles.forEach(file => {
    if (migrateFile(file)) {
      migratedCount++;
    }
  });
  
  console.log(`\n📊 Resumen:`);
  console.log(`   - Archivos analizados: ${jsxFiles.length}`);
  console.log(`   - Archivos migrados: ${migratedCount}`);
  console.log(`   - Archivos sin cambios: ${jsxFiles.length - migratedCount}`);
  
  if (migratedCount > 0) {
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Revisa los archivos migrados manualmente');
    console.log('   - Algunos textos pueden necesitar ajustes');
    console.log('   - Ejecuta las pruebas después de la migración');
  }
};

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}