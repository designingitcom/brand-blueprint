const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://xigzapsughpuqjxttsra.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3phcHN1Z2hwdXFqeHR0c3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTAwMjEsImV4cCI6MjA3MjEyNjAyMX0.yePAeHxk-u2gWrKaybbXjFh0BQLt5JaYuhkIqIqcFK0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

console.log('🧪 Starting Authentication Flow Tests\n');
console.log('=====================================\n');

async function runTests() {
  let testResults = {
    passed: [],
    failed: []
  };

  // Test 1: Sign Up
  console.log('📝 Test 1: User Sign Up');
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (signUpError) throw signUpError;
    
    console.log('✅ Sign up successful');
    console.log(`   User ID: ${signUpData.user?.id}`);
    console.log(`   Email: ${signUpData.user?.email}`);
    testResults.passed.push('Sign Up');
  } catch (error) {
    console.log('❌ Sign up failed:', error.message);
    testResults.failed.push('Sign Up');
  }

  // Test 2: Sign In
  console.log('\n📝 Test 2: User Sign In');
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    
    console.log('✅ Sign in successful');
    console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
    console.log(`   Access Token: ${signInData.session?.access_token ? 'Present' : 'Missing'}`);
    testResults.passed.push('Sign In');
  } catch (error) {
    console.log('❌ Sign in failed:', error.message);
    testResults.failed.push('Sign In');
  }

  // Test 3: Get Current User
  console.log('\n📝 Test 3: Get Current User');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    console.log('✅ Current user retrieved');
    console.log(`   User ID: ${user?.id}`);
    console.log(`   Email: ${user?.email}`);
    console.log(`   Metadata: ${JSON.stringify(user?.user_metadata)}`);
    testResults.passed.push('Get Current User');
  } catch (error) {
    console.log('❌ Get user failed:', error.message);
    testResults.failed.push('Get Current User');
  }

  // Test 4: Password Reset Request
  console.log('\n📝 Test 4: Password Reset Request');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:3001/reset-password',
    });

    if (error) throw error;
    
    console.log('✅ Password reset email sent');
    console.log('   Note: Email will only be sent to verified domains in production');
    testResults.passed.push('Password Reset Request');
  } catch (error) {
    console.log('❌ Password reset failed:', error.message);
    testResults.failed.push('Password Reset Request');
  }

  // Test 5: Sign Out
  console.log('\n📝 Test 5: Sign Out');
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    console.log('✅ Sign out successful');
    testResults.passed.push('Sign Out');
  } catch (error) {
    console.log('❌ Sign out failed:', error.message);
    testResults.failed.push('Sign Out');
  }

  // Test 6: Verify User is Signed Out
  console.log('\n📝 Test 6: Verify Sign Out');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user) {
      throw new Error('User still authenticated after sign out');
    }
    
    console.log('✅ User successfully signed out');
    testResults.passed.push('Verify Sign Out');
  } catch (error) {
    if (error.message.includes('not authenticated')) {
      console.log('✅ User successfully signed out');
      testResults.passed.push('Verify Sign Out');
    } else {
      console.log('❌ Sign out verification failed:', error.message);
      testResults.failed.push('Verify Sign Out');
    }
  }

  // Test 7: Database Access
  console.log('\n📝 Test 7: Database Table Access');
  try {
    // First sign in again
    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    const { data, error } = await supabase
      .from('businesses')
      .select('*');
    
    if (error) throw error;
    
    console.log('✅ Database access successful');
    console.log(`   Businesses found: ${data.length}`);
    testResults.passed.push('Database Access');
  } catch (error) {
    console.log('❌ Database access failed:', error.message);
    testResults.failed.push('Database Access');
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Test Results Summary\n');
  console.log(`✅ Passed: ${testResults.passed.length}/${testResults.passed.length + testResults.failed.length}`);
  testResults.passed.forEach(test => console.log(`   ✓ ${test}`));
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(test => console.log(`   ✗ ${test}`));
  }

  // Cleanup - Delete test user
  console.log('\n🧹 Cleaning up test data...');
  try {
    // Sign in as service role would be needed to delete user
    // For now, just sign out
    await supabase.auth.signOut();
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error.message);
  }

  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});