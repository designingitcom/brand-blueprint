'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Get all organizations the current user belongs to
 * Used for organization selection during business creation
 */
export async function getUserOrganizations() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated', organizations: [] };
    }

    // Get user's organizations through memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select(`
        organization_id,
        role,
        organization:organizations(id, name)
      `)
      .eq('user_id', user.id);

    if (membershipError) {
      console.error('❌ Failed to fetch user organizations:', membershipError);
      return { success: false, error: 'Failed to fetch organizations', organizations: [] };
    }

    const organizations = memberships
      .filter(m => m.organization)
      .map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
      }));

    console.log(`✅ Found ${organizations.length} organization(s) for user ${user.id}`);

    return {
      success: true,
      organizations,
    };

  } catch (error) {
    console.error('❌ Error fetching user organizations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      organizations: [],
    };
  }
}
