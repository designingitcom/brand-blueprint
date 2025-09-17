import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  email: string;
  resetUrl: string;
  expiresIn?: string;
}

export const PasswordResetEmail = ({
  email = 'user@example.com',
  resetUrl = 'https://s1bmw.com/reset-password',
  expiresIn = '1 hour',
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your S1BMW password - Link expires in {expiresIn}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://s1bmw.com/logo.png"
            width="120"
            height="36"
            alt="S1BMW"
            style={logo}
          />
        </Section>

        <Heading style={h1}>Reset Your Password</Heading>

        <Text style={text}>
          We received a request to reset the password for your S1BMW account (
          {email}).
        </Text>

        <Text style={text}>
          If you requested this password reset, click the button below to create
          a new password. This link will expire in <strong>{expiresIn}</strong>.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={resetUrl}>
            Reset Password
          </Button>
        </Section>

        <Text style={text}>
          <strong>Important:</strong> For your security, this password reset
          link can only be used once and will expire in {expiresIn}. If you need
          to reset your password again, you'll need to make a new request.
        </Text>

        <Hr style={hr} />

        <Section style={securitySection}>
          <Text style={securityTitle}>🔒 Security Notice</Text>
          <Text style={text}>
            If you didn't request a password reset, please ignore this email.
            Your password will remain unchanged, and your account is secure.
          </Text>
          <Text style={text}>
            If you're concerned about unauthorized access to your account,
            please contact our support team immediately.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={footerText}>
          If you're having trouble clicking the button, copy and paste this URL
          into your browser:
        </Text>
        <Link href={resetUrl} style={link}>
          {resetUrl}
        </Link>

        <Hr style={hr} />

        <Text style={footerText}>
          Need help? Contact our support team at{' '}
          <Link href="mailto:support@s1bmw.com" style={link}>
            support@s1bmw.com
          </Link>
        </Text>

        <Text style={footerText}>
          Best regards,
          <br />
          The S1BMW Team
        </Text>

        <Text style={disclaimer}>
          This password reset was requested for the account: {email}. If you
          didn't make this request, please contact support.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc3545',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px 16px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const securitySection = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const securityTitle = {
  color: '#856404',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const footerText = {
  color: '#8898aa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
};

const link = {
  color: '#007cba',
  textDecoration: 'underline',
};

const disclaimer = {
  color: '#8898aa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};
