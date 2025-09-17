# Email Configuration Guide

## Current Issue

Supabase has restricted email sending due to high bounce rates from invalid test email addresses.

## Solution: Using Resend for Email Delivery

### 1. Email Setup

The application is configured to use Resend (custom SMTP provider) instead of Supabase's built-in email service.

**Resend API Key**: Already configured in `.env`

```
RESEND_API_KEY=re_EU3GtkrD_8H2xtQ9rSzpTWL8RgQkSThRE
```

### 2. Email Flow

When a user signs up:

1. User account is created in Supabase Auth
2. Welcome email is sent via Resend API (not Supabase)
3. Email contains verification link
4. User sees success message: "Please check your email to confirm your account"

### 3. Testing with Valid Emails

For testing, use one of these approaches:

#### Option 1: Plus Addressing (Recommended)

Use your real email with `+` addressing:

```
florian+test1@designingit.com
florian+test2@designingit.com
florian+test3@designingit.com
```

All emails will arrive at florian@designingit.com

#### Option 2: Test Email Services

- [Mailinator](https://www.mailinator.com/) - Public inboxes
- [TempMail](https://temp-mail.org/) - Temporary email addresses
- [Mailtrap](https://mailtrap.io/) - Email testing service

#### Option 3: Development Mode

For local development, you can:

1. Check console logs for email content
2. Use Resend's test mode
3. Set up a local mail catcher

### 4. Supabase Configuration

To prevent further issues:

1. **Disable Supabase Email Templates**
   - Go to Supabase Dashboard > Authentication > Email Templates
   - Disable all automatic emails
   - We handle emails through Resend

2. **Update Auth Settings**
   - Go to Authentication > Settings
   - Set "Enable email confirmations" based on your needs
   - Consider using "autoconfirm" for development

### 5. Production Setup

For production:

1. Verify your domain with Resend
2. Set up SPF, DKIM, and DMARC records
3. Use production email templates
4. Monitor email delivery rates

### 6. Monitoring

Track email performance:

- Resend Dashboard: https://resend.com/emails
- Check delivery rates
- Monitor bounces and complaints
- Review email logs

### 7. Testing Checklist

Before testing signup:

- [ ] Use valid email addresses
- [ ] Avoid fake domains (@test.com, @example.com)
- [ ] Use plus addressing for multiple tests
- [ ] Check Resend dashboard for sent emails
- [ ] Verify emails are delivered

### 8. Troubleshooting

If emails aren't sending:

1. Check Resend API key is valid
2. Verify Resend account isn't rate-limited
3. Check console logs for errors
4. Ensure email templates are working
5. Verify NEXT_PUBLIC_APP_URL is set correctly

### 9. Email Templates

Current email templates:

- Welcome Email (with verification)
- Password Reset
- Onboarding Reminder
- Project Invitation

Located in: `/lib/email/templates/`

### 10. Important Notes

- **Never use invalid test emails in production**
- **Always validate email addresses before sending**
- **Monitor bounce rates to maintain good sender reputation**
- **Use Resend's webhook to track email events**

## Next Steps

1. Update all test files to use valid emails
2. Configure Supabase to skip built-in emails
3. Test the complete email flow with real addresses
4. Set up email event tracking with Resend webhooks
