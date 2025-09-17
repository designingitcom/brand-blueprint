import { NextRequest, NextResponse } from 'next/server';
import { openRouterService } from '@/lib/services/openrouter';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'generateContent': {
        const { prompt, context, model } = data;
        const content = await openRouterService.generateBrandContent(
          prompt,
          context,
          model
        );
        return NextResponse.json({ content });
      }

      case 'analyzeBrandConsistency': {
        const { content, guidelines } = data;
        const analysis = await openRouterService.analyzeBrandConsistency(
          content,
          guidelines
        );
        return NextResponse.json({ analysis });
      }

      case 'generateStrategy': {
        const { businessInfo, targetAudience } = data;
        const strategy = await openRouterService.generateBrandStrategy(
          businessInfo,
          targetAudience
        );
        return NextResponse.json({ strategy });
      }

      case 'getModels': {
        const models = openRouterService.getAvailableModels();
        return NextResponse.json({ models });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
