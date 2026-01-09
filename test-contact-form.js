const fetch = require('node-fetch');

async function testContactForm() {
  console.log('🔧 Testing Contact Form API Endpoint...\n');
  
  const testData = {
    name: 'John Doe',
    email: 'john.doe@university.edu',
    message: 'Hello! This is a test message from the contact form. If you receive this email, the contact form is working perfectly!'
  };
  
  try {
    console.log('🔄 Sending test contact form submission...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('');
    console.log('📧 API Response:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('');
      console.log('🎉 CONTACT FORM IS WORKING!');
      console.log('✅ Email sent successfully');
      console.log('✅ API responded correctly');
      console.log('');
      console.log('🌐 Check the email at:');
      console.log('https://ethereal.email/messages');
      console.log('(Look for emails to: admin@campuscam.com)');
    } else {
      console.log('');
      console.log('❌ Contact form test failed');
      console.log('Error:', result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the server is running on http://localhost:3000');
  }
}

testContactForm();