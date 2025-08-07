// Pre-deployment verification script
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const preDeployCheck = async () => {
  console.log('🔍 PRE-DEPLOYMENT CHECKS\n');
  
  let passed = 0;
  let failed = 0;
  const issues = [];

  const check = (name, condition, fix = '') => {
    if (condition) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      if (fix) console.log(`   💡 Fix: ${fix}`);
      failed++;
      issues.push(name);
    }
  };

  try {
    // 1. Environment Variables
    console.log('1. ENVIRONMENT VARIABLES');
    console.log('─'.repeat(30));
    
    const backendEnv = existsSync('backend/.env.production');
    const frontendEnv = existsSync('frontend/.env.production');
    
    check('Backend .env.production exists', backendEnv, 'Create backend/.env.production');
    check('Frontend .env.production exists', frontendEnv, 'Create frontend/.env.production');

    // 2. Build Tests
    console.log('\n2. BUILD VERIFICATION');
    console.log('─'.repeat(30));
    
    try {
      console.log('   Building frontend...');
      execSync('cd frontend && npm run build', { stdio: 'pipe' });
      check('Frontend builds successfully', true);
      
      const distExists = existsSync('frontend/dist');
      check('Build output exists', distExists);
    } catch (error) {
      check('Frontend builds successfully', false, 'Fix build errors');
    }

    // 3. Security & Performance
    console.log('\n3. SECURITY & PERFORMANCE');
    console.log('─'.repeat(30));
    
    const serviceWorker = existsSync('frontend/public/sw.js');
    check('Service worker present', serviceWorker);
    
    const sitemap = existsSync('frontend/public/sitemap.xml');
    check('Sitemap generated', sitemap, 'Run npm run generate:sitemap');
    
    const backendApp = existsSync('backend/app.js');
    if (backendApp) {
      const appContent = readFileSync('backend/app.js', 'utf8');
      check('Security middleware enabled', appContent.includes('helmet') || appContent.includes('createHelmet'));
    }

    // Results
    console.log('\n📊 RESULTS');
    console.log('─'.repeat(30));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Score: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 ALL CHECKS PASSED! Ready for deployment.');
      return true;
    } else {
      console.log('\n⚠️  Fix these issues before deploying.');
      return false;
    }

  } catch (error) {
    console.error('❌ Pre-deployment check failed:', error.message);
    return false;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await preDeployCheck();
  process.exit(success ? 0 : 1);
}

export default preDeployCheck;