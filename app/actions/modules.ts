'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Type definitions based on our schema
export type ModuleType = 'standard' | 'onboarding' | 'assessment' | 'custom';
export type ModuleCategory = 'strategy' | 'brand' | 'marketing' | 'operations' | 'finance' | 'technology' | 'foundation';
export type ModuleStatus = 'not_started' | 'in_progress' | 'needs_review' | 'approved' | 'locked';
export type ModuleVisibility = 'internal' | 'client';
export type DependencyType = 'requires' | 'recommends' | 'blocks';

export interface Module {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  prerequisites?: string[];
  is_active: boolean;
  module_type: ModuleType;
  category: ModuleCategory;
  created_at?: string;
  updated_at?: string;
  dependencies?: ModuleDependency[];
  questions_count?: number;
}

export interface ModuleDependency {
  id: string;
  module_id: string;
  depends_on_module_id: string;
  dependency_type: DependencyType;
  notes?: string;
  depends_on_module?: {
    name: string;
    slug: string;
  };
}

export interface ModuleFormData {
  name: string;
  slug: string;
  description?: string;
  module_type: ModuleType;
  category: ModuleCategory;
  sort_order?: number;
  is_active?: boolean;
  prerequisites?: string[];
}

// Get all modules with optional filtering
export async function getModules(filters?: {
  category?: ModuleCategory;
  module_type?: ModuleType;
  is_active?: boolean;
}): Promise<Module[]> {
  const supabase = await createClient();

  try {
    // First, get basic modules data without complex joins
    let query = supabase
      .from('modules')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.module_type) {
      query = query.eq('module_type', filters.module_type);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data: modules, error } = await query;

    if (error) {
      console.error('Error fetching modules:', error);
      return [];
    }

    if (!modules) {
      return [];
    }

    // Get questions count and resolve prerequisites for each module
    const modulesWithExtras = await Promise.all(
      modules.map(async (module) => {
        try {
          // Get questions count
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', module.id);

          // Resolve prerequisites - convert prerequisite IDs to module details
          let dependencies = [];
          if (module.prerequisites && module.prerequisites.length > 0) {
            try {
              const { data: prereqModules } = await supabase
                .from('modules')
                .select('id, name, slug')
                .in('id', module.prerequisites);

              if (prereqModules) {
                dependencies = prereqModules.map(prereq => ({
                  id: prereq.id,
                  module_id: module.id,
                  depends_on_module_id: prereq.id,
                  dependency_type: 'requires',
                  depends_on_module: {
                    name: prereq.name,
                    slug: prereq.slug
                  }
                }));
              }
            } catch (prereqError) {
              console.error(`Error resolving prerequisites for module ${module.id}:`, prereqError);
            }
          }

          return {
            ...module,
            questions_count: count || 0,
            dependencies
          };
        } catch (moduleError) {
          console.error(`Error processing module ${module.id}:`, moduleError);
          return {
            ...module,
            questions_count: 0,
            dependencies: []
          };
        }
      })
    );

    return modulesWithExtras;
  } catch (error) {
    console.error('Error in getModules:', error);
    return [];
  }
}

// Get modules with result wrapper for forms
export async function getModulesWithResult(): Promise<{
  success: boolean;
  data?: Module[];
  error?: string;
}> {
  try {
    const modules = await getModules();
    return { success: true, data: modules };
  } catch (error) {
    console.error('Error in getModulesWithResult:', error);
    return { success: false, error: 'Failed to fetch modules' };
  }
}

