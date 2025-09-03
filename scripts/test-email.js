const { Resend } = require('resend');

const resend = new Resend('re_EU3GtkrD_8H2xtQ9rSzpTWL8RgQkSThRE');

async function testEmail() {
  try {
    console.log('Testing Resend email service...');
    
    const data = await resend.emails.send({
      from: 'S1BMW <onboarding@resend.dev>',
      to: 'florian@designingit.com',
      subject: 'Test Email from S1BMW',
      html: '<h1>Test Email</h1><p>If you see this, Resend is working!</p>',
    });
    
    console.log('✅ Email service is working!');
    console.log('Response:', data);
  } catch (error) {
    console.error('❌ Email service error:', error);
  }
}

testEmail();