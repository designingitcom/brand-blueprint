'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface BusinessProfileActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export interface CreateBusinessProfileData {
  client_id: string;
  // Basic Information
  legal_name?: string;
  dba_name?: string;
  founding_year?: number;
  employee_count?: number;
  annual_revenue?: string;
  annual_revenue_min?: number;
  annual_revenue_max?: number;

  // Contact Information
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  headquarters_address?: string;
  headquarters_city?: string;
  headquarters_state?: string;
  headquarters_country?: string;
  headquarters_postal?: string;

  // Business Details
  business_model?: string;
  business_model_structured?:
    | 'b2b'
    | 'b2c'
    | 'b2b2c'
    | 'marketplace'
    | 'saas'
    | 'd2c'
    | 'nonprofit'
    | 'government'
    | 'other';
  target_market?: string[];
  primary_products?: string[];
  primary_services?: string[];
  key_differentiators?: string[];
  main_competitors?: string[];

  // Strategic Assessment
  current_challenges?: string[];
  growth_goals?: string[];
  success_metrics?: string[];
  timeline_urgency?: string;
  timeline_urgency_structured?:
    | 'immediate'
    | '1_month'
    | '3_months'
    | '6_months'
    | '1_year'
    | 'no_rush';
  budget_range?: string;
  budget_range_structured?:
    | 'under_10k'
    | '10k_25k'
    | '25k_50k'
    | '50k_100k'
    | '100k_250k'
    | '250k_500k'
    | '500k_plus';

  // Brand Status
  has_existing_brand?: boolean;
  brand_satisfaction_score?: number;
  has_brand_guidelines?: boolean;
  has_website?: boolean;
  website_satisfaction_score?: number;

  // Marketing Presence
  social_media_channels?: Record<string, any>;
  marketing_channels?: string[];
  monthly_marketing_spend?: string;
  monthly_marketing_spend_amount?: number;
  has_internal_marketing_team?: boolean;

  // Technical Details
  current_tech_stack?: string[];
  preferred_cms?: string;
  integration_requirements?: string[];

  // Project Specifics
  project_goals?: string[];
  success_definition?: string;
  key_stakeholders?: Record<string, any>;
  decision_maker?: string;

  // Preferences
  communication_preference?: string;
  meeting_cadence?: string;
  preferred_timeline?: string;
}

export type UpdateBusinessProfileData = Partial<CreateBusinessProfileData>;

// Helper function to check client access through organization membership
async function checkClientAccess(
  clientId: string
): Promise<{ hasAccess: boolean; organizationId?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { hasAccess: false, error: 'User not authenticated' };
  }

  // Get client with organization info
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('organization_id')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    return { hasAccess: false, error: 'Client not found' };
  }

  // Check organization membership
  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', client.organization_id)
    .eq('user_id', user.id)
    .single();

  if (membershipError || !membership) {
    return { hasAccess: false, error: 'Access denied to this client' };
  }

  return { hasAccess: true, organizationId: client.organization_id };
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(profile: any): number {
  const importantFields = [
    'legal_name',
    'founding_year',
    'employee_count',
    'annual_revenue_min',
    'primary_contact_name',
    'primary_contact_email',
    'headquarters_city',
    'headquarters_country',
    'business_model_structured',
    'target_market',
    'primary_products',
    'key_differentiators',
    'current_challenges',
    'growth_goals',
    'timeline_urgency_structured',
    'budget_range_structured',
    'has_existing_brand',
    'project_goals',
    'success_definition',
    'decision_maker',
  ];

  const arrayFields = [
    'target_market',
    'primary_products',
    'key_differentiators',
    'current_challenges',
    'growth_goals',
    'project_goals',
  ];

  let completedFields = 0;

  importantFields.forEach(field => {
    const value = profile[field];

    if (arrayFields.includes(field)) {
      // For array fields, check if array exists and has at least one item
      if (Array.isArray(value) && value.length > 0) {
        completedFields++;
      }
    } else if (typeof value === 'boolean') {
      // For boolean fields, any value (true/false) counts as completed
      completedFields++;
    } else if (value != null && value !== '') {
      // For other fields, check if not null/empty
      completedFields++;
    }
  });

  return Math.round((completedFields / importantFields.length) * 100);
}

