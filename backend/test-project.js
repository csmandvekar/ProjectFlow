const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testProjectCreation() {
  console.log('🧪 Testing Project Creation...\n');

  try {
    // First login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'csmandvekar@gmail.com',
      password: 'abcdef'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test project creation
    console.log('\n2. Creating project...');
    const projectData = {
      title: 'Test Project',
      description: 'A test project for API testing',
      deadline: '2024-12-31'
    };
    
    const projectResponse = await axios.post(`${API_BASE}/projects`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Project creation successful');
    console.log('Response:', projectResponse.data);

    console.log('\n🎉 Project creation test passed!');
    
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
  testProjectCreation();
}

module.exports = testProjectCreation;
