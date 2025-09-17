# S1BMW Email System Documentation

This directory contains the complete email system for the S1BMW application, built with Resend and React Email components.

## Features

- 📧 **Professional Email Templates**: Beautiful, responsive email templates
- 🔄 **Retry Logic**: Automatic retry with exponential backoff for failed sends
- 📊 **Batch Processing**: Send emails in batches to respect rate limits
- ✅ **Template Validation**: Validate email data before sending
- 🛠️ **Testing Tools**: Preview and test email templates
- 🎯 **TypeScript Support**: Full type safety for all email operations

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Required
RESEND_API_KEY=your_resend_api_key

# Optional (for dynamic URLs in emails)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Domain Configuration

In your Resend dashboard:

1. Add and verify your domain
2. Update the `DEFAULT_FROM` constant in `resend.ts` with your domain

## Usage

### Basic Email Sending

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// Send welcome email
await sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://yourdomain.com/verify?token=abc123'
);
```

### Available Email Functions

```typescript
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOnboardingReminderEmail,
  sendProjectInviteEmail,
  sendAccountNotificationEmail,
  sendTeamNotificationEmail,
} from '@/lib/email';

// Welcome email with verification
await sendWelcomeEmail(email, firstName, verificationUrl);

// Password reset email
await sendPasswordResetEmail(email, resetUrl, expiresIn);

// Onboarding reminder
await sendOnboardingReminderEmail(email, firstName, businessName, daysAgo);

// Project invitation
await sendProjectInviteEmail(
  email,
  inviterName,
  inviterEmail,
  projectName,
  inviteUrl,
  { role: 'Editor', projectDescription: '...' }
);
```

### Batch Email Sending

```typescript
import { sendBatchTemplateEmails } from '@/lib/email';

const recipients = [
  {
    email: 'user1@example.com',
    templateData: { firstName: 'John', verificationUrl: '...' },
  },
  {
    email: 'user2@example.com',
    templateData: { firstName: 'Jane', verificationUrl: '...' },
  },
];

const result = await sendBatchTemplateEmails('welcome', recipients);
console.log(`Sent ${result.successCount} emails, ${result.errorCount} failed`);
```

### Custom Email Sending

```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'recipient@example.com',
  subject: 'Custom Email',
  html: '<h1>Hello World</h1>',
  from: 'noreply@yourdomain.com',
  attachments: [
    {
      filename: 'document.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ],
});
```

## Email Templates

### Available Templates

1. **Welcome Email** (`welcome.tsx`)
   - User registration confirmation
   - Email verification link
   - Feature highlights

2. **Password Reset** (`password-reset.tsx`)
   - Secure password reset flow
   - Expiration warnings
   - Security notices

3. **Onboarding Reminder** (`onboarding-reminder.tsx`)
   - Business setup prompts
   - Feature benefits
   - Progress tracking

4. **Project Invitation** (`project-invitation.tsx`)
   - Team collaboration invites
   - Role-based permissions
   - Project details

### Template Props

Each template accepts specific props:

```typescript
// Welcome Email Props
interface WelcomeEmailProps {
  firstName: string;
  verificationUrl: string;
  email: string;
}

// Password Reset Props
interface PasswordResetEmailProps {
  email: string;
  resetUrl: string;
  expiresIn?: string;
}

// Onboarding Reminder Props
interface OnboardingReminderEmailProps {
  firstName: string;
  businessName?: string;
  onboardingUrl: string;
  email: string;
  daysAgo?: number;
}

// Project Invitation Props
interface ProjectInvitationEmailProps {
  inviteeName?: string;
  inviterName: string;
  inviterEmail: string;
  projectName: string;
  projectDescription?: string;
  inviteUrl: string;
  expiresIn?: string;
  role?: 'Admin' | 'Editor' | 'Collaborator';
}
```

## Testing & Development

### Email Preview

Preview emails during development:

```bash
# Get sample email preview
GET /api/email/preview?template=welcome&format=html

# Preview with custom data
POST /api/email/preview
{
  "template": "welcome",
  "data": {
    "firstName": "John",
    "verificationUrl": "https://example.com/verify",
    "email": "john@example.com"
  },
  "format": "html"
}
```

### Service Health Check

```bash
# Test email service configuration
GET /api/email/test

