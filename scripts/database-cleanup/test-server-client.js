require('dotenv').config();

// Import the server client configuration
const { createServerClient } = require('@supabase/ssr');

// Mock Next.js cookies for testing
class MockCookieStore {
  constructor() {
    this.store = new Map();
  }

  get(name) {
    return this.store.has(name) ? { value: this.store.get(name) } : undefined;
  }

  set(name, value, options) {
    this.store.set(name, value);
  }

  remove(name, options) {
    this.store.delete(name);
  }
}

async function testServerClient() {
  console.log('🧪 Testing Server Client Configuration');
  console.log('====================================\n');

  const mockCookieStore = new MockCookieStore();

  // Create server client exactly as in server.ts
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return mockCookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            mockCookieStore.set(name, value, options);
          } catch {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name, options) {
          try {
            mockCookieStore.set(name, '', options);
          } catch {
            // The `remove` method was called from a Server Component.
          }
        },
      },
    }
  );

  console.log('1. Testing basic server client connection...');

  // Test 1: Basic connection
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Server client error:', error.message);
    } else {
      console.log('✅ Server client works! Data:', data);
    }
  } catch (err) {
    console.log('❌ Server client exception:', err.message);
  }

  console.log('\n2. Testing with authentication context...');

  // Test 2: With auth (simulate a logged-in user)
  try {
    // First check current auth status
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log(
      'Auth status:',
      authError
        ? `Error: ${authError.message}`
        : `User: ${authData.user?.email || 'No user'}`
    );

    // Try to create an organization like the app does
    const testOrg = {
      name: 'Test Server Client Org',
      slug: `test-server-${Date.now()}`,
      timezone: 'UTC',
      settings: {},
    };

    console.log('🔄 Attempting organization creation via server client...');
    const { data: createData, error: createError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (createError) {
      console.log('❌ Server client create error:', createError.message);
      console.log('📋 Full error:', createError);
    } else {
      console.log('✅ Organization created via server client:', createData);

      // Clean up
      await supabase.from('organizations').delete().eq('id', createData.id);
      console.log('🧹 Test organization deleted');
    }
  } catch (err) {
    console.log('❌ Server client auth exception:', err.message);
  }

  console.log('\n3. Testing service client...');

  // Test 3: Service client (should always work)
  const serviceClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { data, error } = await serviceClient
      .from('organizations')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Service client error:', error.message);
    } else {
      console.log('✅ Service client works! Data:', data);
    }
  } catch (err) {
    console.log('❌ Service client exception:', err.message);
  }
}

testServerClient().catch(console.error);
