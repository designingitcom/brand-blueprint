'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ClientActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface CreateClientData {
  organization_id: string;
  name: string;
  slug?: string;
  industry?: string;
  website?: string;
  locale?: string;
}

export interface UpdateClientData {
  name?: string;
  slug?: string;
  industry?: string;
  website?: string;
  locale?: string;
}

// Helper function to generate unique slug within organization
async function generateUniqueClientSlug(
  organizationId: string,
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

  if (!baseSlug) baseSlug = 'client';

  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('slug', slug)
      .neq('id', excludeId || '')
      .single();

    if (error && error.code === 'PGRST116') {
      // No match found, slug is unique within organization
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

// Helper function to check organization access
async function checkOrganizationAccess(
  organizationId: string
): Promise<{ hasAccess: boolean; role?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { hasAccess: false, error: 'User not authenticated' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single();

  if (membershipError || !membership) {
    return { hasAccess: false, error: 'Access denied to this organization' };
  }

  return { hasAccess: true, role: membership.role };
}

export async function createClientRecord(
  data: CreateClientData
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Check organization access
    const accessCheck = await checkOrganizationAccess(data.organization_id);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Generate unique slug within organization
    const slug =
      data.slug ||
      (await generateUniqueClientSlug(data.organization_id, data.name));

    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        organization_id: data.organization_id,
        name: data.name,
        slug,
        industry: data.industry,
        website: data.website,
        locale: data.locale || 'en',
      })
      .select(
        `
        *,
        organization:organizations(name, slug)
      `
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: client };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getClients(
  organizationId: string
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Check organization access
    const accessCheck = await checkOrganizationAccess(organizationId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const { data: clients, error } = await supabase
      .from('clients')
      .select(
        `
        *,
        business_profiles(
          id,
          onboarding_completed,
          profile_completeness,
          budget_range_structured,
          timeline_urgency_structured
        ),
        projects(
          id,
          name,
          slug,
          status,
          created_at
        )
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: clients };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getClient(clientId: string): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Get client with organization info
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(
        `
        *,
        organization:organizations(id, name, slug),
        business_profiles(*),
        projects(
          id,
          name,
          slug,
          code,
          status,
          strategy_mode,
          created_at,
          updated_at,
          project_modules(
            id,
            status
          )
        )
      `
      )
      .eq('id', clientId)
      .single();

    if (clientError) {
      return { error: clientError.message };
    }

    // Check organization access
    const accessCheck = await checkOrganizationAccess(client.organization_id);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    return { success: true, data: client };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getClientBySlug(
  organizationSlug: string,
  clientSlug: string
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // First get the organization by slug
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationSlug)
      .single();

    if (orgError || !organization) {
      return { error: 'Organization not found' };
    }

    // Check organization access
    const accessCheck = await checkOrganizationAccess(organization.id);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Get client by slug within organization
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(
        `
        *,
        organization:organizations(id, name, slug),
        business_profiles(*),
        projects(
          id,
          name,
          slug,
          code,
          status,
          strategy_mode,
          created_at,
          updated_at,
          project_modules(
            id,
            status
          )
        )
      `
      )
      .eq('organization_id', organization.id)
      .eq('slug', clientSlug)
      .single();

    if (clientError) {
      return { error: clientError.message };
    }

    return { success: true, data: client };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateClient(
  clientId: string,
  updates: UpdateClientData
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Get client to verify access
    const { data: existingClient, error: clientError } = await supabase
      .from('clients')
      .select('organization_id, name')
      .eq('id', clientId)
      .single();

    if (clientError || !existingClient) {
      return { error: 'Client not found' };
    }

    // Check organization access
    const accessCheck = await checkOrganizationAccess(
      existingClient.organization_id
    );
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Generate unique slug if slug is being updated
    const updateData: any = { ...updates };
    if (updates.slug) {
      updateData.slug = await generateUniqueClientSlug(
        existingClient.organization_id,
        updates.slug,
        clientId
      );
    }

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select(
        `
        *,
        organization:organizations(name, slug),
        business_profiles(
          onboarding_completed,
          profile_completeness
        )
      `
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: client };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function deleteClient(
  clientId: string
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Get client to verify access and check for dependencies
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(
        `
        organization_id,
        name,
        projects(id)
      `
      )
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return { error: 'Client not found' };
    }

    // Check organization access and ensure user can delete (admin or owner)
    const accessCheck = await checkOrganizationAccess(client.organization_id);
    if (
      !accessCheck.hasAccess ||
      !['owner', 'admin'].includes(accessCheck.role!)
    ) {
      return { error: 'Insufficient permissions to delete clients' };
    }

    // Check if client has projects
    if (client.projects && client.projects.length > 0) {
      return {
        error: `Cannot delete client "${client.name}" because it has ${client.projects.length} project(s). Please delete or move the projects first.`,
      };
    }

    // Delete client
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

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

export async function searchClients(
  organizationId: string,
  query: string,
  limit: number = 10
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Check organization access
    const accessCheck = await checkOrganizationAccess(organizationId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const { data: clients, error } = await supabase
      .from('clients')
      .select(
        `
        id,
        name,
        slug,
        industry,
        website,
        created_at,
        business_profiles(
          profile_completeness,
          onboarding_completed
        )
      `
      )
      .eq('organization_id', organizationId)
      .or(`name.ilike.%${query}%,industry.ilike.%${query}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: clients };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getClientStats(
  clientId: string
): Promise<ClientActionResult> {
  const supabase = await createClient();

  try {
    // Get client to verify access
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('organization_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return { error: 'Client not found' };
    }

    // Check organization access
    const accessCheck = await checkOrganizationAccess(client.organization_id);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Get comprehensive stats
    const [projectsResult, modulesResult, deliverablesResult] =
      await Promise.all([
        // Project stats
        supabase
          .from('projects')
          .select('id, status, created_at')
          .eq('client_id', clientId),

        // Module completion stats
        supabase
          .from('project_modules')
          .select('status, project_id, projects!inner(client_id)')
          .eq('projects.client_id', clientId),

        // Deliverable stats
        supabase
          .from('deliverables')
          .select('status, project_id, projects!inner(client_id)')
          .eq('projects.client_id', clientId),
      ]);

    const projects = projectsResult.data || [];
    const modules = modulesResult.data || [];
    const deliverables = deliverablesResult.data || [];

    const stats = {
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        archived: projects.filter(p => p.status === 'archived').length,
      },
      modules: {
        total: modules.length,
        completed: modules.filter(m => m.status === 'approved').length,
        in_progress: modules.filter(m => m.status === 'in_progress').length,
        pending: modules.filter(m => m.status === 'not_started').length,
      },
      deliverables: {
        total: deliverables.length,
        published: deliverables.filter(d => d.status === 'published').length,
        in_review: deliverables.filter(d => d.status === 'in_review').length,
        draft: deliverables.filter(d => d.status === 'draft').length,
      },
      completion_rate:
        modules.length > 0
          ? Math.round(
              (modules.filter(m => m.status === 'approved').length /
                modules.length) *
                100
            )
          : 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
