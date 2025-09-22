const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication API...\n');

  try {
    // Test user registration
    console.log('1. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ User registration passed');
      console.log('Response:', registerResponse.data);
      const token = registerResponse.data.token;
      
      // Test user login
      console.log('\n2. Testing user login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'TestPass123'
      });
      console.log('✅ User login passed');
      console.log('Response:', loginResponse.data);

      // Test protected route
      console.log('\n3. Testing protected route /me...');
      const meResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected route passed');
      console.log('Response:', meResponse.data);

      console.log('\n🎉 All authentication tests passed!');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, testing login instead...');
        
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'test@example.com',
          password: 'TestPass123'
        });
        console.log('✅ User login passed');
        console.log('Response:', loginResponse.data);
        const token = loginResponse.data.token;
        
        // Test protected route
        console.log('\n3. Testing protected route /me...');
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Protected route passed');
        console.log('Response:', meResponse.data);
        
        console.log('\n🎉 Authentication tests completed!');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = testAuth;
