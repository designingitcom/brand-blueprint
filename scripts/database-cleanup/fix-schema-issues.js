const { Client } = require('pg');

const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function fixSchemaIssues() {
  try {
    await client.connect();
    console.log('Connected to database...');
    console.log('Fixing critical schema issues...\n');

    // Fix 1: Sync users first, then update memberships constraint
    console.log('1. Syncing users from auth.users to public.users first...');
    await client.query(`
      -- Insert any missing users from auth.users to public.users
      INSERT INTO public.users (id, email, name)
      SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('   ✅ Users synced first');

    console.log('2. Fixing memberships.user_id foreign key...');
    await client.query(`
      -- Drop the existing foreign key constraint
      ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;
      
      -- Add new constraint pointing to public.users
      ALTER TABLE memberships ADD CONSTRAINT memberships_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    `);
    console.log('   ✅ Fixed memberships.user_id to reference public.users');

    // Fix 2: Update memberships.invited_by to reference public.users
    console.log('3. Fixing memberships.invited_by foreign key...');
    await client.query(`
      -- Drop the existing foreign key constraint
      ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_invited_by_fkey;
      
      -- Add new constraint pointing to public.users
      ALTER TABLE memberships ADD CONSTRAINT memberships_invited_by_fkey 
      FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL;
    `);
    console.log('   ✅ Fixed memberships.invited_by to reference public.users');

    // Fix 3: Ensure businesses.organization_id is properly set up
    console.log('4. Checking businesses.organization_id setup...');
    await client.query(`
      -- Make sure organization_id constraint exists
      ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_organization_id_fkey;
      ALTER TABLE businesses ADD CONSTRAINT businesses_organization_id_fkey 
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);
    console.log('   ✅ Businesses.organization_id constraint verified');

    // Fix 4: Final user sync check
    console.log('5. Final user sync check...');
    const syncResult = await client.query(`
      SELECT COUNT(*) as synced_users FROM public.users;
    `);
    console.log(`   ✅ Total users in public.users: ${syncResult.rows[0].synced_users}`);

    // Check results
    const userCount = await client.query('SELECT COUNT(*) FROM public.users');
    const membershipCount = await client.query('SELECT COUNT(*) FROM memberships');
    const businessCount = await client.query('SELECT COUNT(*) FROM businesses');
    
    console.log(`\n📊 Current counts:`);
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Memberships: ${membershipCount.rows[0].count}`);  
    console.log(`   - Businesses: ${businessCount.rows[0].count}`);

    console.log('\n✅ Schema fixes completed successfully!');
    console.log('Your app should now work properly with CRUD operations.');
    
  } catch (error) {
    console.error('Error fixing schema:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

fixSchemaIssues();