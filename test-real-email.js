const fetch = require('node-fetch');

async function testRealEmail() {
  console.log('🔧 Testing Contact Form - Real Email Delivery...\n');
  
  const testData = {
    name: 'CampusCam Test User',
    email: 'test@campuscam.com',
    message: `🎉 CONTACT FORM TEST MESSAGE

This is a test message to verify that your CampusCam contact form is working correctly.

✅ If you receive this email at sjksj0154@gmail.com, then:
- Contact form is properly configured
- Gmail SMTP is working
- Email delivery is successful
- Users can now contact you through the website

Test Details:
- Sent from: CampusCam Contact Form
- Test Time: ${new Date().toISOString()}
- Server: localhost:3000
- Configuration: Gmail SMTP

🚀 Your contact form is ready for users!`
  };
  
  try {
    console.log('📧 Sending test message to your email: sjksj0154@gmail.com');
    console.log('📝 Test message details:');
    console.log('   Name:', testData.name);
    console.log('   Email:', testData.email);
    console.log('   Message length:', testData.message.length, 'characters');
    console.log('');
    
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('📬 API Response:');
    console.log('   Status:', response.status);
    console.log('   Success:', result.success);
    console.log('   Message:', result.message);
    
    if (response.ok && result.success) {
      console.log('');
      console.log('🎉 SUCCESS! Contact form email sent!');
      console.log('');
      console.log('📧 CHECK YOUR EMAIL INBOX:');
      console.log('   Email: sjksj0154@gmail.com');
      console.log('   Subject: "New Contact Form Message - CampusCam"');
      console.log('   From: yegvjhf128@gmail.com');
      console.log('');
      console.log('✅ Your contact form is now working correctly!');
      console.log('✅ Users can send you messages through your website');
      console.log('✅ You will receive emails in your Gmail inbox');
      console.log('');
      console.log('🚀 Contact form is ready for production use!');
    } else {
      console.log('');
      console.log('❌ Contact form test failed');
      console.log('Error:', result.error || 'Unknown error');
      console.log('');
      console.log('🔧 Troubleshooting steps:');
      console.log('1. Check Gmail app password is correct');
      console.log('2. Verify 2-factor authentication is enabled');
      console.log('3. Make sure server is running');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('🔧 Make sure:');
    console.error('1. Server is running: npm run dev');
    console.error('2. Server is accessible at http://localhost:3000');
    console.error('3. Gmail credentials are configured correctly');
  }
}

testRealEmail();