// Get single module by ID or slug
export async function getModule(idOrSlug: string) {
  const supabase = await createClient();

  try {
    // Check if it's a UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const query = supabase
      .from('modules')
      .select('*');

    const { data, error } = isUuid 
      ? await query.eq('id', idOrSlug).single()
      : await query.eq('slug', idOrSlug).single();

    if (error) {
      console.error('Error fetching module:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getModule:', error);
    return { success: false, error: 'Failed to fetch module', data: null };
  }
}

// Create new module
export async function createModule(moduleData: ModuleFormData) {
  const supabase = await createClient();

  try {
    // Generate slug if not provided
    const slug = moduleData.slug || moduleData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabase
      .from('modules')
      .insert({
        name: moduleData.name,
        slug,
        description: moduleData.description,
        module_type: moduleData.module_type,
        category: moduleData.category,
        sort_order: moduleData.sort_order || 0,
        is_active: moduleData.is_active ?? true,
        prerequisites: moduleData.prerequisites || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating module:', error);
      return { success: false, error: error.message, data: null };
    }

    revalidatePath('/admin/modules');
    return { success: true, data };
  } catch (error) {
    console.error('Error in createModule:', error);
    return { success: false, error: 'Failed to create module', data: null };
  }
}

// Update module
export async function updateModule(id: string, moduleData: Partial<ModuleFormData>) {
  const supabase = await createClient();

  try {
    const updateData: any = {};
    
    if (moduleData.name !== undefined) updateData.name = moduleData.name;
    if (moduleData.slug !== undefined) updateData.slug = moduleData.slug;
    if (moduleData.description !== undefined) updateData.description = moduleData.description;
    if (moduleData.module_type !== undefined) updateData.module_type = moduleData.module_type;
    if (moduleData.category !== undefined) updateData.category = moduleData.category;
    if (moduleData.sort_order !== undefined) updateData.sort_order = moduleData.sort_order;
    if (moduleData.is_active !== undefined) updateData.is_active = moduleData.is_active;
    if (moduleData.prerequisites !== undefined) updateData.prerequisites = moduleData.prerequisites;

    const { data, error } = await supabase
      .from('modules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating module:', error);
      return { success: false, error: error.message, data: null };
    }

    revalidatePath('/admin/modules');
    revalidatePath(`/admin/modules/${id}`);
    return { success: true, data };
  } catch (error) {
    console.error('Error in updateModule:', error);
    return { success: false, error: 'Failed to update module', data: null };
  }
}

// Delete module
export async function deleteModule(id: string) {
  const supabase = await createClient();

  try {
    // Check if module has any dependencies or is used in projects
    const { data: dependencies } = await supabase
      .from('module_dependencies')
      .select('id')
      .eq('depends_on_module_id', id)
      .limit(1);

    if (dependencies && dependencies.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete module: other modules depend on it' 
      };
    }

    const { data: projectModules } = await supabase
      .from('project_modules')
      .select('id')
      .eq('module_id', id)
      .limit(1);

    if (projectModules && projectModules.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete module: it is used in projects' 
      };
    }

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting module:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/modules');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteModule:', error);
    return { success: false, error: 'Failed to delete module' };
  }
}

// Add module dependency
export async function addModuleDependency(
  moduleId: string, 
  dependsOnModuleId: string, 
  dependencyType: DependencyType = 'requires',
  notes?: string
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('module_dependencies')
      .insert({
        module_id: moduleId,
        depends_on_module_id: dependsOnModuleId,
        dependency_type: dependencyType,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding dependency:', error);
      return { success: false, error: error.message, data: null };
    }

    revalidatePath(`/admin/modules/${moduleId}`);
    return { success: true, data };
  } catch (error) {
    console.error('Error in addModuleDependency:', error);
    return { success: false, error: 'Failed to add dependency', data: null };
  }
}

// Remove module dependency
export async function removeModuleDependency(dependencyId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('module_dependencies')
      .delete()
      .eq('id', dependencyId);

    if (error) {
      console.error('Error removing dependency:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/modules');
    return { success: true };
  } catch (error) {
    console.error('Error in removeModuleDependency:', error);
    return { success: false, error: 'Failed to remove dependency' };
  }
}

// Reorder modules
export async function reorderModules(moduleOrders: { id: string; sort_order: number }[]) {
  const supabase = await createClient();

  try {
    // Update each module's sort order
    const updates = moduleOrders.map(({ id, sort_order }) =>
      supabase
        .from('modules')
        .update({ sort_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      return { success: false, error: 'Failed to update some module orders' };
    }

    revalidatePath('/admin/modules');
    return { success: true };
  } catch (error) {
    console.error('Error in reorderModules:', error);
    return { success: false, error: 'Failed to reorder modules' };
  }
}

// Clone module with optional new name
export async function cloneModule(id: string, newName?: string) {
  const supabase = await createClient();

  try {
    // Get the original module
    const { data: originalModule, error: fetchError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !originalModule) {
      console.error('Error fetching original module:', fetchError);
      return { success: false, error: 'Module not found', data: null };
    }

    // Generate unique name and slug
    const cloneName = newName || `${originalModule.name} (Copy)`;
    const baseSlug = cloneName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if slug already exists and make it unique
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('modules')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create cloned module
    const { data: clonedModule, error: createError } = await supabase
      .from('modules')
      .insert({
        name: cloneName,
        slug: slug,
        description: originalModule.description ? `${originalModule.description} (Copy)` : null,
        module_type: originalModule.module_type,
        category: originalModule.category,
        sort_order: originalModule.sort_order + 1,
        is_active: false, // Clone as inactive by default
        prerequisites: originalModule.prerequisites || []
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating cloned module:', createError);
      return { success: false, error: createError.message, data: null };
    }

    revalidatePath('/admin/modules');
    return { success: true, data: clonedModule };
  } catch (error) {
    console.error('Error in cloneModule:', error);
    return { success: false, error: 'Failed to clone module', data: null };
  }
}