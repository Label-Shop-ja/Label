// Test build optimization script
import { execSync } from 'child_process';
import { existsSync, statSync, readdirSync } from 'fs';
import { resolve } from 'path';

const testBuildOptimization = () => {
  console.log('🚀 TESTING BUILD OPTIMIZATION\n');
  
  try {
    // Build the project
    console.log('1. Building project...');
    const buildStart = Date.now();
    execSync('npm run build', { stdio: 'inherit' });
    const buildTime = Date.now() - buildStart;
    console.log(`✅ Build completed in ${buildTime}ms`);
    
    // Analyze build output
    console.log('\n2. Analyzing build output...');
    const distPath = resolve('dist');
    
    if (!existsSync(distPath)) {
      throw new Error('Build directory not found');
    }
    
    // Check assets directory
    const assetsPath = resolve(distPath, 'assets');
    if (existsSync(assetsPath)) {
      const assets = readdirSync(assetsPath);
      const jsFiles = assets.filter(file => file.endsWith('.js'));
      const cssFiles = assets.filter(file => file.endsWith('.css'));
      
      console.log(`📦 Generated ${jsFiles.length} JS files:`);
      jsFiles.forEach(file => {
        const filePath = resolve(assetsPath, file);
        const size = (statSync(filePath).size / 1024).toFixed(2);
        console.log(`   ${file}: ${size} KB`);
      });
      
      console.log(`🎨 Generated ${cssFiles.length} CSS files:`);
      cssFiles.forEach(file => {
        const filePath = resolve(assetsPath, file);
        const size = (statSync(filePath).size / 1024).toFixed(2);
        console.log(`   ${file}: ${size} KB`);
      });
    }
    
    // Total build size
    const getTotalSize = (dir) => {
      let totalSize = 0;
      const files = readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = resolve(dir, file.name);
        if (file.isDirectory()) {
          totalSize += getTotalSize(filePath);
        } else {
          totalSize += statSync(filePath).size;
        }
      }
      return totalSize;
    };
    
    const totalSize = (getTotalSize(distPath) / 1024 / 1024).toFixed(2);
    console.log(`\n📊 Total build size: ${totalSize} MB`);
    
    // Performance recommendations
    console.log('\n💡 Performance Analysis:');
    if (buildTime < 10000) {
      console.log('   ✅ Build time is excellent (< 10s)');
    } else if (buildTime < 30000) {
      console.log('   ⚠️  Build time is acceptable (< 30s)');
    } else {
      console.log('   ❌ Build time needs optimization (> 30s)');
    }
    
    if (parseFloat(totalSize) < 5) {
      console.log('   ✅ Bundle size is excellent (< 5MB)');
    } else if (parseFloat(totalSize) < 10) {
      console.log('   ⚠️  Bundle size is acceptable (< 10MB)');
    } else {
      console.log('   ❌ Bundle size needs optimization (> 10MB)');
    }
    
    console.log('\n✅ Build optimization test completed!');
    console.log('💡 Run "npm run build:analyze" to see detailed bundle analysis');
    
  } catch (error) {
    console.error('❌ Build optimization test failed:', error.message);
    process.exit(1);
  }
};

testBuildOptimization();