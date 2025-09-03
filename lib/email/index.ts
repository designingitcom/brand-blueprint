// Main email service exports
export {
  sendEmail,
  sendBatchEmails,
  testEmailService,
  validateEmail,
  getNameFromEmail,
  DEFAULT_FROM,
  SUPPORT_EMAIL,
  resend,
} from './resend';

// Email utility functions
export {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOnboardingReminderEmail,
  sendProjectInviteEmail,
  sendAccountNotificationEmail,
  sendTeamNotificationEmail,
  validateEmailTemplate,
  sendBatchTemplateEmails,
} from './send-email';

// Email template components
export { WelcomeEmail } from './templates/welcome';
export { PasswordResetEmail } from './templates/password-reset';
export { OnboardingReminderEmail } from './templates/onboarding-reminder';
export { ProjectInvitationEmail } from './templates/project-invitation';

// Type definitions for better TypeScript support
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailSendOptions {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

export interface BatchEmailResult {
  successful: Array<{ index: number; result: any; success: true }>;
  failed: Array<{ index: number; error: any; success: false }>;
  total: number;
  successCount: number;
  errorCount: number;
}

// Email template validation types
export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TemplateEmailData {
  email: string;
  templateData: Record<string, any>;
}

// Project invitation role types
export type ProjectRole = 'Admin' | 'Editor' | 'Collaborator';

// Common email template props interfaces
export interface WelcomeEmailProps {
  firstName: string;
  verificationUrl: string;
  email: string;
}

export interface PasswordResetEmailProps {
  email: string;
  resetUrl: string;
  expiresIn?: string;
}

export interface OnboardingReminderEmailProps {
  firstName: string;
  businessName?: string;
  onboardingUrl: string;
  email: string;
  daysAgo?: number;
}

export interface ProjectInvitationEmailProps {
  inviteeName?: string;
  inviterName: string;
  inviterEmail: string;
  projectName: string;
  projectDescription?: string;
  inviteUrl: string;
  expiresIn?: string;
  role?: ProjectRole;
}

// Notification email content interface
export interface NotificationContent {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  userName?: string;
}

// Team notification content interface
export interface TeamNotificationContent {
  title: string;
  message: string;
  senderName: string;
  projectName?: string;
  actionUrl?: string;
  actionText?: string;
}

// Email service health check result
export interface EmailServiceHealthResult {
  success: boolean;
  message: string;
  result?: any;
  error?: string;
}

// Batch template email types
export type EmailTemplateType = 
  | 'welcome' 
  | 'password-reset' 
  | 'onboarding-reminder' 
  | 'project-invitation' 
  | 'notification';

// Template data type mapping
export interface TemplateDataMapping {
  'welcome': WelcomeEmailProps;
  'password-reset': PasswordResetEmailProps;
  'onboarding-reminder': OnboardingReminderEmailProps;
  'project-invitation': ProjectInvitationEmailProps;
  'notification': NotificationContent;
}

// Utility type for template-specific data
export type TemplateData<T extends EmailTemplateType> = TemplateDataMapping[T];

// Re-export React Email render function for convenience
export { render } from '@react-email/render';