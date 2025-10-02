'use server';

import { createClient } from '@/lib/supabase/server';

export interface StrategicResponse {
  id?: string;
  business_id: string;
  question_id: string;
  question_text: string;
  question_category?: string;
  response: string;
  ai_suggestion?: string;
  confidence_level?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

/**
 * Upsert a strategic response (Q1-Q22)
 * Creates or updates answer for a specific question
 */
export async function upsertStrategicResponse(data: StrategicResponse) {
  const supabase = await createClient();

  try {
    const { data: response, error } = await supabase
      .from('strategic_responses')
      .upsert(
        {
          business_id: data.business_id,
          question_id: data.question_id,
          question_text: data.question_text,
          question_category: data.question_category,
          response: data.response,
          ai_suggestion: data.ai_suggestion,
          confidence_level: data.confidence_level,
          metadata: data.metadata || {},
        },
        {
          onConflict: 'business_id,question_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: response };
  } catch (error) {
    console.error('Error upserting strategic response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all strategic responses for a business
 */
export async function getStrategicResponses(businessId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('strategic_responses')
      .select('*')
      .eq('business_id', businessId)
      .order('question_id', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching strategic responses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}

/**
 * Get a specific question response
 */
export async function getQuestionResponse(businessId: string, questionId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('strategic_responses')
      .select('*')
      .eq('business_id', businessId)
      .eq('question_id', questionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found, which is ok

    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error fetching question response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Get Q1-Q6 answers formatted for Lindy webhook
 */
export async function getBusinessBasicsForLindy(businessId: string) {
  const supabase = await createClient();

  try {
    // Get Q1-Q6 responses
    const { data: responses, error: responsesError } = await supabase
      .from('strategic_responses')
      .select('question_id, response')
      .eq('business_id', businessId)
      .in('question_id', ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']);

    if (responsesError) throw responsesError;

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('name, website_url, linkedin_url, industry, business_type')
      .eq('id', businessId)
      .single();

    if (businessError) throw businessError;

    // Map responses to Lindy format
    const responseMap = (responses || []).reduce(
      (acc, r) => {
        acc[r.question_id] = r.response;
        return acc;
      },
      {} as Record<string, string>
    );

    return {
      success: true,
      data: {
        project_id: businessId,
        business_name: business.name || responseMap['Q1'] || '',
        website: business.website_url || responseMap['Q2'] || '',
        industry: business.industry || responseMap['Q3'] || '',
        business_type: business.business_type || responseMap['Q4'] || '',
        linkedin: business.linkedin_url || responseMap['Q5'] || '',
        files: responseMap['Q6'] ? JSON.parse(responseMap['Q6']) : [],
      },
    };
  } catch (error) {
    console.error('Error getting business basics for Lindy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

/**
 * Update business basic fields from responses
 */
export async function syncBusinessBasicsFromResponses(businessId: string) {
  const supabase = await createClient();

  try {
    const { data: responses } = await supabase
      .from('strategic_responses')
      .select('question_id, response')
      .eq('business_id', businessId)
      .in('question_id', ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']);

    if (!responses) return { success: true };

    const responseMap = responses.reduce(
      (acc, r) => {
        acc[r.question_id] = r.response;
        return acc;
      },
      {} as Record<string, string>
    );

    // Update businesses table with latest responses
    const { error } = await supabase
      .from('businesses')
      .update({
        name: responseMap['Q1'] || undefined,
        website_url: responseMap['Q2'] || undefined,
        industry: responseMap['Q3'] || undefined,
        business_type: responseMap['Q4'] || undefined,
        linkedin_url: responseMap['Q5'] || undefined,
        basics_completed_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error syncing business basics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
