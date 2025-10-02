export interface BusinessBasics {
  businessName: string;
  website: string;
  industry: string;
  businessType: string;
  linkedin?: string;
  files?: Array<{ name: string; url?: string }>;
}

export interface LindyWebhookPayload {
  project_id: string;
  business_name: string;
  website: string;
  industry: string;
  business_type: string;
  linkedin?: string;
  files?: Array<{ name: string; url?: string }>;
  callback_url: string;
}

export async function sendToLindyWebhook(
  projectId: string,
  businessBasics: BusinessBasics,
  lindyWebhookUrl: string
): Promise<{ success: boolean; error?: string }> {

  try {
    const payload: LindyWebhookPayload = {
      project_id: projectId,
      business_name: businessBasics.businessName,
      website: businessBasics.website,
      industry: businessBasics.industry,
      business_type: businessBasics.businessType,
      linkedin: businessBasics.linkedin,
      files: businessBasics.files,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/lindy/webhooks`
    };

    console.log('🚀 Sending to Lindy webhook:', lindyWebhookUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(lindyWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINDY_WEBHOOK_SECRET || ''}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lindy webhook failed:', response.status, errorText);
      return {
        success: false,
        error: `Webhook failed: ${response.status} ${errorText}`
      };
    }

    console.log('✅ Successfully sent to Lindy webhook');
    return { success: true };

  } catch (error) {
    console.error('❌ Webhook send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
