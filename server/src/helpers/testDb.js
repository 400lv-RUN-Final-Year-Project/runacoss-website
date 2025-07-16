const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/index');

/**
 * Test database connection and basic operations
 */
const testDatabase = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test connection
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Database connection successful');
    
    // Test database operations
    const db = mongoose.connection.db;
    
    // Get database stats
    const stats = await db.stats();
    console.log('📊 Database statistics:');
    console.log(`   📁 Database: ${db.databaseName}`);
    console.log(`   📂 Collections: ${stats.collections}`);
    console.log(`   📄 Documents: ${stats.objects}`);
    console.log(`   💾 Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Test collection operations
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Test write operation
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Database connection test successful'
    });
    
    console.log('✅ Write operation successful');
    
    // Clean up test data
    await testCollection.deleteOne({ test: true });
    console.log('✅ Cleanup successful');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database test completed successfully');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Please ensure MongoDB is running on localhost:27017');
      console.error('   You can start MongoDB with: mongod');
    }
    
    if (error.name === 'MongoNetworkError') {
      console.error('💡 Please check your network connection and MongoDB configuration');
    }
    
    return false;
  }
};

/**
 * Test environment variables
 */
const testEnvironment = () => {
  console.log('🔧 Testing environment configuration...');
  
  const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: ${varName === 'JWT_SECRET' ? 'Set' : process.env[varName]}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    return false;
  }
  
  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    return false;
  }
  
  console.log('✅ Environment configuration is valid');
  return true;
};

/**
 * Main test function
 */
const runTests = async () => {
  console.log('🚀 Starting database tests...\n');
  
  // Test environment
  const envValid = testEnvironment();
  if (!envValid) {
    console.log('\n❌ Environment test failed');
    process.exit(1);
  }
  
  console.log('');
  
  // Test database
  const dbValid = await testDatabase();
  if (!dbValid) {
    console.log('\n❌ Database test failed');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! Database is ready for use.');
  process.exit(0);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testDatabase,
  testEnvironment,
  runTests
}; 