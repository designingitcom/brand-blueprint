'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Admin action to manually set organization for a business
 * Only accessible by admin users
 */
export async function setBusinessOrganization(businessId: string, organizationId: string | null) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin (you can modify this check based on your auth setup)
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = membership?.role === 'admin' || membership?.role === 'owner';

    if (!isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    // Update business organization
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        organization_id: organizationId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (updateError) {
      console.error('❌ Failed to update business organization:', updateError);
      return { success: false, error: 'Failed to update organization' };
    }

    console.log(`✅ Updated business ${businessId} organization to ${organizationId || 'null'}`);

    return {
      success: true,
      message: `Business organization ${organizationId ? 'updated' : 'removed'} successfully`,
    };

  } catch (error) {
    console.error('❌ Error setting business organization:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Admin action to get all businesses with their organizations
 */
export async function getAllBusinessesWithOrganizations() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        organization:organizations(id, name),
        user:users(id, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch businesses:', error);
      return { success: false, error: 'Failed to fetch businesses', businesses: [] };
    }

    return {
      success: true,
      businesses: data || [],
    };

  } catch (error) {
    console.error('❌ Error fetching businesses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      businesses: [],
    };
  }
}

/**
 * Get all organizations for dropdown selection
 */
export async function getAllOrganizations() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('❌ Failed to fetch organizations:', error);
      return { success: false, error: 'Failed to fetch organizations', organizations: [] };
    }

    return {
      success: true,
      organizations: data || [],
    };

  } catch (error) {
    console.error('❌ Error fetching organizations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      organizations: [],
    };
  }
}
