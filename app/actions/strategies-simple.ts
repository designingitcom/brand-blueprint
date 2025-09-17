'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// Simple interfaces matching the actual database schema
export interface StrategySimple {
  id: string;
  name: string;
  slug: string;
  description?: string;
  target_audience?: string;
  module_sequence?: string[];
  is_active: boolean;
  created_at: string;
  // For UI compatibility
  code?: string;
  modules_count?: number;
}

export interface CreateStrategySimpleData {
  name: string;
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

// Helper function to generate unique slug
async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = createServiceClient();

  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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

// Simple get strategies function
export async function getStrategiesSimple(): Promise<StrategyActionResult> {
  const supabase = createServiceClient();

  try {
    const { data: strategies, error } = await supabase
      .from('strategy_paths')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    // Process strategies for UI compatibility
    const processedStrategies = strategies?.map(strategy => ({
      ...strategy,
      modules_count: strategy.module_sequence?.length || 0,
      code: strategy.slug, // Map slug to code for UI compatibility
    })) || [];

    return { success: true, data: processedStrategies };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Simple create strategy function
export async function createStrategySimple(
  data: CreateStrategySimpleData
): Promise<StrategyActionResult> {
  const supabase = createServiceClient();

  try {

    // Generate unique slug
    const slug = data.slug || await generateUniqueSlug(data.name);

    // Create strategy with simple data structure
    const { data: strategy, error } = await supabase
      .from('strategy_paths')
      .insert([
        {
          name: data.name,
          slug: slug,
          description: data.description || null,
          target_audience: data.target_audience || null,
          module_sequence: data.module_sequence || [],
          is_active: data.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Add compatibility fields
    const processedStrategy = {
      ...strategy,
      code: strategy.slug,
      modules_count: strategy.module_sequence?.length || 0,
    };

    revalidatePath('/admin/strategies');
    return { success: true, data: processedStrategy };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Simple update strategy function
export async function updateStrategySimple(
  id: string,
  data: Partial<CreateStrategySimpleData>
): Promise<StrategyActionResult> {
  const supabase = createServiceClient();

  try {

    // Update strategy
    const { data: strategy, error } = await supabase
      .from('strategy_paths')
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
        target_audience: data.target_audience,
        module_sequence: data.module_sequence,
        is_active: data.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Add compatibility fields
    const processedStrategy = {
      ...strategy,
      code: strategy.slug,
      modules_count: strategy.module_sequence?.length || 0,
    };

    revalidatePath('/admin/strategies');
    return { success: true, data: processedStrategy };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Simple delete strategy function
export async function deleteStrategySimple(
  id: string
): Promise<StrategyActionResult> {
  const supabase = createServiceClient();

  try {

    const { error } = await supabase
      .from('strategy_paths')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/strategies');
    return { success: true, data: { id } };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Simple clone strategy function
export async function cloneStrategySimple(
  id: string
): Promise<StrategyActionResult> {
  const supabase = createServiceClient();

  try {

    // Get the original strategy
    const { data: original, error: fetchError } = await supabase
      .from('strategy_paths')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return { error: 'Strategy not found' };
    }

    // Generate a unique slug for the clone
    const slug = await generateUniqueSlug(`${original.name} Copy`);

    // Create the clone
    const { data: clone, error: cloneError } = await supabase
      .from('strategy_paths')
      .insert([
        {
          name: `${original.name} Copy`,
          slug: slug,
          description: original.description,
          target_audience: original.target_audience,
          module_sequence: original.module_sequence || [],
          is_active: original.is_active,
        },
      ])
      .select()
      .single();

    if (cloneError) {
      return { error: cloneError.message };
    }

    // Add compatibility fields
    const processedClone = {
      ...clone,
      code: clone.slug,
      modules_count: clone.module_sequence?.length || 0,
    };

    revalidatePath('/admin/strategies');
    return { success: true, data: processedClone };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Simple get individual strategy function
export async function getStrategySimple(
  id: string
): Promise<StrategyActionResult> {
  const supabase = createServiceClient();

  try {
    const { data: strategy, error } = await supabase
      .from('strategy_paths')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!strategy) {
      return { error: 'Strategy not found' };
    }

    // Process strategy for UI compatibility
    const processedStrategy = {
      ...strategy,
      modules_count: strategy.module_sequence?.length || 0,
      code: strategy.slug, // Map slug to code for UI compatibility
    };

    return { success: true, data: processedStrategy };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}