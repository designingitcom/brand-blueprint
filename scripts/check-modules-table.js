const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkModulesTable() {
  console.log('🔍 Checking modules table structure...');
  
  try {
    // Check if modules table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'modules');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('❌ Modules table does not exist');
      
      console.log('\n📋 Creating modules table...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS modules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          sort_order INTEGER DEFAULT 0,
          prerequisites TEXT[] DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          module_type TEXT CHECK (module_type IN ('standard', 'onboarding', 'assessment', 'custom')) DEFAULT 'standard',
          category TEXT CHECK (category IN ('strategy', 'brand', 'marketing', 'operations', 'finance', 'technology')) DEFAULT 'strategy',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS module_dependencies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
          depends_on_module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
          dependency_type TEXT CHECK (dependency_type IN ('requires', 'recommends', 'blocks')) DEFAULT 'requires',
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(module_id, depends_on_module_id)
        );

        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
          code TEXT NOT NULL,
          label TEXT NOT NULL,
          type TEXT CHECK (type IN ('text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'number', 'email', 'url', 'date')) DEFAULT 'text',
          required BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          options JSONB DEFAULT '[]',
          validation JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(module_id, code)
        );

        -- Add updated_at trigger for modules
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_modules_updated_at 
          BEFORE UPDATE ON modules 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_questions_updated_at 
          BEFORE UPDATE ON questions 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });

      if (createError) {
        console.error('Error creating tables:', createError);
        
        // Try alternative method - create tables individually
        console.log('🔄 Trying alternative table creation...');
        
        const { error: modulesError } = await supabase
          .from('modules')
          .select('id')
          .limit(1);

        if (modulesError && modulesError.code === '42P01') {
          console.log('Creating tables via raw SQL...');
          
          // Since we can't execute raw SQL easily, let's try to create some sample data
          // This will fail but give us info about what's missing
        }
      } else {
        console.log('✅ Tables created successfully');
      }
    } else {
      console.log('✅ Modules table exists');
    }

    // Check table structure
    console.log('\n🔍 Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'modules')
      .order('ordinal_position');

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else if (columns && columns.length > 0) {
      console.log('📋 Modules table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    // Try to fetch some data
    console.log('\n📊 Checking existing data...');
    const { data: modules, error: fetchError } = await supabase
      .from('modules')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching modules:', fetchError);
      
      if (fetchError.code === '42P01') {
        console.log('🚨 Table does not exist - needs to be created');
      }
    } else {
      console.log(`✅ Found ${modules?.length || 0} modules in database`);
      if (modules && modules.length > 0) {
        console.log('Sample modules:');
        modules.forEach(module => {
          console.log(`  - ${module.name} (${module.category}/${module.module_type})`);
        });
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkModulesTable().then(() => {
  console.log('\n✨ Check complete');
  process.exit(0);
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});