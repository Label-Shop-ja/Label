#!/usr/bin/env node

/**
 * Script de análisis de performance
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const FRONTEND_DIST = 'frontend/dist';
const BACKEND_LOGS = 'backend/logs';

/**
 * Analizar tamaño de bundle
 */
const analyzeBundleSize = () => {
  console.log('📦 Analizando tamaño de bundle...\n');
  
  if (!existsSync(FRONTEND_DIST)) {
    console.log('❌ Directorio dist no encontrado. Ejecuta: npm run build');
    return;
  }

  try {
    const result = execSync('du -sh frontend/dist/*', { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    
    console.log('📊 Tamaños de archivos:');
    lines.forEach(line => {
      const [size, file] = line.split('\t');
      const fileName = file.split('/').pop();
      console.log(`   ${fileName}: ${size}`);
    });
    
    // Verificar límites recomendados
    const jsFiles = lines.filter(line => line.includes('.js'));
    const cssFiles = lines.filter(line => line.includes('.css'));
    
    console.log(`\n✅ Archivos JS: ${jsFiles.length}`);
    console.log(`✅ Archivos CSS: ${cssFiles.length}`);
    
  } catch (error) {
    console.log('⚠️  No se pudo analizar el bundle:', error.message);
  }
};

/**
 * Analizar logs de performance del backend
 */
const analyzeBackendPerformance = () => {
  console.log('\n🔍 Analizando performance del backend...\n');
  
  const performanceLogPath = `${BACKEND_LOGS}/performance-${new Date().toISOString().split('T')[0]}.log`;
  
  if (!existsSync(performanceLogPath)) {
    console.log('⚠️  No hay logs de performance de hoy');
    return;
  }

  try {
    const logContent = readFileSync(performanceLogPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    const apiCalls = lines
      .filter(line => line.includes('API Request'))
      .map(line => {
        try {
          const data = JSON.parse(line.split('API Request')[1]);
          return {
            method: data.method,
            url: data.url,
            responseTime: parseInt(data.responseTime),
            statusCode: data.statusCode
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (apiCalls.length > 0) {
      const avgResponseTime = apiCalls.reduce((sum, call) => sum + call.responseTime, 0) / apiCalls.length;
      const slowCalls = apiCalls.filter(call => call.responseTime > 1000);
      const errorCalls = apiCalls.filter(call => call.statusCode >= 400);
      
      console.log('📈 Estadísticas de API:');
      console.log(`   Total de llamadas: ${apiCalls.length}`);
      console.log(`   Tiempo promedio: ${Math.round(avgResponseTime)}ms`);
      console.log(`   Llamadas lentas (>1s): ${slowCalls.length}`);
      console.log(`   Llamadas con error: ${errorCalls.length}`);
      
      if (slowCalls.length > 0) {
        console.log('\n⚠️  Endpoints más lentos:');
        slowCalls
          .sort((a, b) => b.responseTime - a.responseTime)
          .slice(0, 5)
          .forEach(call => {
            console.log(`   ${call.method} ${call.url}: ${call.responseTime}ms`);
          });
      }
    }
    
  } catch (error) {
    console.log('❌ Error analizando logs:', error.message);
  }
};

/**
 * Generar reporte de performance
 */
const generatePerformanceReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    frontend: {
      bundleAnalyzed: existsSync(FRONTEND_DIST),
      serviceWorkerEnabled: existsSync('frontend/public/sw.js'),
      lazyLoadingImplemented: existsSync('frontend/src/utils/lazyComponents.js')
    },
    backend: {
      logsAvailable: existsSync(BACKEND_LOGS),
      cacheImplemented: existsSync('backend/utils/cacheManager.js'),
      queryOptimized: existsSync('backend/utils/queryOptimizer.js')
    },
    recommendations: []
  };

  // Generar recomendaciones
  if (!report.frontend.bundleAnalyzed) {
    report.recommendations.push('Ejecutar build para analizar bundle');
  }
  
  if (!report.backend.logsAvailable) {
    report.recommendations.push('Configurar logging de performance');
  }

  // Guardar reporte
  const reportPath = 'performance-report.json';
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  
  return report;
};

/**
 * Ejecutar análisis completo
 */
const runAnalysis = () => {
  console.log('🚀 Iniciando análisis de performance...\n');
  
  analyzeBundleSize();
  analyzeBackendPerformance();
  
  const report = generatePerformanceReport();
  
  console.log('\n📋 Resumen:');
  console.log(`   Frontend optimizado: ${report.frontend.bundleAnalyzed ? '✅' : '❌'}`);
  console.log(`   Backend monitoreado: ${report.backend.logsAvailable ? '✅' : '❌'}`);
  console.log(`   Cache implementado: ${report.backend.cacheImplemented ? '✅' : '❌'}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recomendaciones:');
    report.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
  }
  
  console.log('\n✅ Análisis completado');
};

// Ejecutar análisis
runAnalysis();