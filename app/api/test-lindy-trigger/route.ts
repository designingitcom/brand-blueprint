import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to simulate triggering Lindy and immediately returning mock data
 *
 * This bypasses the real Lindy API and webhook flow for faster testing
 *
 * Usage:
 * 1. Complete Q1-Q6 in onboarding
 * 2. Before clicking Next on Q6, open browser console
 * 3. Run: await fetch('/api/test-lindy-trigger?business_id=YOUR_ID').then(r => r.json())
 * 4. Click Next on Q6 to proceed to Q7
 * 5. Suggestions will appear immediately
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const business_id = searchParams.get('business_id');

  if (!business_id) {
    return NextResponse.json({
      instructions: {
        description: 'Fast test endpoint for Lindy integration',
        usage: [
          '1. Complete Q1-Q6 in onboarding',
          '2. Note the business_id from URL or console',
          '3. Call: GET /api/test-lindy-trigger?business_id=YOUR_ID',
          '4. Proceed to Q7 to see instant suggestions'
        ],
        example: '/api/test-lindy-trigger?business_id=uuid-here'
      }
    }, { status: 400 });
  }

  // Simulate the callback immediately
  try {
    const callbackUrl = `${request.nextUrl.origin}/api/test-lindy-callback`;

    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id })
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test suggestions generated and stored',
      business_id,
      result,
      next_steps: [
        'Suggestions are now stored in the database',
        'Navigate to Q7 in the onboarding flow',
        'Suggestions will load automatically'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
