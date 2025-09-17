'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ProjectActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface CreateProjectData {
  business_id: string;
  name: string;
  slug?: string;
  code?: string;
  strategy_mode?: 'custom' | 'predefined' | 'hybrid';
  strategy_path_id?: string;
  base_project_id?: string;
  status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'on_hold';
}

export interface UpdateProjectData {
  name?: string;
  slug?: string;
  code?: string;
  strategy_mode?: 'custom' | 'predefined' | 'hybrid';
  strategy_path_id?: string;
  base_project_id?: string;
  status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'on_hold';
}

// Helper function to generate unique slug within business
async function generateUniqueProjectSlug(
  businessId: string,
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

  if (!baseSlug) baseSlug = 'project';

  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('business_id', businessId)
      .eq('slug', slug)
      .neq('id', excludeId || '')
      .single();

    if (error && error.code === 'PGRST116') {
      // No match found, slug is unique within business
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

// Helper function to check project access through business/organization
async function checkProjectAccess(projectId: string): Promise<{
  hasAccess: boolean;
  role?: string;
  error?: string;
  project?: any;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { hasAccess: false, error: 'User not authenticated' };
  }

  // Get project with business and organization info
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      `
      *,
      business:businesses(
        id,
        name,
        organization_id,
        organization:organizations(name)
      )
    `
    )
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return { hasAccess: false, error: 'Project not found' };
  }

  // Check organization membership
  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', project.business.organization_id)
    .eq('user_id', user.id)
    .single();

  if (membershipError || !membership) {
    return { hasAccess: false, error: 'Access denied to this project' };
  }

  return { hasAccess: true, role: membership.role, project };
}

