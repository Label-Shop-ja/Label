// Security testing script
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testSecurity = async () => {
  console.log('🔒 TESTING SECURITY MEASURES\n');
  
  try {
    // Test 1: Rate limiting
    console.log('1. Testing Rate Limiting...');
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${API_BASE}/auth/login`, {
          email: 'test@test.com',
          password: 'wrongpassword'
        }).catch(err => err.response)
      );
    }
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(res => res?.status === 429);
    console.log(`   Rate limiting: ${rateLimited ? '✅ Working' : '❌ Not working'}`);
    
    // Test 2: Security headers
    console.log('\n2. Testing Security Headers...');
    const response = await axios.get(`${API_BASE}/auth/status`).catch(err => err.response);
    const headers = response?.headers || {};
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    securityHeaders.forEach(header => {
      const present = headers[header] ? '✅' : '❌';
      console.log(`   ${header}: ${present} ${headers[header] || 'Missing'}`);
    });
    
    // Test 3: Input sanitization
    console.log('\n3. Testing Input Sanitization...');
    const maliciousPayload = {
      email: 'test@test.com',
      password: '{"$gt": ""}', // NoSQL injection attempt
      name: '<script>alert("xss")</script>' // XSS attempt
    };
    
    const sanitizationTest = await axios.post(`${API_BASE}/auth/register`, maliciousPayload)
      .catch(err => err.response);
    
    console.log(`   Input sanitization: ${sanitizationTest?.status === 400 ? '✅ Working' : '❌ Needs attention'}`);
    
    console.log('\n✅ Security test completed!');
    
  } catch (error) {
    console.error('❌ Security test failed:', error.message);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSecurity();
}

export default testSecurity;