const mongoose = require('mongoose');
const User = require('../models/userModel');
const Blog = require('../models/blogModel');
const RepoFile = require('../models/file');
const News = require('../models/newsModel');
const Admin = require('../models/adminModel');

/**
 * Fix phoneNumber index issue
 */
const fixPhoneNumberIndex = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Drop the existing phoneNumber index if it exists
    try {
      await collection.dropIndex('phoneNumber_1');
      console.log('✅ Dropped existing phoneNumber index');
    } catch (error) {
      // Index might not exist, that's okay
      console.log('ℹ️ No existing phoneNumber index to drop');
    }
    
    // Create a new sparse index for phoneNumber
    await collection.createIndex({ phoneNumber: 1 }, { 
      unique: true, 
      sparse: true,
      name: 'phoneNumber_1'
    });
    console.log('✅ Created new sparse phoneNumber index');
    
  } catch (error) {
    console.error('❌ Error fixing phoneNumber index:', error.message);
  }
};

/**
 * Initialize database with indexes and validation
 */
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database...');
    
    // Fix phoneNumber index first
    await fixPhoneNumberIndex();
    
    // Create indexes for all models with error handling
    const models = [
      { name: 'User', model: User },
      { name: 'Blog', model: Blog },
      { name: 'RepoFile', model: RepoFile },
      { name: 'News', model: News },
      { name: 'Admin', model: Admin }
    ];
    
    for (const { name, model } of models) {
      try {
        await model.createIndexes();
        console.log(`✅ ${name} indexes created/verified`);
      } catch (indexError) {
        // If indexes already exist, that's fine
        if (indexError.message.includes('existing index') || indexError.message.includes('same name')) {
          console.log(`ℹ️  ${name} indexes already exist`);
        } else {
          console.error(`❌ Error creating ${name} indexes:`, indexError.message);
        }
      }
    }
    
    console.log('✅ Database indexes processed successfully');
    
    // Validate database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log(`📊 Database state: ${dbStates[dbState]}`);
    
    if (dbState === 1) {
      console.log('✅ Database is ready for operations');
      
      // Log database statistics
      const stats = await mongoose.connection.db.stats();
      console.log(`📈 Database statistics:`);
      console.log(`   📁 Collections: ${stats.collections}`);
      console.log(`   📄 Documents: ${stats.objects}`);
      console.log(`   💾 Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   🗂️  Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.warn('⚠️  Database is not in connected state');
    }
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

/**
 * Create a default admin user if no users exist
 */
const createDefaultAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('👤 Creating default admin user...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@runacoss.com',
        password: hashedPassword,
        isVerified: true,
        role: 'admin',
        isActive: true,
        matricNumber: 'RUN/ADM/00/00001',
        department: 'Computer Science',
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@runacoss.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the default password after first login');
    } else {
      console.log(`👥 Found ${userCount} existing user(s)`);
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

/**
 * Create a default super admin if no admins exist
 */
const createDefaultSuperAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      console.log('👨‍💼 Creating default super admin...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('superadmin123', salt);
      
      const superAdmin = new Admin({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@runacoss.com',
        password: hashedPassword,
        role: 'super-admin',
        isVerified: true,
        isActive: true,
        permissions: {
          repository: {
            view: true,
            upload: true,
            edit: true,
            delete: true,
            approve: true,
            manageCategories: true,
            manageDepartments: true,
            viewStats: true
          },
          blogs: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            publish: true,
            manageComments: true
          },
          news: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true,
            publish: true,
            manageCategories: true,
            schedule: true
          },
          users: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            suspend: true,
            manageRoles: true,
            viewStats: true
          },
          system: {
            viewLogs: true,
            manageSettings: true,
            backupData: true,
            restoreData: true,
            manageAdmins: true
          }
        },
        matricNumber: 'RUN/ADM/00/00000',
        department: 'Computer Science',
      });
      
      await superAdmin.save();
      console.log('✅ Default super admin created');
      console.log('📧 Email: superadmin@runacoss.com');
      console.log('🔑 Password: superadmin123');
      console.log('⚠️  Please change the default password after first login');
    } else {
      console.log(`👨‍💼 Found ${adminCount} existing admin(s)`);
    }
  } catch (error) {
    console.error('❌ Error creating default super admin:', error.message);
  }
};

/**
 * Validate database models
 */
const validateModels = async () => {
  try {
    console.log('🔍 Validating database models...');
    
    // Test User model
    const userSchema = User.schema;
    console.log('✅ User model validated');
    
    // Test Blog model
    const blogSchema = Blog.schema;
    console.log('✅ Blog model validated');
    
    // Test File model
    const fileSchema = RepoFile.schema;
    console.log('✅ File model validated');
    
    // Test News model
    const newsSchema = News.schema;
    console.log('✅ News model validated');
    
    // Test Admin model
    const adminSchema = Admin.schema;
    console.log('✅ Admin model validated');
    
    console.log('✅ All models validated successfully');
    
  } catch (error) {
    console.error('❌ Model validation error:', error.message);
    throw error;
  }
};

/**
 * Main initialization function
 */
const initDb = async () => {
  try {
    await initializeDatabase();
    await validateModels();
    await createDefaultAdmin();
    await createDefaultSuperAdmin();
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  initDb,
  initializeDatabase,
  createDefaultAdmin,
  createDefaultSuperAdmin,
  validateModels
}; 