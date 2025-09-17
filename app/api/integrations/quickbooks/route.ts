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

    // Get user's organization with QuickBooks integration data
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, quickbooks_customer_id, name')
      .eq('owner_id', user.id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Mock QuickBooks data - in production this would call QuickBooks API
    const mockQuickBooksData = {
      connected: !!organization.quickbooks_customer_id,
      customer_id: organization.quickbooks_customer_id,
      company_info: {
        name: organization.name,
        id: organization.quickbooks_customer_id || null
      },
      invoices: organization.quickbooks_customer_id ? [
        {
          id: 'INV-2025001',
          amount: 2500.00,
          status: 'Paid',
          date: '2025-09-01',
          description: 'Brand Foundation Module (M1)',
          due_date: '2025-09-15'
        },
        {
          id: 'INV-2025002',
          amount: 1800.00,
          status: 'Sent',
          date: '2025-09-05',
          description: 'Market Research Module (M2)',
          due_date: '2025-09-20'
        },
        {
          id: 'INV-2025003',
          amount: 3200.00,
          status: 'Draft',
          date: '2025-09-10',
          description: 'Brand Strategy Package',
          due_date: '2025-09-25'
        }
      ] : [],
      customers: organization.quickbooks_customer_id ? [
        {
          id: organization.quickbooks_customer_id,
          name: organization.name,
          balance: 5300.00,
          status: 'Active'
        }
      ] : [],
      sync_status: {
        last_sync: organization.quickbooks_customer_id ? new Date().toISOString() : null,
        status: organization.quickbooks_customer_id ? 'success' : 'not_configured',
        next_sync: organization.quickbooks_customer_id ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
      }
    };

    return NextResponse.json(mockQuickBooksData);

  } catch (error) {
    console.error('QuickBooks integration error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QuickBooks data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customer_id, company_id, action } = await request.json();

    // Get user's organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (action === 'connect') {
      // Update organization with QuickBooks customer ID
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          quickbooks_customer_id: customer_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) {
        console.error('QuickBooks connection error:', updateError);
        return NextResponse.json({ error: 'Failed to connect QuickBooks' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'QuickBooks connected successfully',
        customer_id 
      });

    } else if (action === 'disconnect') {
      // Remove QuickBooks integration
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          quickbooks_customer_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) {
        console.error('QuickBooks disconnection error:', updateError);
        return NextResponse.json({ error: 'Failed to disconnect QuickBooks' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'QuickBooks disconnected successfully' 
      });

    } else if (action === 'sync') {
      // Mock sync operation - in production would sync with QuickBooks API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      return NextResponse.json({
        success: true,
        message: 'QuickBooks data synced successfully',
        sync_time: new Date().toISOString(),
        records_synced: {
          invoices: 3,
          customers: 1,
          items: 0
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('QuickBooks integration error:', error);
    return NextResponse.json(
      { error: 'Failed to process QuickBooks request' },
      { status: 500 }
    );
  }
}