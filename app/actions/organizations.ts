'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface OrganizationActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  website?: string;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  timezone?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'archived';
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  website?: string;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  timezone?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'archived';
  settings?: Record<string, any>;
}

export interface InviteUserData {
  email: string;
  role:
    | 'owner'
    | 'admin'
    | 'strategist'
    | 'client_owner'
    | 'client_editor'
    | 'viewer';
}

// Helper function to generate unique slug from name
async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const supabase = await createClient();

  // Basic slug generation
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) baseSlug = 'organization';

  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .neq('id', excludeId || '')
      .single();

    if (error && error.code === 'PGRST116') {
      // No match found, slug is unique
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

export async function createOrganization(
  data: CreateOrganizationData
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Generate unique slug if not provided
    const slug = data.slug || (await generateUniqueSlug(data.name));

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug,
        website: data.website,
        industry: data.industry,
        company_size: data.company_size,
        timezone: data.timezone || 'UTC',
        settings: {},
      })
      .select()
      .single();

    if (orgError) {
      return { error: orgError.message };
    }

    // Add creator as owner
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
      });

    if (membershipError) {
      // Cleanup: delete the organization if membership creation fails
      await supabase.from('organizations').delete().eq('id', organization.id);
      return { error: 'Failed to create organization membership' };
    }

    // Create user record if it doesn't exist
    const { error: userInsertError } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: user.email!,
        name:
          user.user_metadata?.full_name ||
          `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
          null,
        avatar_url: user.user_metadata?.avatar_url,
      },
      {
        onConflict: 'id',
        ignoreDuplicates: false,
      }
    );

    if (userInsertError) {
      console.error('Failed to create user record:', userInsertError);
      // Don't fail the organization creation for this
    }

    revalidatePath('/', 'layout');
    return { success: true, data: organization };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getOrganizations(): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Ensure user exists in public.users table
    const { error: userUpsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      }, {
        onConflict: 'id'
      });

    if (userUpsertError) {
      console.error('User upsert error in getOrganizations:', userUpsertError);
    }

    const { data: organizations, error } = await supabase
      .from('organizations')
      .select(
        `
        *,
        memberships!inner(role),
        businesses:businesses(id, name, status, status_enum, onboarding_completed, onboarding_started_at, onboarding_current_step, created_at)
      `
      )
      .eq('memberships.user_id', user.id);

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: organizations };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getOrganization(
  idOrSlug: string
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Try to find by slug first, then by ID
    let query = supabase
      .from('organizations')
      .select(
        `
        *,
        memberships!inner(role),
        businesses(id, name, slug, status, status_enum, onboarding_completed, onboarding_started_at, onboarding_current_step, created_at)
      `
      )
      .eq('memberships.user_id', user.id);

    // Check if it's a UUID (ID) or a slug
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    if (isUUID) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: organization, error } = await query.single();

    if (error) {
      return { error: error.message };
    }

    // Fetch memberships separately to avoid relationship conflicts
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select(
        `
        id,
        role,
        created_at,
        users(id, name, email, avatar_url)
      `
      )
      .eq('organization_id', organization.id);

    if (membershipsError) {
      console.warn('Could not fetch memberships:', membershipsError.message);
    }

    // Add memberships to organization data
    const organizationWithMemberships = {
      ...organization,
      memberships_all: memberships || [],
    };

    return { success: true, data: organizationWithMemberships };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateOrganization(
  id: string,
  updates: UpdateOrganizationData
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if user is admin or owner
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single();

    if (
      membershipError ||
      !membership ||
      !['owner', 'admin'].includes(membership.role)
    ) {
      return { error: 'Insufficient permissions' };
    }

    // Generate unique slug if slug is being updated
    const updateData: any = { ...updates };
    if (updates.slug) {
      updateData.slug = await generateUniqueSlug(updates.slug, id);
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: organization };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function deleteOrganization(
  id: string
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if user is owner
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership || membership.role !== 'owner') {
      return { error: 'Only organization owners can delete organizations' };
    }

    // Delete organization (cascades will handle related data)
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function inviteUserToOrganization(
  organizationId: string,
  inviteData: InviteUserData
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if user is admin or owner
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (
      membershipError ||
      !membership ||
      !['owner', 'admin'].includes(membership.role)
    ) {
      return { error: 'Insufficient permissions to invite users' };
    }

    // Generate invite token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Create invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        organization_id: organizationId,
        email: inviteData.email,
        role: inviteData.role,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      return { error: inviteError.message };
    }

    // TODO: Send invite email
    // await sendInviteEmail(inviteData.email, token, organizationName);

    return {
      success: true,
      data: {
        invite,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
      },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if user has access to this organization
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return { error: 'Access denied' };
    }

    const { data: members, error } = await supabase
      .from('memberships')
      .select(
        `
        id,
        role,
        created_at,
        users(id, name, email, avatar_url, last_login_at)
      `
      )
      .eq('organization_id', organizationId);

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: members };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateMemberRole(
  membershipId: string,
  newRole:
    | 'owner'
    | 'admin'
    | 'strategist'
    | 'client_owner'
    | 'client_editor'
    | 'viewer'
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Get the membership to update and verify permissions
    const { data: targetMembership, error: targetError } = await supabase
      .from('memberships')
      .select('organization_id, user_id')
      .eq('id', membershipId)
      .single();

    if (targetError || !targetMembership) {
      return { error: 'Membership not found' };
    }

    // Check if current user is admin or owner of the organization
    const { data: userMembership, error: userMembershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', targetMembership.organization_id)
      .eq('user_id', user.id)
      .single();

    if (
      userMembershipError ||
      !userMembership ||
      !['owner', 'admin'].includes(userMembership.role)
    ) {
      return { error: 'Insufficient permissions' };
    }

    // Update the membership role
    const { data: updatedMembership, error } = await supabase
      .from('memberships')
      .update({ role: newRole })
      .eq('id', membershipId)
      .select(
        `
        id,
        role,
        users(id, name, email)
      `
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: updatedMembership };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function removeMember(
  membershipId: string
): Promise<OrganizationActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Get the membership to remove and verify permissions
    const { data: targetMembership, error: targetError } = await supabase
      .from('memberships')
      .select('organization_id, user_id, role')
      .eq('id', membershipId)
      .single();

    if (targetError || !targetMembership) {
      return { error: 'Membership not found' };
    }

    // Prevent removing the last owner
    if (targetMembership.role === 'owner') {
      const { data: ownerCount, error: ownerCountError } = await supabase
        .from('memberships')
        .select('id', { count: 'exact' })
        .eq('organization_id', targetMembership.organization_id)
        .eq('role', 'owner');

      if (ownerCountError || (ownerCount?.length || 0) <= 1) {
        return { error: 'Cannot remove the last owner of an organization' };
      }
    }

    // Check if current user is admin/owner or removing themselves
    const { data: userMembership, error: userMembershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', targetMembership.organization_id)
      .eq('user_id', user.id)
      .single();

    const canRemove =
      (userMembership && ['owner', 'admin'].includes(userMembership.role)) ||
      targetMembership.user_id === user.id;

    if (userMembershipError || !canRemove) {
      return { error: 'Insufficient permissions' };
    }

    // Remove the membership
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membershipId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');

    // If user removed themselves, redirect to organizations list
    if (targetMembership.user_id === user.id) {
      redirect('/organizations');
    }

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
