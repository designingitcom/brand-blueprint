import { render } from '@react-email/render';
import { NextRequest, NextResponse } from 'next/server';
import { WelcomeEmail } from '@/lib/email/templates/welcome';
import { PasswordResetEmail } from '@/lib/email/templates/password-reset';
import { OnboardingReminderEmail } from '@/lib/email/templates/onboarding-reminder';
import { ProjectInvitationEmail } from '@/lib/email/templates/project-invitation';

// Email preview route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');
    const format = searchParams.get('format') || 'html'; // 'html' or 'text'

    if (!template) {
      return NextResponse.json(
        {
          error:
            'Template parameter is required. Available templates: welcome, password-reset, onboarding-reminder, project-invitation',
        },
        { status: 400 }
      );
    }

    let emailComponent;
    let sampleData;

    // Select template and sample data
    switch (template) {
      case 'welcome':
        sampleData = {
          firstName: 'John',
          verificationUrl: 'https://s1bmw.com/verify?token=sample-token-123',
          email: 'john.doe@example.com',
        };
        emailComponent = WelcomeEmail(sampleData);
        break;

      case 'password-reset':
        sampleData = {
          email: 'john.doe@example.com',
          resetUrl:
            'https://s1bmw.com/reset-password?token=sample-reset-token-456',
          expiresIn: '1 hour',
        };
        emailComponent = PasswordResetEmail(sampleData);
        break;

      case 'onboarding-reminder':
        sampleData = {
          firstName: 'Sarah',
          businessName: 'BMW Performance Shop',
          onboardingUrl:
            'https://s1bmw.com/onboarding?token=sample-onboarding-token-789',
          email: 'sarah.johnson@bmwperformance.com',
          daysAgo: 3,
        };
        emailComponent = OnboardingReminderEmail(sampleData);
        break;

      case 'project-invitation':
        sampleData = {
          inviteeName: 'Mike',
          inviterName: 'Alex Rodriguez',
          inviterEmail: 'alex@s1bmw.com',
          projectName: 'E46 M3 Restoration Project',
          projectDescription:
            'Complete restoration of a 2003 BMW E46 M3 including engine rebuild, suspension upgrade, and interior refresh.',
          inviteUrl: 'https://s1bmw.com/invite?token=sample-invite-token-abc',
          expiresIn: '7 days',
          role: 'Editor',
        };
        emailComponent = ProjectInvitationEmail(sampleData);
        break;

      default:
        return NextResponse.json(
          {
            error: `Unknown template: ${template}. Available templates: welcome, password-reset, onboarding-reminder, project-invitation`,
          },
          { status: 400 }
        );
    }

    // Render the email component
    if (format === 'text') {
      const textContent = await render(emailComponent, { plainText: true });
      return new NextResponse(textContent, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      const htmlContent = await render(emailComponent);
      return new NextResponse(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      {
        error: 'Failed to render email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for custom data preview
export async function POST(request: NextRequest) {
  try {
    const { template, data, format = 'html' } = await request.json();

    if (!template) {
      return NextResponse.json(
        { error: 'Template parameter is required' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Data object is required' },
        { status: 400 }
      );
    }

    let emailComponent;

    // Select template with custom data
    switch (template) {
      case 'welcome':
        emailComponent = WelcomeEmail({
          firstName: data.firstName || 'User',
          verificationUrl: data.verificationUrl || 'https://s1bmw.com/verify',
          email: data.email || 'user@example.com',
        });
        break;

      case 'password-reset':
        emailComponent = PasswordResetEmail({
          email: data.email || 'user@example.com',
          resetUrl: data.resetUrl || 'https://s1bmw.com/reset-password',
          expiresIn: data.expiresIn || '1 hour',
        });
        break;

      case 'onboarding-reminder':
        emailComponent = OnboardingReminderEmail({
          firstName: data.firstName || 'User',
          businessName: data.businessName,
          onboardingUrl: data.onboardingUrl || 'https://s1bmw.com/onboarding',
          email: data.email || 'user@example.com',
          daysAgo: data.daysAgo || 3,
        });
        break;

      case 'project-invitation':
        emailComponent = ProjectInvitationEmail({
          inviteeName: data.inviteeName,
          inviterName: data.inviterName || 'Team Member',
          inviterEmail: data.inviterEmail || 'user@example.com',
          projectName: data.projectName || 'BMW Project',
          projectDescription: data.projectDescription,
          inviteUrl: data.inviteUrl || 'https://s1bmw.com/invite',
          expiresIn: data.expiresIn || '7 days',
          role: data.role || 'Collaborator',
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown template: ${template}` },
          { status: 400 }
        );
    }

    // Render the email component
    if (format === 'text') {
      const textContent = await render(emailComponent, { plainText: true });
      return new NextResponse(textContent, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      const htmlContent = await render(emailComponent);
      return new NextResponse(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      {
        error: 'Failed to render email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper endpoint to list available templates
export async function OPTIONS() {
  return NextResponse.json({
    templates: [
      {
        name: 'welcome',
        description: 'Welcome email with verification link',
        sampleParams: {
          firstName: 'John',
          verificationUrl: 'https://s1bmw.com/verify?token=sample',
          email: 'john@example.com',
        },
      },
      {
        name: 'password-reset',
        description: 'Password reset email',
        sampleParams: {
          email: 'john@example.com',
          resetUrl: 'https://s1bmw.com/reset-password?token=sample',
          expiresIn: '1 hour',
        },
      },
      {
        name: 'onboarding-reminder',
        description: 'Business onboarding reminder',
        sampleParams: {
          firstName: 'Sarah',
          businessName: 'BMW Performance Shop',
          onboardingUrl: 'https://s1bmw.com/onboarding',
          email: 'sarah@example.com',
          daysAgo: 3,
        },
      },
      {
        name: 'project-invitation',
        description: 'Project collaboration invitation',
        sampleParams: {
          inviteeName: 'Mike',
          inviterName: 'Alex Rodriguez',
          inviterEmail: 'alex@s1bmw.com',
          projectName: 'E46 M3 Restoration',
          projectDescription: 'Complete restoration project',
          inviteUrl: 'https://s1bmw.com/invite?token=sample',
          role: 'Editor',
        },
      },
    ],
    usage: {
      get: 'GET /api/email/preview?template={template}&format={html|text}',
      post: 'POST /api/email/preview with { template, data, format }',
      options: 'OPTIONS /api/email/preview for this help',
    },
  });
}
