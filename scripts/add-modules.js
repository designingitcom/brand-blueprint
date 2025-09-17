#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function addModules() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🚀 Adding M0-M5 modules to the system...\n');

  const modules = [
    {
      name: 'Business Onboarding',
      slug: 'm0-onboarding',
      description: 'Complete business setup and team onboarding',
      sort_order: 0,
      module_type: 'standard',
      category: 'foundation'
    },
    {
      name: 'Brand Foundation',
      slug: 'm1-core',
      description: 'Core brand identity and values',
      sort_order: 1,
      module_type: 'standard',
      category: 'brand'
    },
    {
      name: 'Market Research',
      slug: 'm2-research',
      description: 'Understanding your market and competitors',
      sort_order: 2,
      module_type: 'standard',
      category: 'brand'
    },
    {
      name: 'Target Audience',
      slug: 'm3-audience',
      description: 'Defining and understanding your ideal customers',
      sort_order: 3,
      module_type: 'standard',
      category: 'customer'
    },
    {
      name: 'Brand Positioning',
      slug: 'm4-positioning',
      description: 'Unique market position and differentiation',
      sort_order: 4,
      module_type: 'standard',
      category: 'brand'
    },
    {
      name: 'Brand Personality',
      slug: 'm5-personality',
      description: 'Human characteristics of your brand',
      sort_order: 5,
      module_type: 'standard',
      category: 'brand'
    }
  ];

  for (const module of modules) {
    const { data, error } = await supabase
      .from('modules')
      .insert(module)
      .select();
      
    if (error) {
      console.error(`❌ Failed to add ${module.name}:`, error.message);
    } else {
      console.log(`✅ Added: ${module.name} (${module.slug})`);
    }
  }

  // Verify modules were added
  console.log('\n📊 Verifying modules...');
  const { data: allModules, error: fetchError } = await supabase
    .from('modules')
    .select('name, slug, category, sort_order')
    .order('sort_order');
    
  if (fetchError) {
    console.error('Error fetching modules:', fetchError);
  } else {
    console.log('\nInstalled Modules:');
    allModules.forEach(m => {
      console.log(`  ${m.sort_order}. ${m.name} (${m.slug}) - ${m.category}`);
    });
    
    console.log(`\n✅ Total modules: ${allModules.length}`);
    
    const m0 = allModules.find(m => m.slug === 'm0-onboarding');
    if (m0) {
      console.log('🎯 M0 Onboarding module is ready!');
    }
  }
}

addModules().catch(console.error);