# Send test email (use carefully!)
POST /api/email/test
{
  "to": "your-email@example.com",
  "template": "welcome"
}
```

### Development Server

```bash
npm run dev

# Preview emails at:
http://localhost:3000/api/email/preview?template=welcome
http://localhost:3000/api/email/preview?template=password-reset
http://localhost:3000/api/email/preview?template=onboarding-reminder
http://localhost:3000/api/email/preview?template=project-invitation
```

## Error Handling

The email system includes comprehensive error handling:

```typescript
try {
  await sendWelcomeEmail(email, firstName, verificationUrl);
} catch (error) {
  console.error('Email failed:', error.message);
  // Handle error (log, retry, notify admin, etc.)
}
```

### Automatic Retry

Emails are automatically retried with exponential backoff:

- 3 retry attempts
- Exponential delay: 1s, 2s, 4s
- Certain errors (auth, invalid email) are not retried

## Rate Limiting

The system respects Resend's rate limits:

- Batch processing with configurable batch size
- Automatic delays between batches
- Individual email retry logic

## Best Practices

### 1. Email Validation

Always validate email addresses before sending:

```typescript
import { validateEmail } from '@/lib/email';

if (!validateEmail(email)) {
  throw new Error('Invalid email address');
}
```

### 2. Template Validation

Use template validation for batch operations:

```typescript
import { validateEmailTemplate } from '@/lib/email';

const validation = validateEmailTemplate({ email, firstName, verificationUrl });
if (!validation.isValid) {
  console.error('Template validation failed:', validation.errors);
  return;
}
```

### 3. Environment-Specific Configuration

```typescript
// Use different domains for different environments
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://s1bmw.com'
    : 'http://localhost:3000';

const verificationUrl = `${baseUrl}/verify?token=${token}`;
```

### 4. Error Monitoring

```typescript
import { sendWelcomeEmail } from '@/lib/email';

try {
  await sendWelcomeEmail(email, firstName, verificationUrl);
} catch (error) {
  // Log to your monitoring service
  console.error('Welcome email failed:', {
    email,
    error: error.message,
    timestamp: new Date().toISOString(),
  });

  // Optionally notify admins or retry later
  throw error;
}
```

### 5. Personalization

Make emails more engaging with personalization:

```typescript
// Extract name from email if firstName not provided
import { getNameFromEmail } from '@/lib/email';

const displayName = firstName || getNameFromEmail(email);
await sendWelcomeEmail(email, displayName, verificationUrl);
```

## Security Considerations

- Never include sensitive data in email URLs
- Use secure tokens with expiration
- Validate all input data before processing
- Use HTTPS for all email links
- Consider rate limiting email sending per user
- Implement email verification for security-critical actions

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check `RESEND_API_KEY` environment variable
   - Verify key is valid in Resend dashboard

2. **Domain Issues**
   - Ensure domain is verified in Resend
   - Check DNS records are properly configured

3. **Template Rendering Errors**
   - Verify React Email components are properly installed
   - Check template props match interface definitions

4. **Rate Limiting**
   - Use batch processing for multiple emails
   - Implement delays between large sends

### Debug Mode

Enable detailed logging:

```typescript
// Set DEBUG environment variable
DEBUG=email:*

// Or add console.log in development
if (process.env.NODE_ENV === 'development') {
  console.log('Sending email:', { to, subject, template });
}
```

## API Reference

### Core Functions

- `sendEmail(options)` - Send single email
- `sendBatchEmails(emails, batchSize)` - Send multiple emails
- `testEmailService()` - Health check
- `validateEmail(email)` - Email format validation
- `getNameFromEmail(email)` - Extract name from email

### Template Functions

- `sendWelcomeEmail(email, firstName, verificationUrl)`
- `sendPasswordResetEmail(email, resetUrl, expiresIn?)`
- `sendOnboardingReminderEmail(email, firstName, businessName?, daysAgo?)`
- `sendProjectInviteEmail(email, inviterName, inviterEmail, projectName, inviteUrl, options?)`

### Utility Functions

- `validateEmailTemplate(data)` - Template validation
- `sendBatchTemplateEmails(type, recipients)` - Batch template sending
- `sendAccountNotificationEmail(email, subject, content)` - Generic notifications
- `sendTeamNotificationEmail(emails, subject, content)` - Team notifications

For more details, see the TypeScript definitions in `index.ts`.
