'use server';

import { createClient } from '@/lib/supabase/server';

export interface OnboardingQ1to6Data {
  businessName: string;
  website: string;
  websiteContext?: string[];
  industry: string;
  customIndustry?: string;
  linkedinUrl?: string;
  businessType: string[];
  brandAssets: string[]; // File URLs after upload
  companyDescription: string;
}

/**
 * Clean business type labels by removing parenthetical descriptions
 * e.g., "B2B (Business-to-Business)" → "B2B"
 */
function cleanBusinessTypeLabel(businessType: string): string {
  // Remove anything in parentheses and trim
  return businessType.split('(')[0].trim();
}

export interface SaveOnboardingParams {
  businessId: string;
  data: OnboardingQ1to6Data;
  questionNumber: number; // Track which question was answered
  organizationId?: string | null; // Optional organization to assign
}

/**
 * Save Q1-Q6 onboarding answers to both businesses and strategic_responses tables
 * businesses table = current state (single row)
 * strategic_responses table = history/audit trail (multiple rows)
 */
export async function saveOnboardingProgress({ businessId, data, questionNumber, organizationId }: SaveOnboardingParams) {
  try {
    const supabase = await createClient();

    // 1. Update businesses table (current state)
    // Clean business type labels (remove parenthetical descriptions)
    const cleanedBusinessTypes = data.businessType
      .map(cleanBusinessTypeLabel)
      .filter(Boolean);

    console.log('📊 Business Type Cleaning:', {
      original: data.businessType,
      cleaned: cleanedBusinessTypes,
      willSave: cleanedBusinessTypes.length > 0 ? cleanedBusinessTypes[0] : null
    });

    const updateData: any = {
      name: data.businessName,
      website_url: data.website,
      website_context: data.websiteContext ? data.websiteContext.join(', ') : null,
      industry: data.customIndustry || data.industry,
      linkedin_url: data.linkedinUrl,
      business_type: cleanedBusinessTypes.length > 0 ? cleanedBusinessTypes[0] : null, // Database expects single value
      files_uploaded: data.brandAssets,
      description: data.companyDescription,
      updated_at: new Date().toISOString(),
    };

    // Add organization_id if provided (typically on Q1)
    if (organizationId !== undefined) {
      updateData.organization_id = organizationId;
    }

    const { error: businessError } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId);

    if (businessError) {
      console.error('❌ Failed to update businesses table:', businessError);
      return { success: false, error: 'Failed to save to businesses table' };
    }

    // 2. Save to strategic_responses table (audit trail)
    // Create separate response records for each answered question
    const responses = [];

    if (questionNumber >= 1) {
      responses.push({
        business_id: businessId,
        question_id: 'Q1',
        question_text: 'What is your business name?',
        response: data.businessName,
      });
    }

    if (questionNumber >= 2 && data.website) {
      responses.push({
        business_id: businessId,
        question_id: 'Q2',
        question_text: 'What is your website URL?',
        response: data.website,
        metadata: { context: data.websiteContext },
      });
    }

    if (questionNumber >= 3 && data.industry) {
      responses.push({
        business_id: businessId,
        question_id: 'Q3',
        question_text: 'What industry are you in?',
        response: data.customIndustry || data.industry,
      });
    }

    if (questionNumber >= 4) {
      responses.push({
        business_id: businessId,
        question_id: 'Q4',
        question_text: "What's your LinkedIn company profile?",
        response: data.linkedinUrl || '(skipped)',
      });
    }

    if (questionNumber >= 5 && data.businessType.length > 0) {
      responses.push({
        business_id: businessId,
        question_id: 'Q5',
        question_text: 'What type of business do you run?',
        response: data.businessType.join(', '),
        metadata: { selected: data.businessType },
      });
    }

    if (questionNumber >= 6) {
      responses.push({
        business_id: businessId,
        question_id: 'Q6',
        question_text: 'Upload any existing files that help us understand your business',
        response: data.brandAssets.length > 0
          ? `${data.brandAssets.length} files uploaded`
          : '(skipped)',
        metadata: { files: data.brandAssets },
      });
    }

    if (questionNumber >= 7 && data.companyDescription) {
      responses.push({
        business_id: businessId,
        question_id: 'Q7', // This will be AI-generated, but we save user's initial description
        question_text: 'How would you describe your business in 2–3 sentences?',
        response: data.companyDescription,
      });
    }

    // Insert responses (upsert to avoid duplicates)
    if (responses.length > 0) {
      const { error: responsesError } = await supabase
        .from('strategic_responses')
        .upsert(responses, {
          onConflict: 'business_id,question_id',
        });

      if (responsesError) {
        console.error('❌ Failed to save strategic_responses:', responsesError);
        return { success: false, error: 'Failed to save response history' };
      }
    }

    console.log(`✅ Saved Q1-Q${questionNumber} progress for business ${businessId}`);

    return {
      success: true,
      message: `Progress saved through question ${questionNumber}`,
    };

  } catch (error) {
    console.error('❌ Error saving onboarding progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get or create a business record for the current user
 * Automatically associates with user's organization
 */
export async function getOrCreateBusiness() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if business exists for user (get most recent if multiple exist)
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!fetchError && businesses && businesses.length > 0) {
      // Return most recent business
      const existing = businesses[0];
      console.log(`✅ Found existing business ${existing.id} for user ${user.id}`);
      return { success: true, businessId: existing.id, business: existing };
    }

    // Get user's organization from memberships
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (membershipError) {
      console.warn('⚠️ No organization membership found for user, creating business without org');
    }

    // Create new business
    const { data: newBusiness, error: createError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        organization_id: membership?.organization_id || null,
        name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !newBusiness) {
      console.error('❌ Failed to create business:', createError);
      return { success: false, error: 'Failed to create business record' };
    }

    console.log(`✅ Created business ${newBusiness.id} for user ${user.id}${membership?.organization_id ? ` in org ${membership.organization_id}` : ''}`);

    return { success: true, businessId: newBusiness.id, business: newBusiness };

  } catch (error) {
    console.error('❌ Error in getOrCreateBusiness:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
