const { Client } = require('pg');

const connectionString = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function fixProjectsSchema() {
  try {
    await client.connect();
    console.log('Connected to database...');
    console.log('Fixing projects table schema to align with business-based architecture...\n');

    // Check current projects table structure
    console.log('1. Checking current projects table structure...');
    const currentSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position;
    `);
    
    console.log('   Current projects columns:');
    currentSchema.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    // Add missing fields to projects table
    console.log('\n2. Adding missing fields to projects table...');
    await client.query(`
      -- Add code field for project tracking (e.g., PROJ-001)
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS code TEXT;
      
      -- Add strategy mode field
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS strategy_mode TEXT 
      DEFAULT 'custom' 
      CHECK (strategy_mode IN ('custom', 'predefined', 'hybrid'));
      
      -- Add strategy path ID for predefined strategies
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS strategy_path_id UUID 
      REFERENCES strategy_paths(id);
      
      -- Add base project ID for project templates
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS base_project_id UUID 
      REFERENCES projects(id);
      
      -- Update status field to match our enum values (active, archived instead of not_started)
      ALTER TABLE projects 
      ALTER COLUMN status SET DEFAULT 'active';
      
      -- Add constraint for status field
      ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
      ALTER TABLE projects 
      ADD CONSTRAINT projects_status_check 
      CHECK (status IN ('active', 'archived', 'not_started', 'completed', 'paused'));
      
      -- Ensure business_id exists and is properly constrained
      ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_business_id_fkey;
      ALTER TABLE projects 
      ADD CONSTRAINT projects_business_id_fkey 
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    `);
    console.log('   ✅ Added missing fields to projects table');

    // Update existing projects to have proper status
    console.log('3. Updating existing projects with proper status...');
    await client.query(`
      UPDATE projects 
      SET status = 'active' 
      WHERE status = 'not_started' OR status IS NULL;
      
      UPDATE projects 
      SET strategy_mode = 'custom' 
      WHERE strategy_mode IS NULL;
    `);
    console.log('   ✅ Updated existing projects');

    // Verify the changes
    const updatedSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Updated projects table schema:');
    updatedSchema.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Check constraints
    const constraints = await client.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'projects';
    `);

    console.log('\n🔗 Projects table constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });

    console.log('\n✅ Projects schema updated successfully!');
    console.log('Next steps:');
    console.log('1. Update project actions to use business_id instead of client_id');
    console.log('2. Update project form to show business dropdown');
    console.log('3. Add module selection functionality');
    
  } catch (error) {
    console.error('Error fixing projects schema:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

fixProjectsSchema();