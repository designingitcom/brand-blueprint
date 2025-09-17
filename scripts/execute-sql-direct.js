#!/usr/bin/env node
/**
 * Direct SQL Execution via Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function executeSQLCommands() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🚀 Executing SQL commands via Supabase...\n');

  // Test if onboarding_completed field exists
  console.log('1️⃣ Checking if onboarding_completed field exists...');
  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1);
    
  if (bizError) {
    console.error('Error:', bizError);
    return;
  }

  if (businesses && businesses.length > 0) {
    const columns = Object.keys(businesses[0]);
    console.log('Current business columns:', columns);
    
    if (columns.includes('onboarding_completed')) {
      console.log('✅ onboarding_completed field already exists!\n');
      
      // Now let's update the values based on business completeness
      console.log('2️⃣ Updating onboarding_completed values...');
      
      // Get all businesses
      const { data: allBusinesses, error: allError } = await supabase
        .from('businesses')
        .select('*');
        
      if (allError) {
        console.error('Error fetching businesses:', allError);
        return;
      }
      
      // Update each business
      for (const business of allBusinesses) {
        const hasDescription = business.description && business.description.trim().length > 10;
        const hasWebsite = business.website && business.website.trim().length > 0;
        const shouldBeCompleted = hasDescription || hasWebsite;
        
        if (business.onboarding_completed !== shouldBeCompleted) {
          const { error: updateError } = await supabase
            .from('businesses')
            .update({ onboarding_completed: shouldBeCompleted })
            .eq('id', business.id);
            
          if (updateError) {
            console.error(`Failed to update ${business.name}:`, updateError);
          } else {
            console.log(`✅ Updated ${business.name}: onboarding_completed = ${shouldBeCompleted}`);
          }
        }
      }
      
      console.log('\n3️⃣ Verifying updates...');
      const { data: updatedBusinesses } = await supabase
        .from('businesses')
        .select('name, onboarding_completed, description, website');
        
      console.log('\nBusiness Onboarding Status:');
      updatedBusinesses.forEach(b => {
        console.log(`- ${b.name}: ${b.onboarding_completed ? '✅ Completed' : '🔄 In Progress'}`);
      });
      
    } else {
      console.log('❌ onboarding_completed field does not exist yet');
      console.log('Please run this SQL in Supabase Dashboard:');
      console.log('ALTER TABLE businesses ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;');
    }
  }

  // Check organizations table
  console.log('\n4️⃣ Checking organizations table...');
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .limit(1);
    
  if (orgError) {
    console.log('❌ Organizations table error:', orgError.message);
  } else if (orgs && orgs.length > 0) {
    const orgColumns = Object.keys(orgs[0]);
    console.log('Organization columns:', orgColumns);
    
    if (orgColumns.includes('quickbooks_customer_id')) {
      console.log('✅ Integration fields already exist!');
    } else {
      console.log('❌ Integration fields missing');
      console.log('Please add them via SQL Editor');
    }
  }

  // Check if modules table exists
  console.log('\n5️⃣ Checking modules table...');
  const { data: modules, error: modError } = await supabase
    .from('modules')
    .select('*');
    
  if (modError) {
    console.log('❌ Modules table does not exist:', modError.message);
    console.log('Need to create modules table for M0-M21 system');
  } else {
    console.log(`✅ Modules table exists with ${modules.length} modules`);
    
    const m0 = modules.find(m => m.code === 'm0-onboarding');
    if (m0) {
      console.log('✅ M0 onboarding module exists');
    } else {
      console.log('❌ M0 onboarding module missing');
      
      // Try to create it
      console.log('Creating M0 module...');
      const { error: createError } = await supabase
        .from('modules')
        .insert({
          code: 'm0-onboarding',
          name: 'Business Onboarding',
          description: 'Complete business setup and team onboarding',
          category: 'foundation',
          sort_order: 0
        });
        
      if (createError) {
        console.error('Failed to create M0:', createError);
      } else {
        console.log('✅ M0 module created successfully!');
      }
    }
  }
  
  console.log('\n✅ SQL execution complete!');
}

executeSQLCommands().catch(console.error);