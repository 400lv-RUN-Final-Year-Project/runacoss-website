const { testEmailConfig } = require('./src/helpers/smtpTransport');

console.log('🧪 RUNACOSS Email Configuration Test');
console.log('=' .repeat(50));

async function runEmailTest() {
  try {
    const success = await testEmailConfig();
    
    if (success) {
      console.log('\n🎉 Email configuration is working correctly!');
      console.log('✅ You can now use email features in your application:');
      console.log('   📧 User registration verification');
      console.log('   🔐 Password reset emails');
      console.log('   👨‍💼 Admin registration verification');
      console.log('   🔑 Admin password reset emails');
    } else {
      console.log('\n❌ Email configuration test failed.');
      console.log('📋 Please check the error messages above and:');
      console.log('   1. Verify your .env file has all required variables');
      console.log('   2. Check your Google Cloud Console settings');
      console.log('   3. Ensure Gmail API is enabled');
      console.log('   4. Verify your OAuth2 credentials are correct');
      console.log('\n📖 See GMAIL_OAUTH2_SETUP.md for detailed setup instructions.');
    }
    
  } catch (error) {
    console.error('\n💥 Test script error:', error.message);
  }
}

// Run the test
runEmailTest(); 