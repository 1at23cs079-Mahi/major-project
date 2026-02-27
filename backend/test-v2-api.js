/**
 * Test script for v2 API endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Healthcare Platform API v2.0\n');
  console.log('='.repeat(50));

  // Test 1: Health check
  console.log('\n1. Testing /health endpoint...');
  try {
    const health = await makeRequest('GET', '/health');
    console.log('   Status:', health.status);
    console.log('   Response:', JSON.stringify(health.data, null, 2));
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 2: API info
  console.log('\n2. Testing /api endpoint...');
  try {
    const api = await makeRequest('GET', '/api');
    console.log('   Status:', api.status);
    console.log('   Response:', JSON.stringify(api.data, null, 2));
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 3: v2 Registration with invalid data
  console.log('\n3. Testing /api/v2/auth/register (validation)...');
  try {
    const result = await makeRequest('POST', '/api/v2/auth/register', {
      email: 'invalid-email',
      password: 'weak',
    });
    console.log('   Status:', result.status);
    console.log('   Response:', JSON.stringify(result.data, null, 2));
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 4: v2 Registration with valid data
  console.log('\n4. Testing /api/v2/auth/register (valid data)...');
  const testEmail = `testuser_v2_${Date.now()}@example.com`;
  const testPassword = 'Secure@Password123!';
  try {
    const result = await makeRequest('POST', '/api/v2/auth/register', {
      email: testEmail,
      password: testPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient',
      dateOfBirth: '1990-01-01',
      gender: 'male',
    });
    console.log('   Status:', result.status);
    console.log('   Response:', JSON.stringify(result.data, null, 2));
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 5: v2 Login
  console.log('\n5. Testing /api/v2/auth/login...');
  try {
    const result = await makeRequest('POST', '/api/v2/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    console.log('   Status:', result.status);
    console.log('   Response:', JSON.stringify(result.data, null, 2));
  } catch (err) {
    console.error('   Error:', err.message);
  }

  // Test 6: Legacy v1 endpoint still works
  console.log('\n6. Testing legacy /api/auth/login...');
  try {
    const result = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    console.log('   Status:', result.status);
    console.log('   Success:', result.data.success !== false);
  } catch (err) {
    console.error('   Error:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Tests completed!');
}

runTests().catch(console.error);
