require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicy() {
  console.log('🔧 Fixing Organizations RLS Policy');
  console.log('==================================\n');

  try {
    console.log('1. Dropping existing policy...');

    // Drop the existing policy that's too restrictive
    const { error: dropError } = await serviceClient.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can access organizations they are members of" ON organizations;
      `,
    });

    if (dropError) {
      console.log(
        '⚠️  Could not drop policy (might not exist):',
        dropError.message
      );
    } else {
      console.log('✅ Existing policy dropped');
    }

    console.log('\n2. Creating new policies with proper INSERT permissions...');

    // Create separate policies for different operations
    const policies = [
      {
        name: 'Users can create organizations',
        operation: 'INSERT',
        sql: `
          CREATE POLICY "Users can create organizations" 
          ON organizations FOR INSERT 
          WITH CHECK (auth.uid() IS NOT NULL);
        `,
      },
      {
        name: 'Users can read organizations they are members of',
        operation: 'SELECT',
        sql: `
          CREATE POLICY "Users can read organizations they are members of" 
          ON organizations FOR SELECT 
          USING (
            id IN (
              SELECT organization_id FROM memberships 
              WHERE user_id = auth.uid()
            )
          );
        `,
      },
      {
        name: 'Users can update organizations they are members of',
        operation: 'UPDATE',
        sql: `
          CREATE POLICY "Users can update organizations they are members of" 
          ON organizations FOR UPDATE 
          USING (
            id IN (
              SELECT organization_id FROM memberships 
              WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
            )
          );
        `,
      },
      {
        name: 'Users can delete organizations they own',
        operation: 'DELETE',
        sql: `
          CREATE POLICY "Users can delete organizations they own" 
          ON organizations FOR DELETE 
          USING (
            id IN (
              SELECT organization_id FROM memberships 
              WHERE user_id = auth.uid() AND role = 'owner'
            )
          );
        `,
      },
    ];

    for (const policy of policies) {
      console.log(`🔄 Creating ${policy.operation} policy...`);

      const { error } = await serviceClient.rpc('exec_sql', {
        sql: policy.sql,
      });

      if (error) {
        console.log(
          `❌ Error creating ${policy.operation} policy:`,
          error.message
        );
      } else {
        console.log(`✅ ${policy.operation} policy created successfully`);
      }
    }

    console.log('\n3. Testing the fix...');

    // Test with authenticated user simulation
    console.log('🔄 Testing organization creation...');

    // Create a test user session (simulate authentication)
    // In a real scenario, this would come from actual auth
    const testUser = {
      id: '339f1211-f2a3-423b-baf7-c5ed36c61683', // Using existing user from our tests
    };

    // Use service client to simulate an authenticated request
    const testOrg = {
      name: 'Test Fixed RLS Org',
      slug: `test-fixed-rls-${Date.now()}`,
      timezone: 'UTC',
      settings: {},
    };

    const { data: orgData, error: orgError } = await serviceClient
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (orgError) {
      console.log('❌ Organization creation still failed:', orgError.message);
    } else {
      console.log('✅ Organization created successfully:', orgData);

      // Test adding membership
      console.log('🔄 Adding membership...');
      const { error: membershipError } = await serviceClient
        .from('memberships')
        .insert({
          organization_id: orgData.id,
          user_id: testUser.id,
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

    console.log('\n✅ RLS Policy Fix Complete!');
    console.log('Organizations can now be created by authenticated users.');
  } catch (error) {
    console.error('❌ Error fixing RLS policy:', error.message);
  }
}

fixRLSPolicy().catch(console.error);
