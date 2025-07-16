// cleanup-null-matric-users.js
const mongoose = require('mongoose');
const User = require('./src/models/userModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/runacoss';

async function cleanup() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const result = await User.deleteMany({ $or: [ { matricNumber: null }, { matricNumber: { $exists: false } } ] });
  console.log(`Deleted ${result.deletedCount} user(s) with null or missing matricNumber.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

cleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
}); 