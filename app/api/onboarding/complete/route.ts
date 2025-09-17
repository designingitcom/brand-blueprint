import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData = await request.json();
    
    // Get user's current organization and business
    const { data: organization } = await supabase
      .from('organizations')
      .select('id, businesses(*)')
      .eq('owner_id', user.id)
      .single();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const business = organization.businesses?.[0];
    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    // Update business with onboarding completion and details
    const businessDetails = onboardingData['business-details'] || {};
    const { error: businessError } = await supabase
      .from('businesses')
      .update({
        onboarding_completed: true,
        name: businessDetails.name || business.name,
        description: businessDetails.description || business.description,
        website: businessDetails.website,
        industry: businessDetails.industry,
        size: businessDetails.size,
        phone: businessDetails.phone,
        address: businessDetails.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', business.id);

    if (businessError) {
      console.error('Business update error:', businessError);
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }

    // Store integration data
    const integrations = onboardingData.integrations?.integrations || [];
    if (integrations.length > 0) {
      const integrationUpdates: any = {};
      
      integrations.forEach((integration: any) => {
        switch (integration.id) {
          case 'quickbooks':
            integrationUpdates.quickbooks_customer_id = integration.config?.customer_id;
            break;
          case 'slack':
            integrationUpdates.slack_workspace_id = integration.config?.workspace_id;
            break;
          case 'google-drive':
            integrationUpdates.google_drive_folder_url = integration.config?.folder_url;
            break;
        }
      });
      
      if (Object.keys(integrationUpdates).length > 0) {
        await supabase
          .from('organizations')
          .update(integrationUpdates)
          .eq('id', organization.id);
      }
    }

    // Send team invitations if any
    const teamMembers = onboardingData['team-setup']?.teamMembers || [];
    if (teamMembers.length > 0) {
      // Store team invitations for later processing
      const invitations = teamMembers.map((member: any) => ({
        organization_id: organization.id,
        email: member.email,
        name: member.name,
        role: member.role,
        status: 'pending',
        created_at: new Date().toISOString()
      }));
      
      // Insert invitations (assumes team_invitations table exists)
      await supabase
        .from('team_invitations')
        .insert(invitations)
        .then(() => {
          // Send invitation emails here
          console.log('Team invitations created:', invitations.length);
        })
        .catch((error) => {
          console.log('Team invitations table may not exist yet:', error.message);
        });
    }

    // Log onboarding completion
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        action: 'onboarding_completed',
        details: {
          business_id: business.id,
          team_members_invited: teamMembers.length,
          integrations_connected: integrations.length
        },
        created_at: new Date().toISOString()
      })
      .then(() => console.log('Onboarding completion logged'))
      .catch((error) => console.log('Audit log may not exist yet:', error.message));

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      business_id: business.id,
      organization_id: organization.id
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}