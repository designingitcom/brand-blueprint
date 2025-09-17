import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current business
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        businesses!inner(
          id, name, description, website, industry, size, 
          phone, address, onboarding_completed, created_at
        )
      `)
      .eq('owner_id', user.id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const business = organization.businesses[0];
    return NextResponse.json(business);

  } catch (error) {
    console.error('Get current business error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Get user's current business
    const { data: organization } = await supabase
      .from('organizations')
      .select('id, businesses(id)')
      .eq('owner_id', user.id)
      .single();

    if (!organization?.businesses?.[0]) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const businessId = organization.businesses[0].id;

    // Update business
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .select()
      .single();

    if (updateError) {
      console.error('Business update error:', updateError);
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }

    return NextResponse.json(updatedBusiness);

  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}