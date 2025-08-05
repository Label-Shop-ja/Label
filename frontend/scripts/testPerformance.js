// Performance testing script
import { execSync } from 'child_process';
import { existsSync, statSync, readdirSync } from 'fs';
import { resolve } from 'path';

const testPerformance = () => {
  console.log('⚡ TESTING PERFORMANCE OPTIMIZATIONS\n');
  
  try {
    // Test build output
    console.log('1. Analyzing build output...');
    
    if (!existsSync('dist')) {
      console.log('   Building project first...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    const distPath = resolve('dist');
    const assetsPath = resolve(distPath, 'assets');
    
    if (existsSync(assetsPath)) {
      const assets = readdirSync(assetsPath);
      const jsFiles = assets.filter(file => file.endsWith('.js'));
      const cssFiles = assets.filter(file => file.endsWith('.css'));
      
      console.log('   📦 JavaScript chunks:');
      jsFiles.forEach(file => {
        const filePath = resolve(assetsPath, file);
        const size = (statSync(filePath).size / 1024).toFixed(2);
        const isVendor = file.includes('vendor');
        const isLarge = parseFloat(size) > 500;
        
        console.log(`      ${file}: ${size} KB ${isVendor ? '(vendor)' : ''} ${isLarge ? '⚠️' : '✅'}`);
      });
      
      console.log('   🎨 CSS files:');
      cssFiles.forEach(file => {
        const filePath = resolve(assetsPath, file);
        const size = (statSync(filePath).size / 1024).toFixed(2);
        console.log(`      ${file}: ${size} KB`);
      });
    }
    
    // Check for service worker
    console.log('\n2. Checking service worker...');
    const swPath = resolve('public', 'sw.js');
    if (existsSync(swPath)) {
      const swSize = (statSync(swPath).size / 1024).toFixed(2);
      console.log(`   ✅ Service worker found: ${swSize} KB`);
    } else {
      console.log('   ❌ Service worker not found');
    }
    
    // Check for lazy loading components
    console.log('\n3. Checking lazy loading implementation...');
    const appPath = resolve('src', 'App.jsx');
    if (existsSync(appPath)) {
      const appContent = require('fs').readFileSync(appPath, 'utf8');
      const hasLazyImports = appContent.includes('lazy(');
      const hasSuspense = appContent.includes('<Suspense');
      
      console.log(`   ${hasLazyImports ? '✅' : '❌'} Lazy imports found`);
      console.log(`   ${hasSuspense ? '✅' : '❌'} Suspense wrapper found`);
    }
    
    // Performance recommendations
    console.log('\n4. Performance analysis:');
    
    const totalJSSize = jsFiles.reduce((total, file) => {
      const filePath = resolve(assetsPath, file);
      return total + statSync(filePath).size;
    }, 0) / 1024;
    
    const totalCSSSize = cssFiles.reduce((total, file) => {
      const filePath = resolve(assetsPath, file);
      return total + statSync(filePath).size;
    }, 0) / 1024;
    
    console.log(`   📊 Total JS size: ${totalJSSize.toFixed(2)} KB`);
    console.log(`   📊 Total CSS size: ${totalCSSSize.toFixed(2)} KB`);
    
    // Performance scoring
    let score = 100;
    const issues = [];
    
    if (totalJSSize > 1000) {
      score -= 20;
      issues.push('Large JavaScript bundle (> 1MB)');
    }
    
    if (totalCSSSize > 200) {
      score -= 10;
      issues.push('Large CSS bundle (> 200KB)');
    }
    
    if (jsFiles.length < 3) {
      score -= 15;
      issues.push('No code splitting detected');
    }
    
    if (!existsSync(swPath)) {
      score -= 15;
      issues.push('No service worker for caching');
    }
    
    console.log(`\n📊 Performance Score: ${score}/100`);
    
    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('\n✅ No performance issues detected!');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (score >= 90) {
      console.log('   🎉 Excellent performance! Ready for production.');
    } else if (score >= 70) {
      console.log('   👍 Good performance with room for improvement.');
    } else {
      console.log('   ⚠️  Performance needs attention before production.');
    }
    
    console.log('\n✅ Performance test completed!');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPerformance();
}

export default testPerformance;