import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Test endpoint to simulate Lindy webhook callback
 *
 * Usage:
 * 1. Start onboarding, get to Q6, note the business_id from the URL or logs
 * 2. Call this endpoint: POST /api/test-lindy-callback
 *    Body: { "business_id": "your-business-id-here" }
 * 3. This will simulate Lindy sending back suggestions
 *
 * Or test with curl:
 * curl -X POST http://localhost:3000/api/test-lindy-callback \
 *   -H "Content-Type: application/json" \
 *   -d '{"business_id": "YOUR_BUSINESS_ID"}'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id } = body;

    if (!business_id) {
      return NextResponse.json(
        { error: 'business_id is required' },
        { status: 400 }
      );
    }

    console.log('🧪 TEST: Simulating Lindy callback for business:', business_id);

    const supabase = await createClient();

    // Create mock suggestions (similar to what Lindy would send)
    const mockSuggestions = [
      {
        suggestion: 'We help ambitious professionals transform their expertise into scalable online businesses through proven frameworks and personalized coaching.',
        confidence: 0.95,
        reasoning: 'Based on your B2B focus and professional services industry'
      },
      {
        suggestion: 'Empowering service-based businesses to break free from the time-for-money trap by building systems that scale without sacrificing quality.',
        confidence: 0.92,
        reasoning: 'Aligned with business type and industry focus'
      },
      {
        suggestion: 'Transform your professional expertise into a thriving digital ecosystem that works while you sleep.',
        confidence: 0.88,
        reasoning: 'Captures transformation and scalability themes'
      }
    ];

    // Store suggestions in lindy_responses table (SAME AS REAL LINDY WEBHOOK)
    const { data: insertData, error: insertError } = await supabase
      .from('lindy_responses')
      .insert({
        business_id,
        question_id: 'Q7',
        role: 'lindy',
        content: {
          type: 'q7_suggestions_ready',
          project_id: business_id,
          q7_suggestions: mockSuggestions,
          metadata: {
            model: 'test-simulation',
            timestamp: new Date().toISOString(),
            test: true
          }
        },
        suggestions: mockSuggestions,
        idempotency_key: `q7-test-${business_id}-${Date.now()}`
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ TEST: Error inserting mock suggestions:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ TEST: Mock suggestions stored successfully:', insertData.id);

    return NextResponse.json({
      success: true,
      message: 'Test suggestions stored successfully',
      suggestions: mockSuggestions,
      ai_message_id: insertData.id
    });

  } catch (error) {
    console.error('❌ TEST: Error in test endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch test instructions
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/test-lindy-callback',
    method: 'POST',
    description: 'Simulate Lindy webhook callback for testing',
    usage: {
      'Step 1': 'Start onboarding flow and complete Q1-Q6',
      'Step 2': 'Note the business_id from URL or browser console logs',
      'Step 3': 'Call this endpoint with the business_id',
      'Step 4': 'Go back to onboarding and proceed to Q7 to see suggestions'
    },
    example_curl: `curl -X POST http://localhost:3000/api/test-lindy-callback \\
  -H "Content-Type: application/json" \\
  -d '{"business_id": "YOUR_BUSINESS_ID"}'`,
    example_body: {
      business_id: 'uuid-from-your-onboarding'
    }
  });
}
