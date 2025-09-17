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

interface OnboardingReminderEmailProps {
  firstName: string;
  businessName?: string;
  onboardingUrl: string;
  email: string;
  daysAgo?: number;
}

export const OnboardingReminderEmail = ({
  firstName = 'User',
  businessName,
  onboardingUrl = 'https://s1bmw.com/onboarding',
  email = 'user@example.com',
  daysAgo = 3,
}: OnboardingReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Complete your S1BMW business setup to unlock all features</Preview>
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

        <Heading style={h1}>Complete Your Business Setup</Heading>

        <Text style={text}>Hi {firstName},</Text>

        <Text style={text}>
          {daysAgo > 0
            ? `It's been ${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} since you joined S1BMW, and we noticed you haven't completed your business setup yet.`
            : "Welcome to S1BMW! We noticed you haven't completed your business setup yet."}
        </Text>

        <Text style={text}>
          {businessName
            ? `To get the most out of S1BMW for ${businessName}, please complete your business onboarding.`
            : 'To unlock all features and get the most out of S1BMW, please complete your business onboarding.'}{' '}
          This will only take a few minutes and will help us:
        </Text>

        <Section style={benefitsSection}>
          <ul style={list}>
            <li style={listItem}>
              🎯 Customize your dashboard for your specific business needs
            </li>
            <li style={listItem}>
              🔧 Recommend the most relevant BMW tools and resources
            </li>
            <li style={listItem}>
              👥 Connect you with other professionals in your area
            </li>
            <li style={listItem}>
              📈 Provide insights tailored to your business size and focus
            </li>
            <li style={listItem}>
              🚀 Unlock advanced project management features
            </li>
          </ul>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={onboardingUrl}>
            Complete Setup (5 minutes)
          </Button>
        </Section>

        <Hr style={hr} />

        <Section style={progressSection}>
          <Text style={progressTitle}>⏰ What You're Missing</Text>
          <Text style={text}>
            Without completing your business setup, you're missing out on:
          </Text>
          <ul style={featureList}>
            <li style={featureItem}>
              Access to premium BMW technical resources
            </li>
            <li style={featureItem}>Advanced project collaboration tools</li>
            <li style={featureItem}>
              Customized business insights and analytics
            </li>
            <li style={featureItem}>Priority customer support</li>
          </ul>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Need help getting started?</strong> Our setup wizard will
          guide you through each step, and our support team is always available
          if you need assistance.
        </Text>

        <Text style={footerText}>
          If you're having trouble clicking the button, copy and paste this URL
          into your browser:
        </Text>
        <Link href={onboardingUrl} style={link}>
          {onboardingUrl}
        </Link>

        <Hr style={hr} />

        <Text style={footerText}>
          Questions about the setup process? Contact our support team at{' '}
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
          You're receiving this reminder because you created an account at S1BMW
          ({email}) but haven't completed business setup. You can unsubscribe
          from setup reminders by completing the onboarding process.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OnboardingReminderEmail;

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
  backgroundColor: '#28a745',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '220px',
  padding: '12px 16px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const benefitsSection = {
  margin: '24px 0',
};

const progressSection = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const progressTitle = {
  color: '#495057',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const list = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '0px',
  listStyle: 'none',
};

const listItem = {
  margin: '8px 0',
  paddingLeft: '4px',
};

const featureList = {
  color: '#333',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const featureItem = {
  margin: '4px 0',
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
