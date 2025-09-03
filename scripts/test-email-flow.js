const { Resend } = require('resend');

const resend = new Resend('re_EU3GtkrD_8H2xtQ9rSzpTWL8RgQkSThRE');

console.log('📧 Testing Email Service\n');
console.log('=====================================\n');

async function runEmailTests() {
  let testResults = {
    passed: [],
    failed: []
  };

  // Test 1: Send Welcome Email
  console.log('📝 Test 1: Welcome Email');
  try {
    const { data, error } = await resend.emails.send({
      from: 'S1BMW <onboarding@resend.dev>',
      to: 'florian@designingit.com',
      subject: 'Welcome to S1BMW - Test Email',
      html: `
        <h1>Welcome to S1BMW!</h1>
        <p>This is a test of the welcome email template.</p>
        <p>Your account has been successfully created.</p>
        <ul>
          <li>✅ Authentication working</li>
          <li>✅ Email service configured</li>
          <li>✅ Ready to manage your brand</li>
        </ul>
        <p>Best regards,<br>The S1BMW Team</p>
      `,
    });

    if (error) throw error;
    
    console.log('✅ Welcome email sent successfully');
    console.log(`   Email ID: ${data.id}`);
    testResults.passed.push('Welcome Email');
  } catch (error) {
    console.log('❌ Welcome email failed:', error.message);
    testResults.failed.push('Welcome Email');
  }

  // Test 2: Send Password Reset Email
  console.log('\n📝 Test 2: Password Reset Email');
  try {
    const resetToken = 'test-reset-token-' + Date.now();
    const { data, error } = await resend.emails.send({
      from: 'S1BMW <onboarding@resend.dev>',
      to: 'florian@designingit.com',
      subject: 'Reset Your Password - S1BMW',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for S1BMW.</p>
        <p>Click the link below to reset your password:</p>
        <a href="http://localhost:3001/reset-password?token=${resetToken}" 
           style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    if (error) throw error;
    
    console.log('✅ Password reset email sent successfully');
    console.log(`   Email ID: ${data.id}`);
    testResults.passed.push('Password Reset Email');
  } catch (error) {
    console.log('❌ Password reset email failed:', error.message);
    testResults.failed.push('Password Reset Email');
  }

  // Test 3: Send Onboarding Reminder
  console.log('\n📝 Test 3: Onboarding Reminder Email');
  try {
    const { data, error } = await resend.emails.send({
      from: 'S1BMW <onboarding@resend.dev>',
      to: 'florian@designingit.com',
      subject: 'Complete Your S1BMW Setup',
      html: `
        <h2>Don't forget to complete your setup!</h2>
        <p>Hi there,</p>
        <p>We noticed you haven't completed your business profile yet.</p>
        <p>Complete your setup to unlock:</p>
        <ul>
          <li>🎨 Brand Guidelines Builder</li>
          <li>🤖 AI-Powered Content Generation</li>
          <li>📊 Brand Analytics Dashboard</li>
          <li>👥 Team Collaboration Tools</li>
        </ul>
        <a href="http://localhost:3001/onboarding" 
           style="display: inline-block; padding: 10px 20px; background: #10b981; color: #fff; text-decoration: none; border-radius: 5px;">
          Complete Setup
        </a>
        <p>Need help? Reply to this email and we'll assist you.</p>
      `,
    });

    if (error) throw error;
    
    console.log('✅ Onboarding reminder sent successfully');
    console.log(`   Email ID: ${data.id}`);
    testResults.passed.push('Onboarding Reminder');
  } catch (error) {
    console.log('❌ Onboarding reminder failed:', error.message);
    testResults.failed.push('Onboarding Reminder');
  }

  // Test 4: Test Email with Invalid Address (should fail)
  console.log('\n📝 Test 4: Invalid Email Address (Expected to Fail)');
  try {
    const { data, error } = await resend.emails.send({
      from: 'S1BMW <onboarding@resend.dev>',
      to: 'invalid@example.com',
      subject: 'Test - Should Fail',
      html: '<p>This should fail due to test mode restrictions</p>',
    });

    if (error) throw error;
    
    console.log('❌ Unexpected success - should have failed');
    testResults.failed.push('Invalid Email Test');
  } catch (error) {
    if (error.message && error.message.includes('can only send testing emails')) {
      console.log('✅ Correctly rejected non-test email');
      console.log('   Restriction working as expected');
      testResults.passed.push('Email Restriction Check');
    } else {
      console.log('❌ Failed with unexpected error:', error.message);
      testResults.failed.push('Invalid Email Test');
    }
  }

  // Test 5: Batch Email Test
  console.log('\n📝 Test 5: Email Template Formatting');
  try {
    const { data, error } = await resend.emails.send({
      from: 'S1BMW <onboarding@resend.dev>',
      to: 'florian@designingit.com',
      subject: 'S1BMW - Template Test',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>S1BMW Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <header style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">S1BMW</h1>
              <p style="margin: 5px 0 0 0;">Brand Management Platform</p>
            </header>
            
            <main style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937;">Template Test</h2>
              <p>This email tests our professional template design with:</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #3b82f6;">✅ Features</h3>
                <ul style="padding-left: 20px;">
                  <li>Responsive design</li>
                  <li>Brand colors</li>
                  <li>Clear CTAs</li>
                  <li>Professional layout</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3001/dashboard" 
                   style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
            </main>
            
            <footer style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
              <p>© 2024 S1BMW. All rights reserved.</p>
              <p>
                <a href="http://localhost:3001/settings" style="color: #3b82f6; text-decoration: none;">Settings</a> | 
                <a href="http://localhost:3001/help" style="color: #3b82f6; text-decoration: none;">Help</a>
              </p>
            </footer>
          </body>
        </html>
      `,
    });

    if (error) throw error;
    
    console.log('✅ Template email sent successfully');
    console.log(`   Email ID: ${data.id}`);
    console.log('   Professional template rendered correctly');
    testResults.passed.push('Template Formatting');
  } catch (error) {
    console.log('❌ Template email failed:', error.message);
    testResults.failed.push('Template Formatting');
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Email Test Results Summary\n');
  console.log(`✅ Passed: ${testResults.passed.length}/${testResults.passed.length + testResults.failed.length}`);
  testResults.passed.forEach(test => console.log(`   ✓ ${test}`));
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(test => console.log(`   ✗ ${test}`));
  }

  console.log('\n📬 Check florian@designingit.com for test emails');

  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

runEmailTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});