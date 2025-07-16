const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('🔍 Please check:');
    console.log('   - MongoDB is running on localhost:27017');
    console.log('   - Environment variables are set correctly');
    console.log('   - Network connectivity');
    process.exit(1);
  }
};

module.exports = connectDB;