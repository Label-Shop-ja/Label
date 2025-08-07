// Main deployment script
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import preDeployCheck from './preDeployCheck.js';

const deploy = async () => {
  console.log('🚀 LABEL DEPLOYMENT SCRIPT\n');
  
  try {
    // 1. Pre-deployment checks
    console.log('STEP 1: Pre-deployment verification');
    const checksPass = await preDeployCheck();
    
    if (!checksPass) {
      console.log('❌ Pre-deployment checks failed. Aborting deployment.');
      process.exit(1);
    }

    // 2. Generate production assets
    console.log('\nSTEP 2: Generating production assets');
    console.log('─'.repeat(40));
    
    console.log('   📄 Generating sitemap...');
    execSync('cd frontend && npm run generate:sitemap', { stdio: 'inherit' });
    
    console.log('   🏗️  Building frontend...');
    execSync('cd frontend && npm run build:prod', { stdio: 'inherit' });
    
    console.log('   📦 Installing backend dependencies...');
    execSync('cd backend && npm ci --only=production', { stdio: 'inherit' });

    // 3. Create deployment package
    console.log('\nSTEP 3: Creating deployment package');
    console.log('─'.repeat(40));
    
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'production',
      features: [
        'Professional logging system',
        'Advanced security middleware',
        'Performance optimizations',
        'Monitoring and analytics',
        'SEO optimization',
        'PWA support'
      ]
    };
    
    writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('   ✅ Deployment info created');

    // 4. Docker setup (optional)
    console.log('\nSTEP 4: Docker configuration');
    console.log('─'.repeat(40));
    
    if (existsSync('Dockerfile')) {
      console.log('   🐳 Building Docker image...');
      execSync('docker build -t label-app .', { stdio: 'inherit' });
      console.log('   ✅ Docker image built');
    } else {
      console.log('   ⚠️  No Dockerfile found, skipping Docker build');
    }

    // 5. Final verification
    console.log('\nSTEP 5: Final verification');
    console.log('─'.repeat(40));
    
    const distExists = existsSync('frontend/dist/index.html');
    const deployInfoExists = existsSync('deployment-info.json');
    
    if (distExists && deployInfoExists) {
      console.log('   ✅ All deployment assets ready');
      
      console.log('\n🎉 DEPLOYMENT READY!');
      console.log('─'.repeat(40));
      console.log('📁 Frontend build: frontend/dist/');
      console.log('📁 Backend files: backend/');
      console.log('📄 Deployment info: deployment-info.json');
      console.log('\n🚀 Ready to upload to your server!');
      
      return true;
    } else {
      throw new Error('Deployment assets missing');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await deploy();
}

export default deploy;