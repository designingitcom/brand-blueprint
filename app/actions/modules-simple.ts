'use server';

import { createServiceClient } from '@/lib/supabase/service';

export interface ModuleSimple {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  prerequisites: string[];
  is_active: boolean;
  module_type: string;
  category: string;
  created_at: string;
  questions_count?: number;
}

export interface ModuleActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

// Get all active modules
export async function getModulesSimple(): Promise<ModuleActionResult> {
  const supabase = createServiceClient();

  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select(`
        *,
        questions:questions(count)
      `)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    // Add question counts
    const modulesWithCounts = (modules || []).map(module => ({
      ...module,
      questions_count: module.questions?.[0]?.count || 0
    }));

    return { success: true, data: modulesWithCounts };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Get modules grouped by category
export async function getModulesByCategory(): Promise<ModuleActionResult> {
  const supabase = createServiceClient();

  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select(`
        *,
        questions:questions(count)
      `)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    // Add question counts and group modules by category
    const modulesWithCounts = (modules || []).map(module => ({
      ...module,
      questions_count: module.questions?.[0]?.count || 0
    }));

    const modulesByCategory = modulesWithCounts.reduce((acc: any, module: ModuleSimple) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {});

    return { success: true, data: modulesByCategory };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}