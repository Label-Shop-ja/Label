#!/usr/bin/env node

/**
 * Script para validar completitud de traducciones
 */

import { readFileSync, existsSync } from 'fs';

const LOCALES_PATH = 'frontend/src/locales';
const LANGUAGES = ['es', 'en'];

/**
 * Carga archivo de traducción
 */
const loadTranslations = (lang) => {
  const filePath = `${LOCALES_PATH}/${lang}.json`;
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
};

/**
 * Obtiene todas las claves de un objeto anidado
 */
const getAllKeys = (obj, prefix = '') => {
  const keys = [];
  
  Object.keys(obj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  });
  
  return keys;
};

/**
 * Valida traducciones
 */
const validateTranslations = () => {
  console.log('🔍 Validando traducciones...\n');
  
  const translations = {};
  const allKeys = new Set();
  
  // Cargar todas las traducciones
  LANGUAGES.forEach(lang => {
    translations[lang] = loadTranslations(lang);
    if (translations[lang]) {
      const keys = getAllKeys(translations[lang]);
      keys.forEach(key => allKeys.add(key));
      console.log(`✅ ${lang}.json: ${keys.length} claves`);
    } else {
      console.log(`❌ ${lang}.json: No encontrado`);
    }
  });
  
  console.log(`\n📊 Total de claves únicas: ${allKeys.size}\n`);
  
  // Verificar claves faltantes
  let hasErrors = false;
  
  LANGUAGES.forEach(lang => {
    if (!translations[lang]) return;
    
    const langKeys = new Set(getAllKeys(translations[lang]));
    const missingKeys = [...allKeys].filter(key => !langKeys.has(key));
    
    if (missingKeys.length > 0) {
      console.log(`❌ ${lang}.json - Claves faltantes:`);
      missingKeys.forEach(key => console.log(`   - ${key}`));
      console.log('');
      hasErrors = true;
    } else {
      console.log(`✅ ${lang}.json - Todas las claves presentes`);
    }
  });
  
  // Verificar valores vacíos
  LANGUAGES.forEach(lang => {
    if (!translations[lang]) return;
    
    const emptyValues = [];
    const checkEmpty = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkEmpty(obj[key], fullKey);
        } else if (!obj[key] || obj[key].trim() === '') {
          emptyValues.push(fullKey);
        }
      });
    };
    
    checkEmpty(translations[lang]);
    
    if (emptyValues.length > 0) {
      console.log(`⚠️  ${lang}.json - Valores vacíos:`);
      emptyValues.forEach(key => console.log(`   - ${key}`));
      console.log('');
    }
  });
  
  if (hasErrors) {
    console.log('❌ Validación de i18n falló');
    process.exit(1);
  } else {
    console.log('✅ Todas las validaciones de i18n pasaron');
  }
};

// Ejecutar validación
validateTranslations();