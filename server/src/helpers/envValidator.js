const fs = require('fs');
const path = require('path');

/**
 * Utility function to validate environment variables against .env.example
 * @param {string} envFilePath - Path to the .env file (default: '.env')
 * @param {string} exampleFilePath - Path to the .env.example file (default: '.env.example')
 * @returns {boolean} - Returns true if validation passes, false otherwise
 */
const validateEnvFromExample = (envFilePath = '.env', exampleFilePath = '.env.example') => {
  try {
    // Check if .env.example exists
    if (!fs.existsSync(exampleFilePath)) {
      console.error(`❌ ${exampleFilePath} file not found`);
      console.error('💡 Please create a .env.example file with required variables');
      return false;
    }

    // Read .env.example file
    const exampleContent = fs.readFileSync(exampleFilePath, 'utf8');
    const exampleVars = parseEnvFile(exampleContent);

    // Check if .env file exists
    if (!fs.existsSync(envFilePath)) {
      console.error(`❌ ${envFilePath} file not found`);
      console.error('💡 Please create a .env file with the following variables:');
      console.error('');
      Object.keys(exampleVars).forEach(varName => {
        console.error(`   ${varName}=${exampleVars[varName]}`);
      });
      console.error('');
      console.error('💡 You can copy from .env.example as a starting point');
      return false;
    }

    // Read current .env file
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    console.log('ENV CONTENT:', envContent);
    const envVars = parseEnvFile(envContent);
    console.log('ENV VARS:', envVars);

    // Find missing variables
    const missingVars = [];
    const emptyVars = [];

    Object.keys(exampleVars).forEach(varName => {
      if (!envVars.hasOwnProperty(varName)) {
        missingVars.push(varName);
      } else if (!envVars[varName] || envVars[varName].trim() === '') {
        emptyVars.push(varName);
      }
    });

    // Report issues
    if (missingVars.length > 0 || emptyVars.length > 0) {
      console.error('❌ Environment validation failed:');
      
      if (missingVars.length > 0) {
        console.error('   📝 Missing variables:');
        missingVars.forEach(varName => {
          console.error(`      - ${varName}`);
        });
      }

      if (emptyVars.length > 0) {
        console.error('   ⚠️  Empty variables:');
        emptyVars.forEach(varName => {
          console.error(`      - ${varName}`);
        });
      }

      console.error('');
      console.error('💡 Please add the missing variables to your .env file:');
      console.error('');
      
      [...missingVars, ...emptyVars].forEach(varName => {
        const exampleValue = exampleVars[varName];
        console.error(`   ${varName}=${exampleValue}`);
      });
      
      console.error('');
      console.error('💡 You can copy from .env.example as a starting point');
      return false;
    }

    console.log('✅ Environment validation passed');
    return true;

  } catch (error) {
    console.error('❌ Error validating environment:', error.message);
    return false;
  }
};

/**
 * Parse environment file content into key-value pairs
 * @param {string} content - File content
 * @returns {Object} - Parsed environment variables
 */
const parseEnvFile = (content) => {
  const vars = {};
  const lines = content.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        vars[key] = value;
      }
    }
  });
  
  return vars;
};

/**
 * Create a .env file from .env.example with default values
 * @param {string} envFilePath - Path to the .env file (default: '.env')
 * @param {string} exampleFilePath - Path to the .env.example file (default: '.env.example')
 * @returns {boolean} - Returns true if successful, false otherwise
 */
const createEnvFromExample = (envFilePath = '.env', exampleFilePath = '.env.example') => {
  try {
    if (!fs.existsSync(exampleFilePath)) {
      console.error(`❌ ${exampleFilePath} file not found`);
      return false;
    }

    const exampleContent = fs.readFileSync(exampleFilePath, 'utf8');
    fs.writeFileSync(envFilePath, exampleContent);
    
    console.log(`✅ Created ${envFilePath} from ${exampleFilePath}`);
    console.log('💡 Please update the values in your .env file as needed');
    return true;

  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    return false;
  }
};

module.exports = {
  validateEnvFromExample,
  createEnvFromExample,
  parseEnvFile
}; 