// Helper function to check business access
async function checkBusinessAccess(
  businessId: string
): Promise<{ hasAccess: boolean; organizationId?: string; tenantId?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { hasAccess: false, error: 'User not authenticated' };
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select(`
      organization_id, 
      tenant_id,
      organization:organizations(tenant_id)
    `)
    .eq('id', businessId)
    .single();

  if (businessError || !business) {
    return { hasAccess: false, error: 'Business not found' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', business.organization_id)
    .eq('user_id', user.id)
    .single();

  if (membershipError || !membership) {
    return { hasAccess: false, error: 'Access denied to this business' };
  }

  // Get tenant_id from business or fall back to organization
  const tenantId = business.tenant_id || business.organization?.tenant_id;
  
  return { hasAccess: true, organizationId: business.organization_id, tenantId };
}

export async function createProject(
  data: CreateProjectData
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check business access
    const accessCheck = await checkBusinessAccess(data.business_id);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }
    
    // Ensure we have a tenant_id
    if (!accessCheck.tenantId) {
      console.error('No tenant_id found for business:', data.business_id);
      return { error: 'Unable to determine tenant for this business' };
    }

    // Generate unique slug within business
    const slug =
      data.slug || (await generateUniqueProjectSlug(data.business_id, data.name));

    // Validate strategy mode and strategy path consistency
    if (data.strategy_mode === 'custom' && data.strategy_path_id) {
      return { error: 'Custom strategy mode cannot have a strategy path' };
    }

    if (
      (data.strategy_mode === 'predefined' ||
        data.strategy_mode === 'hybrid') &&
      !data.strategy_path_id
    ) {
      return {
        error: 'Predefined/hybrid strategy mode requires a strategy path',
      };
    }

    // Validate strategy path belongs to same organization or is global
    if (data.strategy_path_id) {
      const { data: strategyPath, error: strategyError } = await supabase
        .from('strategy_paths')
        .select('organization_id')
        .eq('id', data.strategy_path_id)
        .single();

      if (strategyError || !strategyPath) {
        return { error: 'Strategy path not found' };
      }

      if (
        strategyPath.organization_id &&
        strategyPath.organization_id !== accessCheck.organizationId
      ) {
        return {
          error: 'Strategy path must belong to same organization or be global',
        };
      }
    }

    // Create project
    const projectData = {
      business_id: data.business_id,
      name: data.name,
      slug,
      code: data.code,
      strategy_mode: data.strategy_mode || 'custom',
      strategy_path_id: data.strategy_path_id,
      base_project_id: data.base_project_id,
      status: data.status || 'pending',
      tenant_id: accessCheck.tenantId,
    };

    console.log('Creating project with data:', projectData);

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(
        `
        *,
        business:businesses(
          id,
          name,
          slug,
          organization:organizations(name, slug)
        ),
        strategy_path:strategy_paths(name, description),
        base_project:projects(name)
      `
      )
      .single();

    if (error) {
      console.error('Database error creating project:', error);
      return { error: error.message };
    }

    // Apply strategy path if specified
    if (data.strategy_path_id) {
      const applyResult = await applyStrategyPathToProject(
        project.id,
        data.strategy_path_id
      );
      if (applyResult.error) {
        // Cleanup: delete the project if strategy application fails
        await supabase.from('projects').delete().eq('id', project.id);
        return { error: `Failed to apply strategy path: ${applyResult.error}` };
      }
    }

    revalidatePath('/', 'layout');
    return { success: true, data: project };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getProjects(
  businessId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check business access
    const accessCheck = await checkBusinessAccess(businessId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        business:businesses(
          name,
          slug,
          organization:organizations(name, slug)
        ),
        strategy_path:strategy_paths(name, description),
        base_project:projects(name),
        project_modules(
          id,
          status,
          module:modules(name)
        ),
        deliverables(
          id,
          status,
          type
        )
      `
      )
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: projects };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getProject(
  projectId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check project access
    const accessCheck = await checkProjectAccess(projectId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        business:businesses(
          id,
          name,
          slug,
          type,
          website,
          description,
          organization:organizations(id, name, slug)
        ),
        strategy_path:strategy_paths(
          id,
          name,
          description,
          target_audience
        ),
        base_project:projects(
          id,
          name,
          slug,
          business:businesses(name)
        ),
        project_modules(
          id,
          sort_order,
          visibility,
          status,
          is_required,
          assigned_to,
          due_at,
          source,
          started_at,
          completed_at,
          module:modules(
            id,
            code,
            name,
            category,
            description
          ),
          user:users(name, email)
        ),
        deliverables(
          id,
          type,
          title,
          status,
          created_at
        )
      `
      )
      .eq('id', projectId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: project };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// New unified function that supports both slug and ID
export async function getProjectBySlugOrId(
  slugOrId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check if the parameter looks like a UUID (ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);
    
    if (isUUID) {
      // Use existing getProject function for ID
      return await getProject(slugOrId);
    } else {
      // For slug, first find the project to get its ID, then use getProject
      const { data: projectLookup, error: lookupError } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slugOrId)
        .single();

      if (lookupError || !projectLookup) {
        return { error: 'Project not found.' };
      }

      // Now use the regular getProject function which includes access checks
      return await getProject(projectLookup.id);
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getProjectBySlug(
  organizationSlug: string,
  businessSlug: string,
  projectSlug: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Get organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationSlug)
      .single();

    if (orgError || !organization) {
      return { error: 'Organization not found' };
    }

    // Get business within organization
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('slug', businessSlug)
      .single();

    if (businessError || !business) {
      return { error: 'Business not found' };
    }

    // Get project within business
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('business_id', business.id)
      .eq('slug', projectSlug)
      .single();

    if (projectError || !project) {
      return { error: 'Project not found' };
    }

    // Use the regular getProject method for full data
    return await getProject(project.id);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateProject(
  projectId: string,
  updates: UpdateProjectData
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check project access
    const accessCheck = await checkProjectAccess(projectId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const project = accessCheck.project!;

    // Generate unique slug if slug is being updated
    const updateData: any = { ...updates };
    if (updates.slug) {
      updateData.slug = await generateUniqueProjectSlug(
        project.business_id,
        updates.slug,
        projectId
      );
    }

    // Validate strategy mode changes
    if (updates.strategy_mode || updates.strategy_path_id !== undefined) {
      const newMode = updates.strategy_mode || project.strategy_mode;
      const newPathId =
        updates.strategy_path_id !== undefined
          ? updates.strategy_path_id
          : project.strategy_path_id;

      if (newMode === 'custom' && newPathId) {
        return { error: 'Custom strategy mode cannot have a strategy path' };
      }

      if ((newMode === 'predefined' || newMode === 'hybrid') && !newPathId) {
        return {
          error: 'Predefined/hybrid strategy mode requires a strategy path',
        };
      }
    }

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select(
        `
        *,
        business:businesses(
          name,
          slug,
          organization:organizations(name, slug)
        ),
        strategy_path:strategy_paths(name, description),
        base_project:projects(name)
      `
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: updatedProject };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function deleteProject(
  projectId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check project access and ensure user can delete (admin or owner)
    const accessCheck = await checkProjectAccess(projectId);
    if (
      !accessCheck.hasAccess ||
      !['owner', 'admin'].includes(accessCheck.role!)
    ) {
      return { error: 'Insufficient permissions to delete projects' };
    }

    const project = accessCheck.project!;

    // Check if this project is used as a base project by others
    const { data: dependentProjects, error: dependentError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('base_project_id', projectId);

    if (dependentError) {
      return { error: dependentError.message };
    }

    if (dependentProjects && dependentProjects.length > 0) {
      const projectNames = dependentProjects.map(p => p.name).join(', ');
      return {
        error: `Cannot delete project "${project.name}" because it is used as a base project by: ${projectNames}. Please update or delete those projects first.`,
      };
    }

    // Delete project (cascades will handle related data)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

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

export async function applyStrategyPathToProject(
  projectId: string,
  strategyPathId: string,
  preserveCustomModules: boolean = false
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check project access
    const accessCheck = await checkProjectAccess(projectId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Call the database function to apply strategy path
    const { error } = await supabase.rpc('apply_strategy_path_to_project', {
      p_project_id: projectId,
      p_strategy_path_id: strategyPathId,
      p_preserve_custom: preserveCustomModules,
    });

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

export async function getProjectProgress(
  projectId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check project access
    const accessCheck = await checkProjectAccess(projectId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Get detailed progress information
    const { data: modules, error: modulesError } = await supabase
      .from('project_modules')
      .select(
        `
        id,
        status,
        sort_order,
        completed_at,
        module:modules(
          name,
          category
        )
      `
      )
      .eq('project_id', projectId)
      .order('sort_order');

    if (modulesError) {
      return { error: modulesError.message };
    }

    // Calculate progress stats
    const totalModules = modules?.length || 0;
    const completedModules =
      modules?.filter(m => m.status === 'approved').length || 0;
    const inProgressModules =
      modules?.filter(m => m.status === 'in_progress').length || 0;

    const progress = {
      total_modules: totalModules,
      completed_modules: completedModules,
      in_progress_modules: inProgressModules,
      pending_modules: totalModules - completedModules - inProgressModules,
      completion_percentage:
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0,
      modules_by_status: {
        not_started:
          modules?.filter(m => m.status === 'not_started').length || 0,
        in_progress: inProgressModules,
        needs_review:
          modules?.filter(m => m.status === 'needs_review').length || 0,
        approved: completedModules,
        locked: modules?.filter(m => m.status === 'locked').length || 0,
      },
      modules_by_category:
        modules?.reduce(
          (acc, module) => {
            const category = (module.module as any)?.category || 'other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {},
      recent_completions:
        modules
          ?.filter(m => m.completed_at && m.status === 'approved')
          .sort(
            (a, b) =>
              new Date(b.completed_at).getTime() -
              new Date(a.completed_at).getTime()
          )
          .slice(0, 5) || [],
    };

    return { success: true, data: progress };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getOrganizationProjects(
  organizationId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // Check organization access
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return { error: 'Access denied to this organization' };
    }

    // Get all projects for the organization
    const { data: projects, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        business:businesses!inner(
          id,
          name,
          slug,
          organization_id
        ),
        project_modules(
          id,
          status
        )
      `
      )
      .eq('business.organization_id', organizationId)
      .order('updated_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    // Calculate progress for each project
    const projectsWithProgress = projects?.map(project => {
      const modules = project.project_modules || [];
      const completedModules = modules.filter(
        (m: any) => m.status === 'approved'
      ).length;
      const totalModules = modules.length;

      return {
        ...project,
        completion_percentage:
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0,
        total_modules: totalModules,
        completed_modules: completedModules,
      };
    });

    return { success: true, data: projectsWithProgress };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
