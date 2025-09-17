import { createClient } from '@/lib/supabase/server';

export interface AccessCheckResult {
  hasAccess: boolean;
  role?: string;
  error?: string;
  organizationId?: string;
}

// Enum constants for type safety
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  STRATEGIST: 'strategist',
  CLIENT_OWNER: 'client_owner',
  CLIENT_EDITOR: 'client_editor',
  VIEWER: 'viewer',
} as const;

export const STRATEGY_MODES = {
  CUSTOM: 'custom',
  PREDEFINED: 'predefined',
  HYBRID: 'hybrid',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const MODULE_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  NEEDS_REVIEW: 'needs_review',
  APPROVED: 'approved',
  LOCKED: 'locked',
} as const;

// Generic slug generation utility
export async function generateUniqueSlug(
  baseName: string,
  tableName: string,
  scopeField?: string,
  scopeValue?: string,
  excludeId?: string
): Promise<string> {
  const supabase = await createClient();

  // Basic slug generation
  let baseSlug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) baseSlug = 'item';

  let slug = baseSlug;
  let counter = 0;

  while (true) {
    let query = supabase.from(tableName).select('id').eq('slug', slug);

    // Add scope filtering if provided
    if (scopeField && scopeValue) {
      query = query.eq(scopeField, scopeValue);
    }

    // Exclude specific ID if updating
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      // No match found, slug is unique
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

// Check if user has access to organization
export async function checkOrganizationAccess(
  organizationId: string
): Promise<AccessCheckResult> {
  const supabase = await createClient();

  try {
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

    return { hasAccess: true, role: membership.role, organizationId };
  } catch (error) {
    return { hasAccess: false, error: 'Access check failed' };
  }
}

// Check if user has access to client (through organization)
export async function checkClientAccess(
  clientId: string
): Promise<AccessCheckResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { hasAccess: false, error: 'User not authenticated' };
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('organization_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return { hasAccess: false, error: 'Client not found' };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', client.organization_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return { hasAccess: false, error: 'Access denied to this client' };
    }

    return {
      hasAccess: true,
      role: membership.role,
      organizationId: client.organization_id,
    };
  } catch (error) {
    return { hasAccess: false, error: 'Access check failed' };
  }
}

// Check if user has access to project (through client/organization)
export async function checkProjectAccess(
  projectId: string
): Promise<AccessCheckResult & { project?: any }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { hasAccess: false, error: 'User not authenticated' };
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        *,
        client:clients(
          organization_id
        )
      `
      )
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { hasAccess: false, error: 'Project not found' };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', project.client.organization_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return { hasAccess: false, error: 'Access denied to this project' };
    }

    return {
      hasAccess: true,
      role: membership.role,
      organizationId: project.client.organization_id,
      project,
    };
  } catch (error) {
    return { hasAccess: false, error: 'Access check failed' };
  }
}

// Check if user has admin or owner role
export function hasAdminAccess(role?: string): boolean {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

// Check if user can edit client data
export function canEditClient(role?: string): boolean {
  return (
    role === ROLES.OWNER ||
    role === ROLES.ADMIN ||
    role === ROLES.STRATEGIST ||
    role === ROLES.CLIENT_OWNER ||
    role === ROLES.CLIENT_EDITOR
  );
}

// Check if user can view client data
export function canViewClient(role?: string): boolean {
  return role !== undefined; // All roles can view
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate slug format
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

// Format currency amount
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Calculate percentage
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Get user organizations utility
export async function getUserOrganizations(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: organizations, error } = await supabase
      .from('organizations')
      .select(
        `
        *,
        memberships!inner(role)
      `
      )
      .eq('memberships.user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: organizations };
  } catch (error) {
    return { success: false, error: 'Failed to get organizations' };
  }
}

// Sanitize input data
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Validate required fields
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (
      !data[field] ||
      (typeof data[field] === 'string' && data[field].trim() === '')
    ) {
      return `${field.replace('_', ' ')} is required`;
    }
  }
  return null;
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (supabase: any) => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  const supabase = await createClient();

  try {
    const result = await callback(supabase);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

// Common query options
export const COMMON_SELECTS = {
  ORGANIZATION_BASIC: 'id, name, slug, created_at',
  CLIENT_BASIC: 'id, name, slug, industry, created_at',
  PROJECT_BASIC: 'id, name, slug, status, created_at',
  USER_BASIC: 'id, name, email, avatar_url',
  MODULE_BASIC: 'id, code, name, category, description',
} as const;
