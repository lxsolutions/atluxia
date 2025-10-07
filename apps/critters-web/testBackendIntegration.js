

async function testBackendIntegration() {
  console.log('Testing backend integration...');

  // Test API endpoint
  try {
    const response = await fetch('http://localhost:56456/api');
    const data = await response.json();
    console.log('API test:', data);
  } catch (error) {
    console.error('API test failed:', error);
  }

  // Test user registration
  try {
    const response = await fetch('http://localhost:56456/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser_frontend', grade: '2nd' })
    });
    const data = await response.json();
    console.log('User registration test:', data);
  } catch (error) {
    console.error('User registration test failed:', error);
  }

  // Test progress saving
  try {
    const response = await fetch('http://localhost:56456/api/progress/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: { test: 'value' } })
    });
    const data = await response.json();
    console.log('Progress save test:', data);
  } catch (error) {
    console.error('Progress save test failed:', error);
  }

  // Test progress retrieval
  try {
    const response = await fetch('http://localhost:56456/api/progress/1');
    const data = await response.json();
    console.log('Progress retrieve test:', data);
  } catch (error) {
    console.error('Progress retrieve test failed:', error);
  }

  console.log('Backend integration tests completed.');
}

testBackendIntegration().catch(console.error);

