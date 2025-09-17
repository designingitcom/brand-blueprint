'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Type definitions based on database schema
export type StrategyMode = 'custom' | 'predefined' | 'hybrid';

export interface Strategy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  target_audience?: string;
  module_sequence?: string[]; // UUID array from actual schema
  is_active: boolean;
  created_at: string;
  modules_count?: number;
  // Legacy fields for backwards compatibility
  organization_id?: string | null;
  code?: string;
}

export interface StrategyModule {
  id: string;
  strategy_path_id: string;
  module_id: string;
  sort_order: number;
  is_required: boolean;
  default_visibility: 'internal' | 'client';
  unlock_rule_json: any;
  notes?: string;
  updated_at: string;
  module?: {
    id: string;
    code: string;
    name: string;
    category: string;
    description?: string;
    is_active: boolean;
  };
}

export interface CreateStrategyData {
  name: string;
  slug?: string; // Auto-generated if not provided
  description?: string;
  target_audience?: string;
  is_active?: boolean;
  module_sequence?: string[];
}

export interface UpdateStrategyData {
  name?: string;
  slug?: string;
  description?: string;
  target_audience?: string;
  is_active?: boolean;
  module_sequence?: string[];
}

export interface StrategyActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface StrategyModuleData {
  module_id: string;
  sort_order: number;
  is_required?: boolean;
  default_visibility?: 'internal' | 'client';
  unlock_rule_json?: any;
  notes?: string;
}

// Helper function to generate unique strategy slug
async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const supabase = await createClient();

  // Basic slug generation from name
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);

  if (!baseSlug) baseSlug = 'strategy';

  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const { data, error } = await supabase
      .from('strategy_paths')
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

// Get all strategies with optional filtering
export async function getStrategies(filters?: {
  organization_id?: string | null;
  is_active?: boolean;
  is_default?: boolean;
}): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    let query = supabase
      .from('strategy_paths')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters (only is_active exists in the actual schema)
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data: strategies, error } = await query;

    if (error) {
      return { error: error.message };
    }

    // Process strategies to add module counts from module_sequence array
    const processedStrategies = strategies?.map(strategy => ({
      ...strategy,
      modules_count: strategy.module_sequence?.length || 0,
      // Add backwards compatibility fields
      code: strategy.slug, // Map slug to code for UI compatibility
    })) || [];

    return { success: true, data: processedStrategies };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Get single strategy by ID or code
export async function getStrategy(
  idOrCode: string,
  organizationId?: string | null
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if it's a UUID (ID) or a code
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrCode
      );

    let query = supabase
      .from('strategy_paths')
      .select(`
        *,
                strategy_path_modules(
          id,
          module_id,
          sort_order,
          is_required,
          default_visibility,
          unlock_rule_json,
          notes,
          updated_at,
          modules:module_id(
            id,
            code,
            name,
            category,
            description,
            is_active
          )
        )
      `);

    if (isUUID) {
      query = query.eq('id', idOrCode);
    } else {
      query = query.eq('code', idOrCode);
      if (organizationId !== undefined) {
        query = query.eq('organization_id', organizationId);
      }
    }

    const { data: strategy, error } = await query.single();

    if (error) {
      return { error: error.message };
    }

    // Process strategy modules
    const processedStrategy = {
      ...strategy,
      modules_count: strategy.strategy_path_modules?.length || 0,
      modules: strategy.strategy_path_modules
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((spm: any) => ({
          id: spm.id,
          strategy_path_id: strategy.id,
          module_id: spm.module_id,
          sort_order: spm.sort_order,
          is_required: spm.is_required,
          default_visibility: spm.default_visibility,
          unlock_rule_json: spm.unlock_rule_json,
          notes: spm.notes,
          updated_at: spm.updated_at,
          module: spm.modules
        }))
    };

    return { success: true, data: processedStrategy };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Create new strategy
