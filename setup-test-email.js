const nodemailer = require('nodemailer');
require('dotenv').config();

async function setupTestEmail() {
  console.log('🔧 Setting up temporary test email for CampusCam...\n');
  
  try {
    // Create Ethereal Email test account
    console.log('🔄 Creating temporary test email account...');
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Test email account created successfully!');
    console.log('');
    console.log('📧 Temporary Email Credentials:');
    console.log('Host:', testAccount.smtp.host);
    console.log('Port:', testAccount.smtp.port);
    console.log('Username:', testAccount.user);
    console.log('Password:', testAccount.pass);
    console.log('');
    
    // Create transporter with test account
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Test transporter created');
    
    // Send test email
    console.log('🔄 Sending test contact form email...');
    
    const testEmail = {
      from: testAccount.user,
      to: 'admin@campuscam.com',
      subject: '✅ CampusCam Contact Form - Test Message',
      text: `This is a test contact form submission from CampusCam.

Name: John Doe
Email: john.doe@university.edu
Message: Hello! I'm testing the contact form functionality. This message should be delivered successfully.

Submitted at: ${new Date().toISOString()}
IP Address: 127.0.0.1`,
      html: `
<h2>✅ CampusCam Contact Form - Test Message</h2>
<p><strong>Name:</strong> John Doe</p>
<p><strong>Email:</strong> john.doe@university.edu</p>
<p><strong>Message:</strong></p>
<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #D53840; margin: 10px 0;">
  Hello! I'm testing the contact form functionality. This message should be delivered successfully.
</div>
<hr>
<p><small>Submitted at: ${new Date().toISOString()}</small></p>
<p><small>IP Address: 127.0.0.1</small></p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('');
    console.log('🌐 View the email online:');
    console.log('URL:', nodemailer.getTestMessageUrl(result));
    console.log('');
    console.log('📋 To use this for your contact form, add to .env:');
    console.log('');
    console.log('# Temporary test email configuration');
    console.log(`SMTP_HOST=${testAccount.smtp.host}`);
    console.log(`SMTP_PORT=${testAccount.smtp.port}`);
    console.log(`SMTP_SECURE=${testAccount.smtp.secure}`);
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`ADMIN_EMAIL=admin@campuscam.com`);
    console.log('');
    console.log('🎉 Contact form will work with these settings!');
    console.log('Note: This is for testing only. Emails won\'t be delivered to real inboxes.');
    
  } catch (error) {
    console.error('❌ Failed to set up test email:', error.message);
  }
}

setupTestEmail();