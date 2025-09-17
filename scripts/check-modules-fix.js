#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkAndFixModules() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking modules table structure...\n');

  // Try to query modules table to see what columns it has
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Error details:', error);
    
    if (error.code === 'PGRST204') {
      console.log('\n❌ Modules table exists but has wrong structure');
      console.log('The "code" column is missing\n');
      
      console.log('Please run this SQL to fix the modules table:\n');
      console.log(`
-- Fix modules table structure
ALTER TABLE modules ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Insert M0 and initial modules
INSERT INTO modules (code, name, description, category, sort_order) VALUES
('m0-onboarding', 'Business Onboarding', 'Complete business setup and team onboarding', 'foundation', 0),
('m1-core', 'Brand Foundation', 'Core brand identity and values', 'foundation', 1),
('m2-research', 'Market Research', 'Understanding your market and competitors', 'foundation', 2),
('m3-audience', 'Target Audience', 'Defining and understanding your ideal customers', 'strategy', 3),
('m4-positioning', 'Brand Positioning', 'Unique market position and differentiation', 'strategy', 4),
('m5-personality', 'Brand Personality', 'Human characteristics of your brand', 'strategy', 5)
ON CONFLICT (code) DO NOTHING;
      `);
    }
  } else {
    if (data && data.length === 0) {
      console.log('✅ Modules table exists and is empty');
      console.log('Structure looks good! Let me add M0 module...\n');
      
      // Try with minimal fields first
      const { error: insertError } = await supabase
        .from('modules')
        .insert({
          name: 'Business Onboarding'
        });
        
      if (insertError) {
        console.log('Insert error:', insertError);
        console.log('\nLet me check what columns are available...');
        
        // Get table structure via a different approach
        const { data: emptyQuery } = await supabase
          .from('modules')
          .select('*')
          .limit(0);
          
        console.log('Query result:', emptyQuery);
      } else {
        console.log('✅ Module created successfully!');
      }
    } else {
      console.log('Modules table data:', data);
    }
  }
}

checkAndFixModules().catch(console.error);