export async function createStrategy(
  data: CreateStrategyData
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // If setting as default, first unset any existing default for the organization
    if (data.is_default) {
      await supabase
        .from('strategy_paths')
        .update({ is_default: false })
        .eq('organization_id', data.organization_id)
        .eq('is_default', true);
    }

    // Generate unique code if not provided or if provided code already exists
    let code = data.code;
    if (!code) {
      code = await generateUniqueCode(data.name, data.organization_id);
    } else {
      // Check if code already exists
      const { data: existing } = await supabase
        .from('strategy_paths')
        .select('id')
        .eq('code', code)
        .eq('organization_id', data.organization_id)
        .single();

      if (existing) {
        code = await generateUniqueCode(data.name, data.organization_id);
      }
    }

    const { data: strategy, error } = await supabase
      .from('strategy_paths')
      .insert({
        organization_id: data.organization_id,
        code,
        name: data.name,
        description: data.description,
        target_audience: data.target_audience,
        is_active: data.is_active ?? true,
        is_default: data.is_default ?? false,
        created_by: user.id,
      })
      .select(`
        *,
        *
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/strategies');
    revalidatePath('/strategies');
    return { success: true, data: strategy };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Update strategy
export async function updateStrategy(
  id: string,
  updates: UpdateStrategyData
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Get current strategy to check organization
    const { data: currentStrategy, error: fetchError } = await supabase
      .from('strategy_paths')
      .select('organization_id, code')
      .eq('id', id)
      .single();

    if (fetchError || !currentStrategy) {
      return { error: 'Strategy not found' };
    }

    // If setting as default, first unset any existing default for the organization
    if (updates.is_default) {
      await supabase
        .from('strategy_paths')
        .update({ is_default: false })
        .eq('organization_id', currentStrategy.organization_id)
        .eq('is_default', true)
        .neq('id', id);
    }

    // Generate unique code if code is being updated
    const updateData: any = { ...updates };
    if (updates.code && updates.code !== currentStrategy.code) {
      updateData.code = await generateUniqueCode(updates.code, currentStrategy.organization_id, id);
    }

    const { data: strategy, error } = await supabase
      .from('strategy_paths')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        *
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/strategies');
    revalidatePath('/strategies');
    revalidatePath(`/strategies/${id}`);
    return { success: true, data: strategy };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Delete strategy
export async function deleteStrategy(id: string): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if strategy is used in any projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('strategy_path_id', id)
      .limit(1);

    if (projectsError) {
      return { error: 'Failed to check strategy usage' };
    }

    if (projects && projects.length > 0) {
      return {
        error: 'Cannot delete strategy: it is used in active projects',
      };
    }

    // Delete strategy (cascade will handle related data)
    const { error } = await supabase
      .from('strategy_paths')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/strategies');
    revalidatePath('/strategies');
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Clone strategy
export async function cloneStrategy(
  id: string,
  newName?: string,
  organizationId?: string | null
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Get the original strategy with its modules
    const { data: originalStrategy, error: fetchError } = await supabase
      .from('strategy_paths')
      .select(`
        *,
        strategy_path_modules(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !originalStrategy) {
      return { error: 'Strategy not found' };
    }

    // Generate unique name and code
    const cloneName = newName || `${originalStrategy.name} (Copy)`;
    const code = await generateUniqueCode(cloneName, organizationId);

    // Create cloned strategy
    const { data: clonedStrategy, error: createError } = await supabase
      .from('strategy_paths')
      .insert({
        organization_id: organizationId ?? originalStrategy.organization_id,
        code,
        name: cloneName,
        description: originalStrategy.description ? `${originalStrategy.description} (Copy)` : null,
        target_audience: originalStrategy.target_audience,
        is_active: false, // Clone as inactive by default
        is_default: false, // Clone cannot be default
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      return { error: createError.message };
    }

    // Clone strategy modules if they exist
    if (originalStrategy.strategy_path_modules && originalStrategy.strategy_path_modules.length > 0) {
      const moduleInserts = originalStrategy.strategy_path_modules.map((spm: any) => ({
        strategy_path_id: clonedStrategy.id,
        module_id: spm.module_id,
        sort_order: spm.sort_order,
        is_required: spm.is_required,
        default_visibility: spm.default_visibility,
        unlock_rule_json: spm.unlock_rule_json,
        notes: spm.notes,
      }));

      const { error: modulesError } = await supabase
        .from('strategy_path_modules')
        .insert(moduleInserts);

      if (modulesError) {
        // Clean up: delete the cloned strategy if module cloning fails
        await supabase.from('strategy_paths').delete().eq('id', clonedStrategy.id);
        return { error: 'Failed to clone strategy modules' };
      }
    }

    revalidatePath('/admin/strategies');
    revalidatePath('/strategies');
    return { success: true, data: clonedStrategy };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Get strategy modules
export async function getStrategyModules(
  strategyId: string
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    const { data: modules, error } = await supabase
      .from('strategy_path_modules')
      .select(`
        *,
        modules:module_id(
          id,
          code,
          name,
          category,
          description,
          is_active,
          sort_order
        )
      `)
      .eq('strategy_path_id', strategyId)
      .order('sort_order', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    const processedModules = modules?.map(spm => ({
      id: spm.id,
      strategy_path_id: spm.strategy_path_id,
      module_id: spm.module_id,
      sort_order: spm.sort_order,
      is_required: spm.is_required,
      default_visibility: spm.default_visibility,
      unlock_rule_json: spm.unlock_rule_json,
      notes: spm.notes,
      updated_at: spm.updated_at,
      module: spm.modules
    })) || [];

    return { success: true, data: processedModules };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Update strategy modules (replace all modules for a strategy)
export async function updateStrategyModules(
  strategyId: string,
  modules: StrategyModuleData[]
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Verify strategy exists
    const { data: strategy, error: strategyError } = await supabase
      .from('strategy_paths')
      .select('id')
      .eq('id', strategyId)
      .single();

    if (strategyError || !strategy) {
      return { error: 'Strategy not found' };
    }

    // Delete existing strategy modules
    const { error: deleteError } = await supabase
      .from('strategy_path_modules')
      .delete()
      .eq('strategy_path_id', strategyId);

    if (deleteError) {
      return { error: 'Failed to remove existing modules' };
    }

    // Insert new strategy modules
    if (modules.length > 0) {
      const moduleInserts = modules.map(module => ({
        strategy_path_id: strategyId,
        module_id: module.module_id,
        sort_order: module.sort_order,
        is_required: module.is_required ?? false,
        default_visibility: module.default_visibility ?? 'client',
        unlock_rule_json: module.unlock_rule_json ?? {},
        notes: module.notes,
      }));

      const { data: insertedModules, error: insertError } = await supabase
        .from('strategy_path_modules')
        .insert(moduleInserts)
        .select();

      if (insertError) {
        return { error: insertError.message };
      }

      revalidatePath(`/strategies/${strategyId}`);
      revalidatePath('/admin/strategies');
      return { success: true, data: insertedModules };
    }

    revalidatePath(`/strategies/${strategyId}`);
    revalidatePath('/admin/strategies');
    return { success: true, data: [] };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Add single module to strategy
export async function addModuleToStrategy(
  strategyId: string,
  moduleData: StrategyModuleData
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Check if module already exists in strategy
    const { data: existing, error: existingError } = await supabase
      .from('strategy_path_modules')
      .select('id')
      .eq('strategy_path_id', strategyId)
      .eq('module_id', moduleData.module_id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      return { error: 'Failed to check existing module' };
    }

    if (existing) {
      return { error: 'Module is already part of this strategy' };
    }

    const { data: strategyModule, error } = await supabase
      .from('strategy_path_modules')
      .insert({
        strategy_path_id: strategyId,
        module_id: moduleData.module_id,
        sort_order: moduleData.sort_order,
        is_required: moduleData.is_required ?? false,
        default_visibility: moduleData.default_visibility ?? 'client',
        unlock_rule_json: moduleData.unlock_rule_json ?? {},
        notes: moduleData.notes,
      })
      .select(`
        *,
        modules:module_id(
          id,
          code,
          name,
          category,
          description,
          is_active
        )
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/strategies/${strategyId}`);
    revalidatePath('/admin/strategies');
    return { success: true, data: strategyModule };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Remove module from strategy
export async function removeModuleFromStrategy(
  strategyModuleId: string
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Get strategy ID before deletion for cache revalidation
    const { data: strategyModule, error: fetchError } = await supabase
      .from('strategy_path_modules')
      .select('strategy_path_id')
      .eq('id', strategyModuleId)
      .single();

    if (fetchError || !strategyModule) {
      return { error: 'Strategy module not found' };
    }

    const { error } = await supabase
      .from('strategy_path_modules')
      .delete()
      .eq('id', strategyModuleId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/strategies/${strategyModule.strategy_path_id}`);
    revalidatePath('/admin/strategies');
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Reorder strategy modules
export async function reorderStrategyModules(
  moduleOrders: { id: string; sort_order: number }[]
): Promise<StrategyActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    // Update each module's sort order
    const updates = moduleOrders.map(({ id, sort_order }) =>
      supabase
        .from('strategy_path_modules')
        .update({ sort_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);

    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      return { success: false, error: 'Failed to update some module orders' };
    }

    // Get strategy ID for cache revalidation (from first module)
    if (moduleOrders.length > 0) {
      const { data: strategyModule } = await supabase
        .from('strategy_path_modules')
        .select('strategy_path_id')
        .eq('id', moduleOrders[0].id)
        .single();

      if (strategyModule) {
        revalidatePath(`/strategies/${strategyModule.strategy_path_id}`);
      }
    }

    revalidatePath('/admin/strategies');
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}