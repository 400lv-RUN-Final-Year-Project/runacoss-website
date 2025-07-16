const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, USER_EMAIL } = require('../config/index');

// Enhanced error handling and debugging
const validateOAuthConfig = () => {
  const missing = [];
  
  if (!CLIENT_ID) missing.push('CLIENT_ID');
  if (!CLIENT_SECRET) missing.push('CLIENT_SECRET');
  if (!REFRESH_TOKEN) missing.push('REFRESH_TOKEN');
  if (!USER_EMAIL) missing.push('USER_EMAIL');
  if (!REDIRECT_URI) missing.push('REDIRECT_URI');
  
  if (missing.length > 0) {
    throw new Error(`Missing OAuth2 configuration: ${missing.join(', ')}`);
  }
  
  // Validate CLIENT_ID format
  if (!CLIENT_ID.includes('.apps.googleusercontent.com')) {
    throw new Error('Invalid CLIENT_ID format. Should end with .apps.googleusercontent.com');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(USER_EMAIL)) {
    throw new Error('Invalid USER_EMAIL format');
  }
  
  console.log('✅ OAuth2 configuration validated');
  console.log(`   📧 Email: ${USER_EMAIL}`);
  console.log(`   🔗 Redirect URI: ${REDIRECT_URI}`);
  console.log(`   🆔 Client ID: ${CLIENT_ID.substring(0, 20)}...`);
};

async function createTransporter() {
  try {
    // Validate configuration first
    validateOAuthConfig();
    
    console.log('🔄 Creating OAuth2 client...');
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    console.log('🔄 Setting credentials...');
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    
    console.log('🔄 Getting access token...');
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    
    if (!accessTokenResponse.token) {
      throw new Error('Failed to obtain access token');
    }
    
    console.log('✅ Access token obtained successfully');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        // redirectUri: REDIRECT_URI,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessTokenResponse.token,
      },
    });
    
    // Verify the transporter
    console.log('🔄 Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully');
    
    return transporter;
    
  } catch (error) {
    console.error('❌ SMTP Transport Error:', error.message);
    
    // Provide specific error messages for common issues
    if (error.message.includes('invalid_client')) {
      console.error('🔧 Troubleshooting invalid_client error:');
      console.error('   1. Check if CLIENT_ID and CLIENT_SECRET are correct');
      console.error('   2. Verify the OAuth2 client is enabled in Google Cloud Console');
      console.error('   3. Ensure Gmail API is enabled for your project');
      console.error('   4. Check if the redirect URI matches exactly');
    } else if (error.message.includes('invalid_grant')) {
      console.error('🔧 Troubleshooting invalid_grant error:');
      console.error('   1. Your REFRESH_TOKEN may have expired');
      console.error('   2. Generate a new refresh token using OAuth2 Playground');
      console.error('   3. Check if the user account is still valid');
    } else if (error.message.includes('Missing OAuth2 configuration')) {
      console.error('🔧 Missing environment variables in .env file:');
      console.error('   CLIENT_ID=your-client-id.apps.googleusercontent.com');
      console.error('   CLIENT_SECRET=your-client-secret');
      console.error('   REFRESH_TOKEN=your-refresh-token');
      console.error('   USER_EMAIL=your-email@gmail.com');
      console.error('   REDIRECT_URI=https://developers.google.com/oauthplayground');
    }
    
    throw error;
  }
}

// Test function to verify email configuration
async function testEmailConfig() {
  try {
    console.log('🧪 Testing email configuration...');
    const transporter = await createTransporter();
    
    const testMailOptions = {
      from: USER_EMAIL,
      to: USER_EMAIL, // Send to yourself for testing
      subject: 'RUNACOSS Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you receive this email, your Gmail OAuth2 configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', result.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
}

module.exports = { createTransporter, testEmailConfig };
