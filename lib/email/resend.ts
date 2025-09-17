import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required');
}

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender configuration
export const DEFAULT_FROM = 'S1BMW <noreply@s1bmw.com>';
export const SUPPORT_EMAIL = 'support@s1bmw.com';

// Email sending options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate retry delay with exponential backoff
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Main email sending function with retry logic
export async function sendEmail(options: EmailOptions) {
  const {
    to,
    subject,
    html,
    react,
    from = DEFAULT_FROM,
    ...otherOptions
  } = options;

  // Validate required fields
  if (!to) {
    throw new Error('Email recipient (to) is required');
  }
  if (!subject) {
    throw new Error('Email subject is required');
  }
  if (!html && !react) {
    throw new Error('Either html or react content is required');
  }

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const emailData: any = {
        from,
        to,
        subject,
        ...otherOptions,
      };

      // Add content based on type
      if (react) {
        emailData.react = react;
      } else if (html) {
        emailData.html = html;
      }

      const result = await resend.emails.send(emailData);

      // Log successful send
      console.log(
        `Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}:`,
        result
      );

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Email send attempt ${attempt + 1} failed:`, error);

      // Don't retry on final attempt
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }

      // Don't retry certain types of errors (authentication, invalid email, etc.)
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('invalid email') ||
          errorMessage.includes('bad request')
        ) {
          throw error; // Don't retry these errors
        }
      }

      // Wait before retrying
      const retryDelay = getRetryDelay(attempt);
      console.log(`Retrying email send in ${retryDelay}ms...`);
      await delay(retryDelay);
    }
  }

  // If we get here, all retries failed
  console.error(
    `Failed to send email after ${RETRY_CONFIG.maxRetries + 1} attempts`
  );
  throw new Error(
    `Email sending failed: ${lastError?.message || 'Unknown error'}`
  );
}

// Batch email sending function
export async function sendBatchEmails(
  emails: EmailOptions[],
  batchSize: number = 10
) {
  const results: any[] = [];
  const errors: any[] = [];

  // Process emails in batches to avoid rate limiting
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    // Send batch concurrently
    const batchPromises = batch.map(async (emailOptions, index) => {
      try {
        const result = await sendEmail(emailOptions);
        return { index: i + index, result, success: true };
      } catch (error) {
        console.error(
          `Failed to send email in batch at index ${i + index}:`,
          error
        );
        return { index: i + index, error, success: false };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.push(result.value);
        } else {
          errors.push(result.value);
        }
      } else {
        errors.push({ error: result.reason, success: false });
      }
    });

    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await delay(1000); // 1 second between batches
    }
  }

  return {
    successful: results,
    failed: errors,
    total: emails.length,
    successCount: results.length,
    errorCount: errors.length,
  };
}

// Health check function
export async function testEmailService() {
  try {
    // This doesn't actually send an email, just tests the API key
    const result = await resend.emails.send({
      from: DEFAULT_FROM,
      to: 'test@resend.dev', // Resend's test email
      subject: 'Test Email Service',
      html: '<p>This is a test email to verify the service is working.</p>',
    });

    return {
      success: true,
      message: 'Email service is working correctly',
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Email service test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Email validation helper
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Extract name from email helper
export function getNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  return localPart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
