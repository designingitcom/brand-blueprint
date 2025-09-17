const { createClient } = require('@supabase/supabase-js');

// Database migration to update project status enum
async function fixProjectStatusEnum() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔄 Updating project status enum...');

  try {
    // Update the status enum to include proper lifecycle states
    const { error: enumError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing check constraint if it exists
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
        
        -- Add new check constraint with proper project lifecycle statuses
        ALTER TABLE projects 
        ADD CONSTRAINT projects_status_check 
        CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'on_hold'));

        -- Update any existing 'active' projects to 'pending'
        UPDATE projects 
        SET status = 'pending' 
        WHERE status = 'active';

        -- Update any existing 'archived' projects to 'completed'
        UPDATE projects 
        SET status = 'completed' 
        WHERE status = 'archived';
      `
    });

    if (enumError) {
      console.error('❌ Error updating status enum:', enumError);
      return;
    }

    console.log('✅ Project status enum updated successfully');
    console.log('   - Added: pending, in_progress, review, completed, on_hold');
    console.log('   - Migrated: active → pending, archived → completed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  fixProjectStatusEnum();
}

module.exports = { fixProjectStatusEnum };