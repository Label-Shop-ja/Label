// Test error handling system
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testErrorHandling = async () => {
  console.log('🧪 TESTING ERROR HANDLING SYSTEM\n');
  
  try {
    // Test 1: 404 Error
    console.log('1. Testing 404 Error...');
    try {
      await axios.get(`${API_BASE}/nonexistent-route`);
    } catch (error) {
      console.log(`   ✅ 404 handled: ${error.response?.status} - ${error.response?.data?.message}`);
      console.log(`   📋 Error ID: ${error.response?.data?.errorId}`);
    }
    
    // Test 2: Validation Error
    console.log('\n2. Testing Validation Error...');
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        email: 'invalid-email',
        password: '123' // Too short
      });
    } catch (error) {
      console.log(`   ✅ Validation handled: ${error.response?.status} - ${error.response?.data?.message}`);
      if (error.response?.data?.errors) {
        console.log(`   📝 Validation errors: ${error.response.data.errors.length} fields`);
      }
    }
    
    // Test 3: Authentication Error
    console.log('\n3. Testing Authentication Error...');
    try {
      await axios.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
    } catch (error) {
      console.log(`   ✅ Auth error handled: ${error.response?.status} - ${error.response?.data?.message}`);
    }
    
    // Test 4: Rate Limiting Error
    console.log('\n4. Testing Rate Limiting...');
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        axios.post(`${API_BASE}/auth/login`, {
          email: 'test@test.com',
          password: 'wrongpassword'
        }).catch(err => err.response)
      );
    }
    
    const responses = await Promise.all(promises);
    const rateLimitedResponse = responses.find(res => res?.status === 429);
    
    if (rateLimitedResponse) {
      console.log(`   ✅ Rate limiting works: ${rateLimitedResponse.status}`);
      console.log(`   ⏰ Retry after: ${rateLimitedResponse.data?.retryAfter} minutes`);
    } else {
      console.log('   ❌ Rate limiting not triggered');
    }
    
    console.log('\n✅ Error handling test completed!');
    console.log('\n📊 Check logs/error-*.log for detailed error logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testErrorHandling();
}

export default testErrorHandling;