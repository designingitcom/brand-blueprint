'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Run database migration to fix business_type constraint
 * This is a one-time migration that can be executed via the app
 */
export async function runBusinessTypeConstraintMigration() {
  try {
    const supabase = await createClient();

    // Drop old constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE businesses
        DROP CONSTRAINT IF EXISTS businesses_business_type_check;
      `
    });

    if (dropError) {
      console.error('❌ Error dropping old constraint:', dropError);
    }

    // Add new constraint with all valid values
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE businesses
        ADD CONSTRAINT businesses_business_type_check
        CHECK (business_type IN (
          'B2B',
          'B2C',
          'B2B2C',
          'Marketplace',
          'Non-profit',
          'SaaS',
          'E-commerce',
          'Professional Services',
          'Agency',
          'Consulting',
          'Healthcare',
          'Education',
          'Manufacturing',
          'Retail',
          'Restaurant/Hospitality',
          'Real Estate',
          'Financial Services',
          'Technology/Software',
          'Other'
        ) OR business_type IS NULL);
      `
    });

    if (addError) {
      console.error('❌ Error adding new constraint:', addError);
      return {
        success: false,
        error: addError.message
      };
    }

    console.log('✅ Successfully updated business_type constraint');
    return {
      success: true,
      message: 'business_type constraint updated successfully'
    };

  } catch (error) {
    console.error('❌ Migration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
