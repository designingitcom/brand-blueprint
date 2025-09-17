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

    // Get user's organization with Slack integration data
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, slack_workspace_id, name')
      .eq('owner_id', user.id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Mock Slack data - in production this would call Slack API
    const mockSlackData = {
      connected: !!organization.slack_workspace_id,
      workspace_id: organization.slack_workspace_id,
      workspace_info: organization.slack_workspace_id ? {
        name: `${organization.name} Workspace`,
        id: organization.slack_workspace_id,
        url: `https://${organization.name.toLowerCase().replace(/\s+/g, '')}.slack.com`
      } : null,
      channels: organization.slack_workspace_id ? [
        {
          id: 'C1234567890',
          name: 'brand-development',
          purpose: 'Discussions about brand strategy and development',
          members: 5,
          is_private: false
        },
        {
          id: 'C0987654321',
          name: 'project-updates',
          purpose: 'Project status updates and milestones',
          members: 3,
          is_private: false
        },
        {
          id: 'C1122334455',
          name: 'client-feedback',
          purpose: 'Client feedback and review discussions',
          members: 4,
          is_private: true
        }
      ] : [],
      recent_messages: organization.slack_workspace_id ? [
        {
          channel: 'brand-development',
          user: 'Sarah Chen',
          message: 'Brand voice guidelines are ready for review',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          reactions: ['👍', '🎉']
        },
        {
          channel: 'project-updates',
          user: 'Mike Johnson',
          message: 'Competitor analysis completed for Module M2',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          reactions: ['✅']
        },
        {
          channel: 'client-feedback',
          user: 'Alex Kim',
          message: 'Client approved the logo concepts, moving to next phase',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          reactions: ['🚀', '👏']
        }
      ] : [],
      notifications: organization.slack_workspace_id ? {
        enabled: true,
        project_updates: true,
        milestone_alerts: true,
        deadline_reminders: true
      } : null,
      sync_status: {
        last_sync: organization.slack_workspace_id ? new Date().toISOString() : null,
        status: organization.slack_workspace_id ? 'success' : 'not_configured',
        next_sync: organization.slack_workspace_id ? 
          new Date(Date.now() + 30 * 60 * 1000).toISOString() : null // Every 30 minutes
      }
    };

    return NextResponse.json(mockSlackData);

  } catch (error) {
    console.error('Slack integration error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Slack data' },
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

    const { workspace_id, webhook_url, action, message } = await request.json();

    // Get user's organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('owner_id', user.id)
      .single();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (action === 'connect') {
      // Update organization with Slack workspace ID
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          slack_workspace_id: workspace_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) {
        console.error('Slack connection error:', updateError);
        return NextResponse.json({ error: 'Failed to connect Slack' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Slack workspace connected successfully',
        workspace_id 
      });

    } else if (action === 'disconnect') {
      // Remove Slack integration
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          slack_workspace_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (updateError) {
        console.error('Slack disconnection error:', updateError);
        return NextResponse.json({ error: 'Failed to disconnect Slack' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Slack workspace disconnected successfully' 
      });

    } else if (action === 'send_message') {
      // Mock sending a message to Slack - in production would use webhook_url
      if (!message) {
        return NextResponse.json({ error: 'Message content required' }, { status: 400 });
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json({
        success: true,
        message: 'Message sent to Slack successfully',
        sent_to: {
          workspace: organization.name,
          channel: '#project-updates',
          timestamp: new Date().toISOString()
        }
      });

    } else if (action === 'sync_channels') {
      // Mock channel sync - in production would fetch from Slack API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: 'Slack channels synced successfully',
        sync_time: new Date().toISOString(),
        channels_found: 3,
        members_found: 12
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Slack integration error:', error);
    return NextResponse.json(
      { error: 'Failed to process Slack request' },
      { status: 500 }
    );
  }
}