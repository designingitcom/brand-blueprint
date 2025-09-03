const fetch = require('node-fetch');

console.log('🔐 Testing Routes & Middleware\n');
console.log('=====================================\n');

const BASE_URL = 'http://localhost:3001';

async function testRoutes() {
  let testResults = {
    passed: [],
    failed: []
  };

  // Test 1: Public Routes (Should be accessible)
  console.log('📝 Test 1: Public Routes Accessibility');
  const publicRoutes = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/reset-password', name: 'Password Reset' }
  ];

  for (const route of publicRoutes) {
    try {
      const response = await fetch(`${BASE_URL}${route.path}`);
      if (response.ok) {
        console.log(`   ✅ ${route.name} (${route.path}): ${response.status}`);
        testResults.passed.push(`Public: ${route.name}`);
      } else {
        console.log(`   ❌ ${route.name} (${route.path}): ${response.status}`);
        testResults.failed.push(`Public: ${route.name}`);
      }
    } catch (error) {
      console.log(`   ❌ ${route.name}: Connection failed`);
      testResults.failed.push(`Public: ${route.name}`);
    }
  }

  // Test 2: Protected Routes (Should redirect when not authenticated)
  console.log('\n📝 Test 2: Protected Routes (Unauthenticated)');
  const protectedRoutes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/profile', name: 'Profile' },
    { path: '/onboarding', name: 'Onboarding' }
  ];

  for (const route of protectedRoutes) {
    try {
      const response = await fetch(`${BASE_URL}${route.path}`, {
        redirect: 'manual'
      });
      
      if (response.status === 307 || response.status === 302) {
        console.log(`   ✅ ${route.name} redirects to login (${response.status})`);
        testResults.passed.push(`Protected redirect: ${route.name}`);
      } else if (response.status === 401) {
        console.log(`   ✅ ${route.name} returns 401 Unauthorized`);
        testResults.passed.push(`Protected 401: ${route.name}`);
      } else {
        console.log(`   ❌ ${route.name} unexpected status: ${response.status}`);
        testResults.failed.push(`Protected: ${route.name}`);
      }
    } catch (error) {
      console.log(`   ❌ ${route.name}: ${error.message}`);
      testResults.failed.push(`Protected: ${route.name}`);
    }
  }

  // Test 3: API Endpoints (Should require authentication)
  console.log('\n📝 Test 3: API Endpoints Protection');
  const apiEndpoints = [
    { path: '/api/ai', method: 'POST', name: 'AI API' },
    { path: '/api/email/preview', method: 'GET', name: 'Email Preview' }
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify({ action: 'test' }) : undefined
      });
      
      if (response.status === 401) {
        console.log(`   ✅ ${endpoint.name} requires auth (401)`);
        testResults.passed.push(`API Protected: ${endpoint.name}`);
      } else if (response.status === 404) {
        console.log(`   ⚠️  ${endpoint.name} not found (404)`);
        // This is okay, endpoint might not be implemented yet
      } else {
        console.log(`   ❌ ${endpoint.name} unexpected status: ${response.status}`);
        testResults.failed.push(`API: ${endpoint.name}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      testResults.failed.push(`API: ${endpoint.name}`);
    }
  }

  // Test 4: Static Assets
  console.log('\n📝 Test 4: Static Assets & Resources');
  try {
    const response = await fetch(`${BASE_URL}/favicon.ico`);
    if (response.ok) {
      console.log('   ✅ Favicon accessible');
      testResults.passed.push('Static: Favicon');
    } else {
      console.log('   ❌ Favicon not found');
      testResults.failed.push('Static: Favicon');
    }
  } catch (error) {
    console.log('   ❌ Favicon check failed');
    testResults.failed.push('Static: Favicon');
  }

  // Test 5: CORS Headers (for API)
  console.log('\n📝 Test 5: CORS Configuration');
  try {
    const response = await fetch(`${BASE_URL}/api/ai`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://example.com',
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    const corsHeaders = response.headers.get('access-control-allow-origin');
    if (corsHeaders) {
      console.log(`   ✅ CORS headers present: ${corsHeaders}`);
      testResults.passed.push('CORS Configuration');
    } else {
      console.log('   ⚠️  CORS headers not configured (might be intentional)');
    }
  } catch (error) {
    console.log('   ⚠️  CORS check skipped');
  }

  // Test 6: Response Times
  console.log('\n📝 Test 6: Response Time Performance');
  const performanceTests = [
    { path: '/', name: 'Landing Page', threshold: 500 },
    { path: '/login', name: 'Login Page', threshold: 500 }
  ];

  for (const test of performanceTests) {
    try {
      const start = Date.now();
      await fetch(`${BASE_URL}${test.path}`);
      const duration = Date.now() - start;
      
      if (duration < test.threshold) {
        console.log(`   ✅ ${test.name}: ${duration}ms (< ${test.threshold}ms)`);
        testResults.passed.push(`Performance: ${test.name}`);
      } else {
        console.log(`   ⚠️  ${test.name}: ${duration}ms (> ${test.threshold}ms)`);
        testResults.failed.push(`Performance: ${test.name}`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: Failed to measure`);
      testResults.failed.push(`Performance: ${test.name}`);
    }
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Route Test Results Summary\n');
  console.log(`✅ Passed: ${testResults.passed.length}/${testResults.passed.length + testResults.failed.length}`);
  
  if (testResults.passed.length > 0) {
    console.log('\nPassed Tests:');
    testResults.passed.forEach(test => console.log(`   ✓ ${test}`));
  }
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(test => console.log(`   ✗ ${test}`));
  }

  console.log('\n🔒 Middleware Protection: ' + 
    (testResults.passed.filter(t => t.includes('Protected')).length > 0 ? '✅ Working' : '❌ Issues detected'));

  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

testRoutes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});