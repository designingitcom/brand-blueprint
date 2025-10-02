'use server';

import { createClient } from '@/lib/supabase/server';

export interface LindyQ7Suggestion {
  suggestion: string;
  confidence?: number;
  rationale?: string;
}

export async function fetchLindyQ7Suggestions(businessId: string) {
  try {
    const supabase = await createClient();

    // Fetch Q7 suggestions from lindy_responses table
    const { data, error } = await supabase
      .from('lindy_responses')
      .select('*')
      .eq('business_id', businessId)
      .eq('question_id', 'Q7')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log('ℹ️ No Lindy suggestions found yet for business:', businessId);
      return {
        success: false,
        suggestions: [],
        message: 'Waiting for AI suggestions...',
      };
    }

    // Extract suggestions from the response
    const suggestions: LindyQ7Suggestion[] = data.suggestions || [];

    console.log(`✅ Found ${suggestions.length} Q7 suggestions from Lindy`);

    return {
      success: true,
      suggestions,
      conversationId: data.content?.conversation_id,
      createdAt: data.created_at,
    };

  } catch (error) {
    console.error('❌ Error fetching Lindy suggestions:', error);
    return {
      success: false,
      suggestions: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Poll for Lindy suggestions with timeout
 * Useful when we just triggered Lindy and are waiting for response
 */
export async function pollForLindySuggestions(
  businessId: string,
  maxAttempts: number = 10,
  delayMs: number = 2000
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔍 Polling attempt ${attempt}/${maxAttempts} for Lindy suggestions...`);

    const result = await fetchLindyQ7Suggestions(businessId);

    if (result.success && result.suggestions && result.suggestions.length > 0) {
      console.log('✅ Lindy suggestions received!');
      return result;
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting ${delayMs}ms before next poll...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log('⏱️ Polling timeout - Lindy suggestions not received yet');
  return {
    success: false,
    suggestions: [],
    message: 'AI is still processing. You can continue and suggestions will appear when ready.',
  };
}
