import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify webhook signature from Lindy
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;

  const hmac = createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    console.log('🎯 Received webhook from Lindy:', JSON.stringify(payload, null, 2));

    // Verify webhook signature (optional - Lindy may not send signature)
    const signature = request.headers.get('x-lindy-signature') || request.headers.get('x-webhook-signature');
    const secret = process.env.LINDY_WEBHOOK_SECRET;

    if (signature && secret) {
      if (verifySignature(rawBody, signature, secret)) {
        console.log('✅ Webhook signature verified');
      } else {
        console.warn('⚠️ Invalid webhook signature - proceeding anyway');
      }
    } else {
      console.log('ℹ️ No signature verification (Lindy does not send signatures)');
    }

    // Handle both payload formats:
    // 1. Wrapped format: { method: "POST", body: { type: "...", ... } }
    // 2. Direct format: { type: "...", ... }
    const webhookData = payload.body || payload;

    if (webhookData?.type === 'q7_suggestions_ready') {
      // Store Q7 suggestions in Supabase
      const { error } = await supabase
        .from('lindy_responses')
        .insert({
          business_id: webhookData.project_id,
          question_id: 'Q7',
          role: 'lindy',
          content: webhookData,
          suggestions: webhookData.q7_suggestions,
          idempotency_key: `q7-${webhookData.project_id}-${Date.now()}`
        });

      if (error) {
        console.error('❌ Supabase error:', error);

        // Log failed incoming webhook
        await supabase.from('lindy_request_logs').insert({
          business_id: webhookData.project_id,
          direction: 'incoming',
          endpoint: request.url,
          method: 'POST',
          payload: webhookData,
          response_status: 500,
          success: false,
          error_message: error.message,
          processing_time_ms: Date.now() - startTime,
          question_id: 'Q7'
        });

        return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
      }

      const processingTime = Date.now() - startTime;
      console.log('✅ Stored Q7 suggestions in Supabase');

      // Log successful incoming webhook
      await supabase.from('lindy_request_logs').insert({
        business_id: webhookData.project_id,
        direction: 'incoming',
        endpoint: request.url,
        method: 'POST',
        payload: webhookData,
        response_status: 200,
        response_body: {
          received: true,
          stored: true,
          suggestions_count: webhookData.q7_suggestions?.length || 0
        },
        success: true,
        processing_time_ms: processingTime,
        question_id: 'Q7'
      });

      return NextResponse.json({
        received: true,
        stored: true,
        suggestions_count: webhookData.q7_suggestions?.length || 0
      });
    }

    // Handle other webhook types
    console.log('📝 Received webhook but no handler for type:', webhookData?.type);
    return NextResponse.json({ received: true, message: 'Webhook received but not processed' });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
