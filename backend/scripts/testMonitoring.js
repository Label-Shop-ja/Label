// Test monitoring system
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const testMonitoring = async () => {
  console.log('📊 TESTING MONITORING SYSTEM\n');
  
  try {
    // Test health endpoints
    console.log('1. Testing health endpoints...');
    
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('   ✅ /health:', healthResponse.status, healthResponse.data.status);
    
    const pingResponse = await axios.get(`${API_BASE}/ping`);
    console.log('   ✅ /ping:', pingResponse.status, pingResponse.data.status);
    
    const readyResponse = await axios.get(`${API_BASE}/ready`);
    console.log('   ✅ /ready:', readyResponse.status, readyResponse.data.status);
    
    const liveResponse = await axios.get(`${API_BASE}/live`);
    console.log('   ✅ /live:', liveResponse.status, liveResponse.data.status);
    
    // Test metrics endpoint
    console.log('\n2. Testing metrics endpoint...');
    try {
      const metricsResponse = await axios.get(`${API_BASE}/metrics`, {
        headers: { 'x-monitoring-key': 'test-key' }
      });
      console.log('   ✅ /metrics:', metricsResponse.status);
      console.log('   📊 Uptime:', metricsResponse.data.uptime, 'seconds');
      console.log('   📊 Requests:', metricsResponse.data.requests);
      console.log('   📊 Error rate:', metricsResponse.data.errorRate);
    } catch (error) {
      console.log('   ⚠️  /metrics requires monitoring key');
    }
    
    // Generate some API traffic for testing
    console.log('\n3. Generating test traffic...');
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.get(`${API_BASE}/api/auth/me`).catch(err => err.response)
      );
    }
    
    const responses = await Promise.all(requests);
    console.log(`   📈 Generated ${responses.length} requests`);
    
    // Check updated metrics
    console.log('\n4. Checking updated metrics...');
    const updatedMetrics = await axios.get(`${API_BASE}/metrics`, {
      headers: { 'x-monitoring-key': 'test-key' }
    }).catch(() => null);
    
    if (updatedMetrics) {
      console.log('   📊 Updated requests:', updatedMetrics.data.requests);
      console.log('   📊 Updated error rate:', updatedMetrics.data.errorRate);
      console.log('   📊 Avg response time:', updatedMetrics.data.avgResponseTime, 'ms');
    }
    
    // Test detailed health check
    console.log('\n5. Testing detailed health check...');
    const detailedHealth = await axios.get(`${API_BASE}/health`);
    const health = detailedHealth.data;
    
    console.log('   🏥 Overall status:', health.overall);
    console.log('   💾 Database:', health.database.status);
    console.log('   🧠 Memory used:', health.memory.used, 'MB');
    console.log('   ⏱️  Uptime:', health.uptime, 'seconds');
    
    if (health.externalServices) {
      console.log('   🌐 External services:');
      health.externalServices.forEach(service => {
        console.log(`      ${service.name}: ${service.status}`);
      });
    }
    
    console.log('\n✅ Monitoring system test completed!');
    console.log('💡 Check logs/ directory for detailed monitoring logs');
    
  } catch (error) {
    console.error('❌ Monitoring test failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMonitoring();
}

export default testMonitoring;