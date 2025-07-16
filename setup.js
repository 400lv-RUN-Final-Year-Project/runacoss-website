#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 RUNACOSS Project Setup');
console.log('========================\n');

// Function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to copy template to .env
function copyTemplate(templatePath, envPath) {
  if (fileExists(envPath)) {
    console.log(`⚠️  ${envPath} already exists. Skipping...`);
    return false;
  }

  try {
    fs.copyFileSync(templatePath, envPath);
    console.log(`✅ Created ${envPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${envPath}:`, error.message);
    return false;
  }
}

// Function to generate random JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Function to update .env with generated values
function updateEnvFile(envPath) {
  try {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Replace placeholder JWT secret with generated one
    if (content.includes('your_super_secret_jwt_key_here_make_it_long_and_random')) {
      content = content.replace(
        'your_super_secret_jwt_key_here_make_it_long_and_random',
        generateJWTSecret()
      );
      fs.writeFileSync(envPath, content);
      console.log('✅ Generated secure JWT secret');
    }
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

// Main setup process
async function setup() {
  console.log('📋 Checking prerequisites...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
  
  // Check if MongoDB is mentioned in the setup
  console.log('⚠️  Make sure MongoDB is installed and running on localhost:27017');
  console.log('   Download from: https://www.mongodb.com/try/download/community\n');
  
  // Create environment files
  console.log('🔧 Setting up environment files...');
  
  const serverTemplate = path.join(__dirname, 'server', 'env.template');
  const serverEnv = path.join(__dirname, 'server', '.env');
  const clientTemplate = path.join(__dirname, 'client', 'env.template');
  const clientEnv = path.join(__dirname, 'client', '.env');
  
  let serverCreated = false;
  let clientCreated = false;
  
  if (fileExists(serverTemplate)) {
    serverCreated = copyTemplate(serverTemplate, serverEnv);
    if (serverCreated) {
      updateEnvFile(serverEnv);
    }
  } else {
    console.log('⚠️  Server env.template not found');
  }
  
  if (fileExists(clientTemplate)) {
    clientCreated = copyTemplate(clientTemplate, clientEnv);
  } else {
    console.log('⚠️  Client env.template not found');
  }
  
  console.log('\n📦 Installing dependencies...');
  
  // Install dependencies
  const { execSync } = require('child_process');
  
  try {
    console.log('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Installing server dependencies...');
    execSync('cd server && npm install', { stdio: 'inherit' });
    
    console.log('Installing client dependencies...');
    execSync('cd client && npm install', { stdio: 'inherit' });
    
    console.log('✅ All dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Edit server/.env with your MongoDB connection and other settings');
  console.log('2. Start MongoDB service if not already running');
  console.log('3. Run "npm run dev" to start both client and server');
  console.log('4. Open http://localhost:3000 in your browser');
  
  if (serverCreated) {
    console.log('\n⚠️  Important: Update the following in server/.env:');
    console.log('   - MONGO_URI: Your MongoDB connection string');
    console.log('   - Google OAuth credentials (if using email features)');
  }
  
  console.log('\n📚 For more information, see README.md');
}

// Run setup
setup().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}); 