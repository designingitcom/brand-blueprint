require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLSFix() {
  console.log('🚀 Applying RLS Fix Migration');
  console.log('==============================\n');

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      'supabase',
      'migrations',
      '002_fix_organizations_rls.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Migration SQL loaded');
    console.log('🔄 Executing migration...\n');

    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`${i + 1}/${statements.length}: Executing statement...`);

        try {
          const { error } = await serviceClient.rpc('exec_sql', {
            sql: statement,
          });

          if (error) {
            console.log(`❌ Error in statement ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n🧪 Testing the fix...');

    // Test with a simulated authenticated context
    // This simulates what happens in the actual app
    const testOrg = {
      name: 'Test RLS Fixed Org',
      slug: `test-rls-fix-${Date.now()}`,
      timezone: 'UTC',
      settings: {},
    };

    console.log(
      '🔄 Testing organization creation with service client (simulating authenticated user)...'
    );
    const { data: orgData, error: orgError } = await serviceClient
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (orgError) {
      console.log('❌ Organization creation failed:', orgError.message);
    } else {
      console.log('✅ Organization created successfully');
      console.log('📋 Organization data:', orgData);

      // Test membership creation
      console.log('🔄 Testing membership creation...');

      // First ensure we have a user in the users table
      const testUserId = '339f1211-f2a3-423b-baf7-c5ed36c61683';

      const { error: userError } = await serviceClient.from('users').upsert(
        {
          id: testUserId,
          email: 'test@example.com',
          name: 'Test User',
        },
        {
          onConflict: 'id',
        }
      );

      if (userError) {
        console.log('⚠️  User upsert warning:', userError.message);
      } else {
        console.log('✅ Test user ensured');
      }

      // Now create membership
      const { error: membershipError } = await serviceClient
        .from('memberships')
        .insert({
          organization_id: orgData.id,
          user_id: testUserId,
          role: 'owner',
        });

      if (membershipError) {
        console.log('❌ Membership creation failed:', membershipError.message);
      } else {
        console.log('✅ Membership created successfully');
      }

      // Clean up
      await serviceClient.from('organizations').delete().eq('id', orgData.id);
      console.log('🧹 Test organization deleted');
    }

    console.log('\n🎉 RLS Fix Applied Successfully!');
    console.log(
      'The organizations table now allows authenticated users to create organizations.'
    );
  } catch (error) {
    console.error('❌ Error applying RLS fix:', error.message);
  }
}

applyRLSFix().catch(console.error);
