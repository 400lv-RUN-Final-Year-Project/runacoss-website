
module.exports = {
  // Server Configuration
  PORT: parseInt(process.env.PORT) || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  
  // Google OAuth Configuration (Optional)
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  USER_EMAIL: process.env.USER_EMAIL,
  REDIRECT_URI: process.env.REDIRECT_URI,
  
  // Frontend Configuration
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || "http://localhost:3000",
  
  // Log configuration on startup
  logConfig: () => {
    console.log('🔧 Configuration loaded:');
    console.log(`   📡 Port: ${process.env.PORT || 5001}`);
    console.log(`   🗄️  Database: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
    console.log(`   🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
    console.log(`   🌐 Frontend URL: ${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}`);
    console.log(`   🏭 Environment: ${process.env.NODE_ENV || 'development'}`);
  }
};