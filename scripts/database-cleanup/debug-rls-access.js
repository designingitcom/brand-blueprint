require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugRLSAccess() {
  console.log('🔍 Debug RLS Access Patterns');
  console.log('============================\n');

  // Test different operations with detailed error reporting
  console.log('🔄 Testing anonymous SELECT on organizations...');
  try {
    const { data, error, count } = await anonClient
      .from('organizations')
      .select('id', { count: 'exact' });

    console.log('Result:', { data, error, count });

    if (error) {
      console.log('❌ SELECT blocked:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('❌ SELECT unexpectedly allowed');
      console.log('Data returned:', data);
    }
  } catch (err) {
    console.log('❌ SELECT exception:', err.message);
  }

  console.log('\n🔄 Testing anonymous INSERT on organizations...');
  try {
    const { data, error } = await anonClient.from('organizations').insert({
      name: 'Debug Test Org',
      slug: `debug-test-${Date.now()}`,
      timezone: 'UTC',
    });

    console.log('Result:', { data, error });

    if (error) {
      console.log('✅ INSERT properly blocked:', error.message);
    } else {
      console.log('❌ INSERT unexpectedly allowed');
    }
  } catch (err) {
    console.log('❌ INSERT exception:', err.message);
  }

  // Check auth state
  console.log('\n🔄 Checking auth state...');
  const {
    data: { user },
  } = await anonClient.auth.getUser();
  console.log('Auth user:', user);
  console.log('Auth uid:', user?.id || 'null');

  // Test with a table that might have different behavior
  console.log('\n🔄 Testing anonymous SELECT on users...');
  try {
    const { data, error, count } = await anonClient
      .from('users')
      .select('id', { count: 'exact' });

    if (error) {
      console.log('✅ Users SELECT properly blocked:', error.message);
    } else {
      console.log('❌ Users SELECT unexpectedly allowed, count:', count);
    }
  } catch (err) {
    console.log('❌ Users SELECT exception:', err.message);
  }
}

debugRLSAccess().catch(console.error);
