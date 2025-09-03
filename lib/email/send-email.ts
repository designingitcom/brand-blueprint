import { sendEmail, DEFAULT_FROM } from './resend';
import { WelcomeEmail } from './templates/welcome';
import { PasswordResetEmail } from './templates/password-reset';
import { OnboardingReminderEmail } from './templates/onboarding-reminder';
import { ProjectInvitationEmail } from './templates/project-invitation';

// Welcome email function
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  verificationUrl: string
) {
  try {
    return await sendEmail({
      to: email,
      subject: `Welcome to S1BMW, ${firstName}! Please verify your email`,
      react: WelcomeEmail({
        firstName,
        verificationUrl,
        email,
      }),
      from: DEFAULT_FROM,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Password reset email function
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  expiresIn: string = '1 hour'
) {
  try {
    return await sendEmail({
      to: email,
      subject: 'Reset your S1BMW password',
      react: PasswordResetEmail({
        email,
        resetUrl,
        expiresIn,
      }),
      from: DEFAULT_FROM,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Onboarding reminder email function
export async function sendOnboardingReminderEmail(
  email: string,
  firstName: string,
  businessName?: string,
  daysAgo: number = 3
) {
  try {
    const onboardingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://s1bmw.com'}/onboarding`;
    
    return await sendEmail({
      to: email,
      subject: businessName 
        ? `Complete your ${businessName} setup on S1BMW`
        : 'Complete your S1BMW business setup',
      react: OnboardingReminderEmail({
        firstName,
        businessName,
        onboardingUrl,
        email,
        daysAgo,
      }),
      from: DEFAULT_FROM,
    });
  } catch (error) {
    console.error('Failed to send onboarding reminder email:', error);
    throw new Error(`Failed to send onboarding reminder email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Project invitation email function
export async function sendProjectInviteEmail(
  email: string,
  inviterName: string,
  inviterEmail: string,
  projectName: string,
  inviteUrl: string,
  options: {
    inviteeName?: string;
    projectDescription?: string;
    role?: 'Admin' | 'Editor' | 'Collaborator';
    expiresIn?: string;
  } = {}
) {
  try {
    const {
      inviteeName,
      projectDescription,
      role = 'Collaborator',
      expiresIn = '7 days'
    } = options;

    return await sendEmail({
      to: email,
      subject: `You've been invited to collaborate on "${projectName}"`,
      react: ProjectInvitationEmail({
        inviteeName,
        inviterName,
        inviterEmail,
        projectName,
        projectDescription,
        inviteUrl,
        expiresIn,
        role,
      }),
      from: DEFAULT_FROM,
      replyTo: inviterEmail, // Allow replies to go back to the inviter
    });
  } catch (error) {
    console.error('Failed to send project invitation email:', error);
    throw new Error(`Failed to send project invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Account notification email function (generic)
export async function sendAccountNotificationEmail(
  email: string,
  subject: string,
  content: {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    userName?: string;
  }
) {
  try {
    const { title, message, actionUrl, actionText, userName } = content;
    
    // Simple HTML template for generic notifications
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://s1bmw.com/logo.png" alt="S1BMW" width="120" height="36" style="margin: 0 auto;">
            </div>
            
            <h1 style="color: #333; font-size: 24px; font-weight: bold; text-align: center; margin: 40px 0;">${title}</h1>
            
            ${userName ? `<p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">Hi ${userName},</p>` : ''}
            
            <p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">${message}</p>
            
            ${actionUrl && actionText ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${actionUrl}" style="background-color: #007cba; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px; display: inline-block;">${actionText}</a>
              </div>
            ` : ''}
            
            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
            
            <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 16px 0;">
              Questions? Contact our support team at 
              <a href="mailto:support@s1bmw.com" style="color: #007cba; text-decoration: underline;">support@s1bmw.com</a>
            </p>
            
            <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 16px 0;">
              Best regards,<br>
              The S1BMW Team
            </p>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      from: DEFAULT_FROM,
    });
  } catch (error) {
    console.error('Failed to send account notification email:', error);
    throw new Error(`Failed to send account notification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Team notification email function
export async function sendTeamNotificationEmail(
  emails: string[],
  subject: string,
  content: {
    title: string;
    message: string;
    senderName: string;
    projectName?: string;
    actionUrl?: string;
    actionText?: string;
  }
) {
  try {
    const { title, message, senderName, projectName, actionUrl, actionText } = content;
    
    // Simple HTML template for team notifications
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://s1bmw.com/logo.png" alt="S1BMW" width="120" height="36" style="margin: 0 auto;">
            </div>
            
            <h1 style="color: #333; font-size: 24px; font-weight: bold; text-align: center; margin: 40px 0;">${title}</h1>
            
            ${projectName ? `<p style="color: #666; font-size: 12px; font-weight: bold; text-align: center; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 1px;">Project: ${projectName}</p>` : ''}
            
            <p style="color: #333; font-size: 14px; line-height: 24px; margin: 16px 0;">
              <strong>${senderName}</strong> has sent a team notification:
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #007cba; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #333; font-size: 14px; line-height: 24px; margin: 0;">${message}</p>
            </div>
            
            ${actionUrl && actionText ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${actionUrl}" style="background-color: #007cba; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px; display: inline-block;">${actionText}</a>
              </div>
            ` : ''}
            
            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
            
            <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 16px 0;">
              This notification was sent by ${senderName} through S1BMW.
            </p>
            
            <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 16px 0;">
              Questions? Contact our support team at 
              <a href="mailto:support@s1bmw.com" style="color: #007cba; text-decoration: underline;">support@s1bmw.com</a>
            </p>
          </div>
        </body>
      </html>
    `;

    // Send to multiple recipients using BCC to protect privacy
    return await sendEmail({
      to: 'noreply@s1bmw.com', // Use a placeholder for the main recipient
      bcc: emails, // Send to all team members via BCC
      subject,
      html: htmlContent,
      from: DEFAULT_FROM,
    });
  } catch (error) {
    console.error('Failed to send team notification email:', error);
    throw new Error(`Failed to send team notification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Email template validation helper
export function validateEmailTemplate(templateData: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for required fields based on template type
  if (!templateData.email) {
    errors.push('Email address is required');
  }
  
  if (!templateData.subject && !templateData.title) {
    errors.push('Subject or title is required');
  }
  
  // Validate email format
  if (templateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(templateData.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate URLs if provided
  const urlFields = ['verificationUrl', 'resetUrl', 'inviteUrl', 'actionUrl', 'onboardingUrl'];
  urlFields.forEach(field => {
    if (templateData[field]) {
      try {
        new URL(templateData[field]);
      } catch {
        errors.push(`Invalid URL format for ${field}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Batch email sending with template validation
export async function sendBatchTemplateEmails(
  emailType: 'welcome' | 'password-reset' | 'onboarding-reminder' | 'project-invitation' | 'notification',
  recipients: Array<{
    email: string;
    templateData: Record<string, any>;
  }>
) {
  const results = [];
  const errors = [];
  
  for (const { email, templateData } of recipients) {
    try {
      // Validate template data
      const validation = validateEmailTemplate({ email, ...templateData });
      if (!validation.isValid) {
        errors.push({
          email,
          errors: validation.errors,
        });
        continue;
      }
      
      // Send email based on type
      let result;
      switch (emailType) {
        case 'welcome':
          result = await sendWelcomeEmail(
            email,
            templateData.firstName,
            templateData.verificationUrl
          );
          break;
          
        case 'password-reset':
          result = await sendPasswordResetEmail(
            email,
            templateData.resetUrl,
            templateData.expiresIn
          );
          break;
          
        case 'onboarding-reminder':
          result = await sendOnboardingReminderEmail(
            email,
            templateData.firstName,
            templateData.businessName,
            templateData.daysAgo
          );
          break;
          
        case 'project-invitation':
          result = await sendProjectInviteEmail(
            email,
            templateData.inviterName,
            templateData.inviterEmail,
            templateData.projectName,
            templateData.inviteUrl,
            {
              inviteeName: templateData.inviteeName,
              projectDescription: templateData.projectDescription,
              role: templateData.role,
              expiresIn: templateData.expiresIn,
            }
          );
          break;
          
        case 'notification':
          result = await sendAccountNotificationEmail(
            email,
            templateData.subject,
            {
              title: templateData.title,
              message: templateData.message,
              actionUrl: templateData.actionUrl,
              actionText: templateData.actionText,
              userName: templateData.userName,
            }
          );
          break;
          
        default:
          throw new Error(`Unknown email type: ${emailType}`);
      }
      
      results.push({ email, result, success: true });
    } catch (error) {
      console.error(`Failed to send ${emailType} email to ${email}:`, error);
      errors.push({
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
    }
  }
  
  return {
    successful: results,
    failed: errors,
    total: recipients.length,
    successCount: results.length,
    errorCount: errors.length,
  };
}