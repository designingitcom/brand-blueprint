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

interface ProjectInvitationEmailProps {
  inviteeName?: string;
  inviterName: string;
  inviterEmail: string;
  projectName: string;
  projectDescription?: string;
  inviteUrl: string;
  expiresIn?: string;
  role?: string;
}

export const ProjectInvitationEmail = ({
  inviteeName,
  inviterName = 'Team Member',
  inviterEmail = 'user@example.com',
  projectName = 'BMW Project',
  projectDescription,
  inviteUrl = 'https://s1bmw.com/invite',
  expiresIn = '7 days',
  role = 'Collaborator',
}: ProjectInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      You've been invited to collaborate on "{projectName}" by {inviterName}
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
        
        <Heading style={h1}>You're Invited!</Heading>
        
        <Text style={text}>
          {inviteeName ? `Hi ${inviteeName},` : 'Hello!'}
        </Text>
        
        <Text style={text}>
          <strong>{inviterName}</strong> ({inviterEmail}) has invited you to collaborate 
          on the project "<strong>{projectName}</strong>" on S1BMW.
        </Text>
        
        {projectDescription && (
          <Section style={projectSection}>
            <Text style={projectTitle}>📋 Project Details</Text>
            <Text style={text}>{projectDescription}</Text>
          </Section>
        )}
        
        <Section style={roleSection}>
          <Text style={roleTitle}>👤 Your Role</Text>
          <Text style={roleText}>
            You've been invited as a <strong>{role}</strong>. This means you'll be able to:
          </Text>
          
          {role === 'Admin' ? (
            <ul style={permissionsList}>
              <li style={permissionItem}>✅ Full project management access</li>
              <li style={permissionItem}>✅ Invite and manage team members</li>
              <li style={permissionItem}>✅ Edit all project content and settings</li>
              <li style={permissionItem}>✅ Delete or archive the project</li>
            </ul>
          ) : role === 'Editor' ? (
            <ul style={permissionsList}>
              <li style={permissionItem}>✅ Edit and update project content</li>
              <li style={permissionItem}>✅ Add and modify project resources</li>
              <li style={permissionItem}>✅ Comment and collaborate on tasks</li>
              <li style={permissionItem}>❌ Invite new team members</li>
            </ul>
          ) : (
            <ul style={permissionsList}>
              <li style={permissionItem}>✅ View all project content</li>
              <li style={permissionItem}>✅ Comment and provide feedback</li>
              <li style={permissionItem}>✅ Download shared resources</li>
              <li style={permissionItem}>❌ Edit project content</li>
            </ul>
          )}
        </Section>
        
        <Section style={buttonContainer}>
          <Button style={button} href={inviteUrl}>
            Accept Invitation
          </Button>
        </Section>
        
        <Text style={text}>
          This invitation will expire in <strong>{expiresIn}</strong>. 
          If you don't have a S1BMW account yet, you'll be able to create one 
          during the invitation process.
        </Text>
        
        <Hr style={hr} />
        
        <Section style={benefitsSection}>
          <Text style={benefitsTitle}>🚀 What You'll Get Access To</Text>
          <ul style={featureList}>
            <li style={featureItem}>Collaborative BMW project workspace</li>
            <li style={featureItem}>Shared technical resources and documentation</li>
            <li style={featureItem}>Real-time project updates and notifications</li>
            <li style={featureItem}>Integration with BMW-specific tools and databases</li>
            <li style={featureItem}>Professional networking with BMW experts</li>
          </ul>
        </Section>
        
        <Hr style={hr} />
        
        <Text style={text}>
          <strong>Questions about this invitation?</strong> You can reach out to 
          {inviterName} directly at{' '}
          <Link href={`mailto:${inviterEmail}`} style={link}>
            {inviterEmail}
          </Link>{' '}
          or contact our support team.
        </Text>
        
        <Text style={footerText}>
          If you're having trouble clicking the button, copy and paste this URL into your browser:
        </Text>
        <Link href={inviteUrl} style={link}>
          {inviteUrl}
        </Link>
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          Need help? Contact our support team at{' '}
          <Link href="mailto:support@s1bmw.com" style={link}>
            support@s1bmw.com
          </Link>
        </Text>
        
        <Text style={footerText}>
          Best regards,<br />
          The S1BMW Team
        </Text>
        
        <Text style={disclaimer}>
          This invitation was sent by {inviterName} ({inviterEmail}) for the project "{projectName}". 
          If you believe this invitation was sent in error, please contact our support team.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ProjectInvitationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6f42c1',
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

const projectSection = {
  backgroundColor: '#e3f2fd',
  border: '1px solid #bbdefb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const projectTitle = {
  color: '#1565c0',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const roleSection = {
  backgroundColor: '#fff3e0',
  border: '1px solid #ffcc02',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const roleTitle = {
  color: '#ef6c00',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const roleText = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const permissionsList = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '12px 0',
  paddingLeft: '0px',
  listStyle: 'none',
};

const permissionItem = {
  margin: '6px 0',
  paddingLeft: '4px',
};

const benefitsSection = {
  margin: '24px 0',
};

const benefitsTitle = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const featureList = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};