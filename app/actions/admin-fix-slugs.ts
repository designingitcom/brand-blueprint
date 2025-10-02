'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Admin action to generate slugs for all businesses that don't have one
 */
export async function adminGenerateMissingSlugs() {
  try {
    const supabase = await createClient();

    // Get all businesses without slugs or with empty slugs
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .or('slug.is.null,slug.eq.');

    if (fetchError) {
      console.error('❌ Failed to fetch businesses:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!businesses || businesses.length === 0) {
      return { success: true, message: 'No businesses need slug generation', updated: 0 };
    }

    console.log(`📋 Found ${businesses.length} businesses without slugs`);

    const updates = [];
    for (const business of businesses) {
      const slug = business.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      updates.push({ id: business.id, slug });
    }

    // Update all businesses with their generated slugs
    const updatePromises = updates.map(({ id, slug }) =>
      supabase
        .from('businesses')
        .update({ slug, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(updatePromises);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('❌ Some updates failed:', errors);
      return {
        success: false,
        error: `${errors.length} updates failed`,
        updated: results.length - errors.length
      };
    }

    console.log(`✅ Generated slugs for ${updates.length} businesses`);
    return {
      success: true,
      message: `Generated slugs for ${updates.length} businesses`,
      updated: updates.length,
      slugs: updates
    };

  } catch (error) {
    console.error('❌ Error in adminGenerateMissingSlugs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
