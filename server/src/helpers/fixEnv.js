const { createEnvFromExample } = require('./envValidator.js');

console.log('🔧 Fixing .env file...');

const success = createEnvFromExample('.env', 'env.example');

if (success) {
  console.log('✅ .env file has been created/updated successfully!');
  console.log('💡 You can now start the server with: npm run dev');
} else {
  console.log('❌ Failed to create .env file');
  process.exit(1);
} 