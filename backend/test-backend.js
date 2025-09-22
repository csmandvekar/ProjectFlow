const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test user registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ User registration passed');
      const token = registerResponse.data.token;
      
      // Test user login
      console.log('\n3. Testing user login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'TestPass123'
      });
      console.log('✅ User login passed');

      // Test project creation
      console.log('\n4. Testing project creation...');
      const projectData = {
        title: 'Test Project',
        description: 'A test project for API testing'
      };
      
      const projectResponse = await axios.post(`${API_BASE}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Project creation passed');
      const projectId = projectResponse.data._id;

      // Test task creation
      console.log('\n5. Testing task creation...');
      const taskData = {
        title: 'Test Task',
        description: 'A test task',
        priority: 'medium'
      };
      
      const taskResponse = await axios.post(`${API_BASE}/projects/${projectId}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Task creation passed');
      const taskId = taskResponse.data._id;

      // Test comment creation
      console.log('\n6. Testing comment creation...');
      const commentData = {
        content: 'This is a test comment'
      };
      
      const commentResponse = await axios.post(`${API_BASE}/projects/${projectId}/tasks/${taskId}/comments`, commentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Comment creation passed');

      console.log('\n🎉 All backend tests passed!');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, testing login instead...');
        
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'test@example.com',
          password: 'TestPass123'
        });
        console.log('✅ User login passed');
        const token = loginResponse.data.token;
        
        // Continue with project and task tests...
        console.log('\n4. Testing project creation...');
        const projectData = {
          title: 'Test Project',
          description: 'A test project for API testing'
        };
        
        const projectResponse = await axios.post(`${API_BASE}/projects`, projectData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Project creation passed');
        const projectId = projectResponse.data._id;

        console.log('\n🎉 Backend tests completed!');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = testBackend;

