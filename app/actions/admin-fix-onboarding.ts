'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Admin action to manually mark a business as onboarding completed
 * This is a one-time fix for businesses completed before we added the completion tracking
 */
export async function adminMarkOnboardingComplete(businessName: string) {
  try {
    const supabase = await createClient();

    // First add the column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE businesses
        ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
      `
    });

    if (alterError) {
      console.log('Column may already exist or using direct update instead');
    }

    // Update the business
    const { data, error } = await supabase
      .from('businesses')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('name', businessName)
      .select();

    if (error) {
      console.error('❌ Failed to update business:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Marked "${businessName}" as completed:`, data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Error in adminMarkOnboardingComplete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
