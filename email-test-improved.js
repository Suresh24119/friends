const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🔧 Testing CampusCam Contact Form Email Configuration...\n');
  
  // Display current configuration
  console.log('📧 Current Email Configuration:');
  console.log('Gmail User:', process.env.GMAIL_USER || 'NOT SET');
  console.log('Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? '***configured***' : 'NOT SET');
  console.log('Admin Email:', process.env.ADMIN_EMAIL || 'NOT SET');
  console.log('');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials not configured properly');
    console.error('');
    console.error('📋 To fix Gmail authentication:');
    console.error('1. Go to https://myaccount.google.com/security');
    console.error('2. Enable 2-Step Verification if not already enabled');
    console.error('3. Go to https://myaccount.google.com/apppasswords');
    console.error('4. Generate new app password for "Mail"');
    console.error('5. Update .env file with correct credentials');
    return;
  }
  
  try {
    console.log('🔄 Creating Gmail transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    console.log('✅ Transporter created successfully');
    
    // Verify connection
    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // Send test email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    console.log(`🔄 Sending test email to: ${adminEmail}`);
    
    const testEmail = {
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: '✅ CampusCam Contact Form - Email Test Successful',
      text: `This is a test email from your CampusCam contact form.

Sender: ${process.env.GMAIL_USER}
Recipient: ${adminEmail}
Test Time: ${new Date().toISOString()}

If you received this email, your contact form is working correctly!

🎉 Contact form emails will now be delivered successfully.`,
      html: `
<h2>✅ CampusCam Contact Form - Email Test Successful</h2>
<p>This is a test email from your CampusCam contact form.</p>
<ul>
  <li><strong>Sender:</strong> ${process.env.GMAIL_USER}</li>
  <li><strong>Recipient:</strong> ${adminEmail}</li>
  <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
</ul>
<div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
  <strong>🎉 Success!</strong> If you received this email, your contact form is working correctly!
</div>
<p>Contact form emails will now be delivered successfully.</p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('');
    console.log('🎉 EMAIL CONFIGURATION IS WORKING!');
    console.log('Your contact form will now send emails properly.');
    console.log(`Check your inbox at: ${adminEmail}`);
    
  } catch (error) {
    console.error('❌ Gmail email test failed:', error.message);
    console.error('');
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication Error - Please check:');
      console.error('1. Gmail username is correct');
      console.error('2. App password is correct (not regular password)');
      console.error('3. 2-factor authentication is enabled on Gmail');
      console.error('4. App password was generated correctly');
      console.error('');
      console.error('📋 To fix Gmail authentication:');
      console.error('1. Go to https://myaccount.google.com/security');
      console.error('2. Enable 2-Step Verification if not already enabled');
      console.error('3. Go to https://myaccount.google.com/apppasswords');
      console.error('4. Generate new app password for "Mail"');
      console.error('5. Update GMAIL_APP_PASSWORD in .env file');
    }
  }
}

testEmail();