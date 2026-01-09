const nodemailer = require('nodemailer');
require('dotenv').config();

async function testContactEmail() {
  console.log('🔧 Testing CampusCam Contact Form Email (Same as Contact API)...\n');
  
  let transporter = null;
  let senderEmail = null;
  let configType = null;
  
  // Use the same logic as contact-api.js
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('Using Gmail SMTP configuration...');
    configType = 'Gmail';
    senderEmail = process.env.GMAIL_USER;
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Using custom SMTP configuration...');
    configType = 'Custom SMTP';
    senderEmail = process.env.SMTP_USER;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  else if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
    console.log('Using Outlook SMTP configuration...');
    configType = 'Outlook';
    senderEmail = process.env.OUTLOOK_USER;
    transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASS
      }
    });
  }
  else {
    console.error('❌ No email configuration found!');
    return;
  }
  
  try {
    console.log(`✅ ${configType} transporter created`);
    
    // Verify connection
    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test contact form email (same format as contact API)
    const adminEmail = process.env.ADMIN_EMAIL || senderEmail;
    
    const testContactMessage = {
      from: senderEmail,
      to: adminEmail,
      subject: 'New Contact Form Message - CampusCam',
      text: `
New contact form submission from CampusCam:

Name: Test User
Email: test@university.edu
Message: This is a test message from the contact form. If you receive this email, the contact form is working correctly!

Submitted at: ${new Date().toISOString()}
IP Address: 127.0.0.1
      `.trim(),
      html: `
<h2>New Contact Form Message - CampusCam</h2>
<p><strong>Name:</strong> Test User</p>
<p><strong>Email:</strong> test@university.edu</p>
<p><strong>Message:</strong></p>
<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #D53840; margin: 10px 0;">
  This is a test message from the contact form. If you receive this email, the contact form is working correctly!
</div>
<hr>
<p><small>Submitted at: ${new Date().toISOString()}</small></p>
<p><small>IP Address: 127.0.0.1</small></p>
      `.trim()
    };
    
    const result = await transporter.sendMail(testContactMessage);
    console.log('✅ Contact form test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    if (configType === 'Custom SMTP' && process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('');
      console.log('🌐 View the email online:');
      console.log('URL:', nodemailer.getTestMessageUrl(result));
    }
    
    console.log('');
    console.log('🎉 CONTACT FORM EMAIL IS WORKING!');
    console.log(`Configuration: ${configType}`);
    console.log(`Sender: ${senderEmail}`);
    console.log(`Admin Email: ${adminEmail}`);
    console.log('');
    console.log('✅ Your contact form will now send emails properly!');
    
  } catch (error) {
    console.error(`❌ ${configType} test failed:`, error.message);
  }
}

testContactEmail();