export async function createBusinessProfile(
  data: CreateBusinessProfileData
): Promise<BusinessProfileActionResult> {
  const supabase = await createClient();

  try {
    // Check client access
    const accessCheck = await checkClientAccess(data.client_id);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Get current user for last_updated_by
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Calculate initial profile completeness
    const profile_completeness = calculateProfileCompleteness(data);

    // Create business profile
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .insert({
        ...data,
        profile_completeness,
        last_updated_by: user?.id,
      })
      .select(
        `
        *,
        client:clients(
          id,
          name,
          slug,
          organization:organizations(name, slug)
        )
      `
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: profile };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getBusinessProfile(
  clientId: string
): Promise<BusinessProfileActionResult> {
  const supabase = await createClient();

  try {
    // Check client access
    const accessCheck = await checkClientAccess(clientId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select(
        `
        *,
        client:clients(
          id,
          name,
          slug,
          industry,
          website,
          organization:organizations(name, slug)
        ),
        last_updated_user:users(name, email)
      `
      )
      .eq('client_id', clientId)
      .single();

    if (error) {
      // If profile doesn't exist, return null data instead of error
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      return { error: error.message };
    }

    return { success: true, data: profile };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateBusinessProfile(
  clientId: string,
  updates: UpdateBusinessProfileData
): Promise<BusinessProfileActionResult> {
  const supabase = await createClient();

  try {
    // Check client access
    const accessCheck = await checkClientAccess(clientId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Get current user for last_updated_by
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get existing profile to merge with updates for completeness calculation
    const { data: existingProfile, error: existingError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      return { error: existingError.message };
    }

    // Merge existing data with updates for completeness calculation
    const mergedData = { ...existingProfile, ...updates };
    const profile_completeness = calculateProfileCompleteness(mergedData);

    // Determine if onboarding is completed (80% completeness threshold)
    const onboarding_completed = profile_completeness >= 80;
    const onboarding_completed_at =
      onboarding_completed && !existingProfile?.onboarding_completed
        ? new Date().toISOString()
        : existingProfile?.onboarding_completed_at;

    const updateData = {
      ...updates,
      profile_completeness,
      onboarding_completed,
      onboarding_completed_at,
      last_updated_by: user?.id,
    };

    let profile;
    let error;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('business_profiles')
        .update(updateData)
        .eq('client_id', clientId)
        .select(
          `
          *,
          client:clients(
            id,
            name,
            slug,
            organization:organizations(name, slug)
          )
        `
        )
        .single();

      profile = result.data;
      error = result.error;
    } else {
      // Create new profile if it doesn't exist
      const result = await supabase
        .from('business_profiles')
        .insert({
          client_id: clientId,
          ...updateData,
        })
        .select(
          `
          *,
          client:clients(
            id,
            name,
            slug,
            organization:organizations(name, slug)
          )
        `
        )
        .single();

      profile = result.data;
      error = result.error;
    }

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: profile };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function completeOnboarding(
  clientId: string
): Promise<BusinessProfileActionResult> {
  const supabase = await createClient();

  try {
    // Check client access
    const accessCheck = await checkClientAccess(clientId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Mark onboarding as completed
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        last_updated_by: user?.id,
      })
      .eq('client_id', clientId)
      .select(
        `
        *,
        client:clients(
          name,
          organization:organizations(name)
        )
      `
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: profile };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getBusinessProfileInsights(
  clientId: string
): Promise<BusinessProfileActionResult> {
  const supabase = await createClient();

  try {
    // Check client access
    const accessCheck = await checkClientAccess(clientId);
    if (!accessCheck.hasAccess) {
      return { error: accessCheck.error };
    }

    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) {
      return { error: error.message };
    }

    // Generate insights based on profile data
    const insights = {
      maturity_level: profile.founding_year
        ? new Date().getFullYear() - profile.founding_year < 3
          ? 'startup'
          : new Date().getFullYear() - profile.founding_year < 10
            ? 'growth'
            : 'established'
        : 'unknown',

      size_category: profile.employee_count
        ? profile.employee_count < 10
          ? 'micro'
          : profile.employee_count < 50
            ? 'small'
            : profile.employee_count < 250
              ? 'medium'
              : 'large'
        : 'unknown',

      revenue_category: profile.annual_revenue_min
        ? profile.annual_revenue_min < 100000
          ? 'early_stage'
          : profile.annual_revenue_min < 1000000
            ? 'growing'
            : profile.annual_revenue_min < 10000000
              ? 'established'
              : 'enterprise'
        : 'unknown',

      brand_maturity: {
        has_existing_brand: profile.has_existing_brand || false,
        brand_satisfaction: profile.brand_satisfaction_score || 0,
        has_guidelines: profile.has_brand_guidelines || false,
        needs_rebrand: profile.brand_satisfaction_score
          ? profile.brand_satisfaction_score < 6
          : false,
      },

      digital_presence: {
        has_website: profile.has_website || false,
        website_satisfaction: profile.website_satisfaction_score || 0,
        social_channels: Object.keys(profile.social_media_channels || {})
          .length,
        marketing_spend: profile.monthly_marketing_spend_amount || 0,
      },

      strategic_focus: {
        primary_challenges: profile.current_challenges?.slice(0, 3) || [],
        top_goals: profile.growth_goals?.slice(0, 3) || [],
        urgency_level: profile.timeline_urgency_structured || 'unknown',
        budget_tier: profile.budget_range_structured || 'unknown',
      },

      completeness: {
        overall: profile.profile_completeness || 0,
        onboarding_complete: profile.onboarding_completed || false,
        missing_critical_fields: [],
      },
    };

    return { success: true, data: insights };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getIncompleteProfiles(
  organizationId: string
): Promise<BusinessProfileActionResult> {
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

    // Get profiles that are not completed (< 80% or not marked as completed)
    const { data: profiles, error } = await supabase
      .from('business_profiles')
      .select(
        `
        id,
        profile_completeness,
        onboarding_completed,
        updated_at,
        client:clients(
          id,
          name,
          slug,
          created_at
        )
      `
      )
      .eq('clients.organization_id', organizationId)
      .or('profile_completeness.lt.80,onboarding_completed.eq.false')
      .order('updated_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: profiles };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
