import { NextRequest, NextResponse } from 'next/server';
import { testEmailService } from '@/lib/email';

// Test endpoint to verify email service configuration
export async function GET() {
  try {
    const healthCheck = await testEmailService();

    return NextResponse.json({
      status: 'success',
      testMessage: 'Email service test completed',
      ...healthCheck,
    });
  } catch (error) {
    console.error('Email service test failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Email service test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [
          'Check if RESEND_API_KEY environment variable is set',
          'Verify your Resend API key is valid',
          'Check network connectivity',
        ],
      },
      { status: 500 }
    );
  }
}

// Test endpoint to send a real test email (use with caution)
export async function POST(request: NextRequest) {
  try {
    const { to, template = 'welcome' } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email address (to) is required' },
        { status: 400 }
      );
    }

    // Import specific email function based on template
    let result;

    switch (template) {
      case 'welcome': {
        const { sendWelcomeEmail } = await import('@/lib/email');
        result = await sendWelcomeEmail(
          to,
          'Test User',
          'https://s1bmw.com/verify?token=test-token'
        );
        break;
      }

      case 'password-reset': {
        const { sendPasswordResetEmail } = await import('@/lib/email');
        result = await sendPasswordResetEmail(
          to,
          'https://s1bmw.com/reset-password?token=test-token'
        );
        break;
      }

      case 'onboarding-reminder': {
        const { sendOnboardingReminderEmail } = await import('@/lib/email');
        result = await sendOnboardingReminderEmail(
          to,
          'Test User',
          'Test Business',
          1
        );
        break;
      }

      case 'project-invitation': {
        const { sendProjectInviteEmail } = await import('@/lib/email');
        result = await sendProjectInviteEmail(
          to,
          'Test Inviter',
          'test@s1bmw.com',
          'Test Project',
          'https://s1bmw.com/invite?token=test-token'
        );
        break;
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown template: ${template}. Available: welcome, password-reset, onboarding-reminder, project-invitation`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      status: 'success',
      message: `Test ${template} email sent successfully`,
      result,
      recipient: to,
    });
  } catch (error) {
    console.error('Test email send failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Test email send failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS endpoint for API documentation
export async function OPTIONS() {
  return NextResponse.json({
    endpoints: {
      'GET /api/email/test': {
        description: 'Test email service configuration without sending emails',
        response: 'Health check result',
      },
      'POST /api/email/test': {
        description: 'Send a test email (USE WITH CAUTION - sends real emails)',
        body: {
          to: 'recipient@example.com (required)',
          template:
            'welcome | password-reset | onboarding-reminder | project-invitation (optional, defaults to welcome)',
        },
        response: 'Send result',
      },
    },
    warning:
      'POST endpoint sends real emails. Use only for testing with valid email addresses.',
  });
}
