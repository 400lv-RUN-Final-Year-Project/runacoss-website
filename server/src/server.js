require('dotenv').config()

const http = require('http');
const app = require('./app.js');
const httpServer = http.createServer(app);
const connectDb = require('./helpers/dbConfig.js');
const { initDb } = require('./helpers/initDb.js');
const { PORT, logConfig } = require('./config/index.js');

/**
 * Utility function to check required environment variables
 * @param {string[]} requiredVars - Array of required environment variable names
 * @returns {void}
 */
const checkRequiredEnvVars = (requiredVars) => {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('📝 Please check your .env file and ensure all required variables are set.');
    console.error('💡 You can copy from env.example or env.template files as a starting point.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are present');
};

const startServer = async () => {
  try {
    // Validation for critical variables
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
    checkRequiredEnvVars(requiredEnvVars);
    
    // Validate JWT_SECRET length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.error('❌ JWT_SECRET must be at least 32 characters long');
      console.error(`🔐 Current length: ${process.env.JWT_SECRET.length}`);
      console.error('💡 Please update your .env file with a longer JWT_SECRET');
      process.exit(1);
    }
    
    // Validate database URI format
    const dbUri = process.env.MONGO_URI;
    if (dbUri && !dbUri.startsWith('mongodb://') && !dbUri.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid database URI format. Must start with mongodb:// or mongodb+srv://');
              console.error(`🔗 Current MONGO_URI: ${dbUri}`);
      process.exit(1);
    }
    
    // Log configuration
    logConfig();
    
    console.log('🚀 Starting RUNACOSS Server...');
    
    // Connect to the database
    await connectDb();
    
    // Initialize database (create indexes, validate models, create default admin)
    await initDb();
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`✅ Server is running on port: ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Handle server errors
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('💡 Please try a different port or stop the process using this port');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();