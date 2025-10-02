'use server';

import { createClient } from '@/lib/supabase/server';

const LINDY_WEBHOOK_URL = 'https://public.lindy.ai/api/v1/webhooks/lindy/cffa7dc6-0635-4e49-95a0-a25db2f95f54';
const CALLBACK_URL = process.env.LINDY_CALLBACK_URL || 'https://f70c702c2186.ngrok-free.app/api/lindy/webhooks';

interface TriggerLindyParams {
  businessId: string;
}

interface LindyWebhookPayload {
  project_id: string;
  business_name: string;
  website?: string;
  website_context?: string;
  industry?: string;
  business_type?: string;
  linkedin?: string;
  files?: string[];
  callback_url: string;
}

export async function triggerLindyQ7Suggestions({ businessId }: TriggerLindyParams) {
  try {
    // SKIP LINDY IN DEVELOPMENT - use test button instead to save API credits
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_LINDY_IN_DEV !== 'false') {
      console.log('⚠️ SKIPPING Lindy trigger in development mode - use test button instead');
      return {
        success: true,
        message: 'Development mode: Use test button to load suggestions',
        skipped: true
      };
    }

    const supabase = await createClient();

    // Get business data
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('❌ Failed to fetch business:', businessError);
      return { success: false, error: 'Business not found' };
    }

    // Parse files_uploaded safely (handle different data types)
    let files: string[] = [];
    if (business.files_uploaded) {
      if (Array.isArray(business.files_uploaded)) {
        // Already an array (Postgres JSONB)
        files = business.files_uploaded;
      } else if (typeof business.files_uploaded === 'string' && business.files_uploaded.trim()) {
        // String that needs parsing
        try {
          files = JSON.parse(business.files_uploaded);
        } catch (e) {
          console.warn('⚠️ Invalid JSON in files_uploaded, using empty array');
          files = [];
        }
      }
    }

    // Prepare payload for Lindy
    const payload: LindyWebhookPayload = {
      project_id: businessId,
      business_name: business.name,
      website: business.website_url || undefined,
      website_context: business.website_context || undefined,
      industry: business.industry || undefined,
      business_type: business.business_type || undefined,
      linkedin: business.linkedin_url || undefined,
      files,
      callback_url: CALLBACK_URL,
    };

    console.log('🚀 Triggering Lindy with payload:', JSON.stringify(payload, null, 2));

    const startTime = Date.now();

    // Trigger Lindy webhook
    const response = await fetch(LINDY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lindy webhook failed:', response.status, errorText);

      // Log failed outgoing request
      await supabase.from('lindy_request_logs').insert({
        business_id: businessId,
        direction: 'outgoing',
        endpoint: LINDY_WEBHOOK_URL,
        method: 'POST',
        payload,
        response_status: response.status,
        success: false,
        error_message: errorText,
        processing_time_ms: processingTime,
        question_id: 'Q7'
      });

      return {
        success: false,
        error: `Lindy webhook returned ${response.status}`
      };
    }

    const result = await response.json();
    console.log('✅ Lindy triggered successfully:', result);

    // Log successful outgoing request
    await supabase.from('lindy_request_logs').insert({
      business_id: businessId,
      direction: 'outgoing',
      endpoint: LINDY_WEBHOOK_URL,
      method: 'POST',
      payload,
      response_status: response.status,
      response_body: result,
      success: true,
      processing_time_ms: processingTime,
      question_id: 'Q7'
    });

    return {
      success: true,
      message: 'Lindy is processing your business data. Suggestions will arrive shortly.',
      lindyResponse: result
    };

  } catch (error) {
    console.error('❌ Error triggering Lindy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
