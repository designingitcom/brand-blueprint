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

interface WelcomeEmailProps {
  firstName: string;
  verificationUrl: string;
  email: string;
}

export const WelcomeEmail = ({
  firstName = 'User',
  verificationUrl = 'https://s1bmw.com/verify',
  email = 'user@example.com',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Welcome to S1BMW! Please verify your email address to get started.
    </Preview>
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

        <Heading style={h1}>Welcome to S1BMW!</Heading>

        <Text style={text}>Hi {firstName},</Text>

        <Text style={text}>
          Welcome to S1BMW, the premier platform for BMW enthusiasts and
          professionals. We're excited to have you join our community!
        </Text>

        <Text style={text}>
          To get started and access all features, please verify your email
          address by clicking the button below:
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={verificationUrl}>
            Verify Email Address
          </Button>
        </Section>

        <Text style={text}>
          This verification link will expire in 24 hours. If you didn't create
          an account with S1BMW, you can safely ignore this email.
        </Text>

        <Hr style={hr} />

        <Section style={footerSection}>
          <Text style={footerText}>Once verified, you'll be able to:</Text>
          <ul style={list}>
            <li style={listItem}>Access exclusive BMW resources and tools</li>
            <li style={listItem}>Connect with other BMW enthusiasts</li>
            <li style={listItem}>Manage your BMW projects and documentation</li>
            <li style={listItem}>Stay updated with the latest BMW insights</li>
          </ul>
        </Section>

        <Hr style={hr} />

        <Text style={footerText}>
          If you're having trouble clicking the button, copy and paste this URL
          into your browser:
        </Text>
        <Link href={verificationUrl} style={link}>
          {verificationUrl}
        </Link>

        <Hr style={hr} />

        <Text style={footerText}>
          Questions? Contact our support team at{' '}
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
          You received this email because you created an account at S1BMW (
          {email}). If you didn't create this account, please contact our
          support team.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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
  backgroundColor: '#007cba',
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

const footerSection = {
  margin: '32px 0 20px',
};

const footerText = {
  color: '#8898aa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
};

const list = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '4px 0',
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
