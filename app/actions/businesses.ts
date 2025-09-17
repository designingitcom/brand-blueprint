'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BusinessStatus } from '@/lib/utils/business-status';

export interface BusinessActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface CreateBusinessData {
  name: string;
  slug?: string;
  organization_id: string;
  type?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  status?: BusinessStatus;
  settings?: Record<string, any>;
}

export interface UpdateBusinessData {
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  status?: BusinessStatus;
  settings?: Record<string, any>;
}

export async function createBusiness(
  data: CreateBusinessData
): Promise<BusinessActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to create a business.' };
    }

    // Generate slug if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBusiness) {
      return { error: 'A business with this name already exists.' };
    }

    // Verify organization exists and user has access
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', data.organization_id)
      .single();

    if (orgError || !organization) {
      return { error: 'Organization not found or access denied.' };
    }

    // Ensure user exists in public.users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('User upsert error:', userError);
    }

    // Create the business
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        ...data,
        slug,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to create business. Please try again.' };
    }

    revalidatePath('/businesses');
    revalidatePath(`/organizations/${data.organization_id}`);
    return { success: true, data: business };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateBusiness(
  id: string,
  data: UpdateBusinessData
): Promise<BusinessActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to update a business.' };
    }

    // Check if business exists and user has permission
    const { data: existingBusiness, error: fetchError } = await supabase
      .from('businesses')
      .select('id, user_id, organization_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingBusiness) {
      return { error: 'Business not found.' };
    }

    if (existingBusiness.user_id !== user.id) {
      return { error: 'You do not have permission to update this business.' };
    }

    // If slug is being updated, check if it already exists
    if (data.slug) {
      const { data: slugCheck } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', id)
        .single();

      if (slugCheck) {
        return { error: 'A business with this slug already exists.' };
      }
    }

    // Update the business
    const { data: business, error } = await supabase
      .from('businesses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to update business. Please try again.' };
    }

    revalidatePath('/businesses');
    revalidatePath(`/businesses/${business.slug}`);
    revalidatePath(`/organizations/${existingBusiness.organization_id}`);
    return { success: true, data: business };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteBusiness(
  id: string
): Promise<BusinessActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to delete a business.' };
    }

    // Check if business exists and user has permission
    const { data: existingBusiness, error: fetchError } = await supabase
      .from('businesses')
      .select('id, user_id, organization_id, slug')
      .eq('id', id)
      .single();

    if (fetchError || !existingBusiness) {
      return { error: 'Business not found.' };
    }

    if (existingBusiness.user_id !== user.id) {
      return { error: 'You do not have permission to delete this business.' };
    }

    // Check if business has projects (optional - prevent deletion if has projects)
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('business_id', id)
      .limit(1);

    if (projects && projects.length > 0) {
      return {
        error:
          'Cannot delete business with existing projects. Please delete all projects first.',
      };
    }

    // Delete the business
    const { error } = await supabase.from('businesses').delete().eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to delete business. Please try again.' };
    }

    revalidatePath('/businesses');
    revalidatePath(`/organizations/${existingBusiness.organization_id}`);
    return { success: true };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getBusinesses(): Promise<BusinessActionResult> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'You must be logged in to view businesses.' };
    }

    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Failed to fetch businesses.' };
    }

    // Get organizations separately to avoid join issues
    // Don't filter by user_id here - we need ALL organizations to match
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id, name, slug');

    // Map organizations to businesses
    const businessesWithOrganizations = businesses?.map(business => ({
      ...business,
      organization: organizations?.find(org => org.id === business.organization_id)
    })) || [];

    return { success: true, data: businessesWithOrganizations };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getBusiness(slugOrId: string): Promise<BusinessActionResult> {
  try {
    const supabase = await createClient();

    // Check if the parameter looks like a UUID (ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);
    
    let query = supabase.from('businesses').select('*');

    if (isUUID) {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { data: business, error } = await query.single();

    if (error) {
      console.error('Database error:', error);
      return { error: 'Business not found.' };
    }

    // Get organization separately
    let businessWithOrganization = business;
    if (business?.organization_id) {
      const { data: organization } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', business.organization_id)
        .single();
      
      businessWithOrganization = {
        ...business,
        organization
      };
    }

    return { success: true, data: businessWithOrganization };
  } catch (error) {
    console.error('Server error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
