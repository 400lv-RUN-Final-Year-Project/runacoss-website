const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Basic admin info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },

  // Admin role and permissions
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'moderator'],
    default: 'admin'
  },

  permissions: {
    // Repository permissions
    repository: {
      view: { type: Boolean, default: true },
      upload: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
      approve: { type: Boolean, default: true },
      manageCategories: { type: Boolean, default: true },
      manageDepartments: { type: Boolean, default: true },
      viewStats: { type: Boolean, default: true }
    },

    // Blog permissions
    blogs: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
      approve: { type: Boolean, default: true },
      publish: { type: Boolean, default: true },
      manageComments: { type: Boolean, default: true }
    },

    // News permissions
    news: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
      approve: { type: Boolean, default: true },
      publish: { type: Boolean, default: true },
      manageCategories: { type: Boolean, default: true },
      schedule: { type: Boolean, default: true }
    },

    // User management permissions
    users: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
      suspend: { type: Boolean, default: true },
      manageRoles: { type: Boolean, default: true },
      viewStats: { type: Boolean, default: true }
    },

    // System permissions
    system: {
      viewLogs: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
      backupData: { type: Boolean, default: false },
      restoreData: { type: Boolean, default: false },
      manageAdmins: { type: Boolean, default: false }
    }
  },

  // Admin status
  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  lastLogin: {
    type: Date,
    default: null
  },

  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: {
    type: Date,
    default: null
  },

  // Admin profile
  avatar: {
    url: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Avatar alt text cannot exceed 100 characters']
    }
  },

  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },

  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },

  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },

  // Admin activity tracking
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      type: String
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Admin preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    dashboardLayout: {
      type: String,
      enum: ['default', 'compact', 'detailed'],
      default: 'default'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Security settings
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  twoFactorSecret: {
    type: String
  },

  passwordResetToken: {
    type: String
  },

  passwordResetExpires: {
    type: Date
  },

  emailVerificationToken: {
    type: String
  },

  emailVerificationExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ 'permissions.repository.upload': 1 });
adminSchema.index({ 'permissions.blogs.create': 1 });
adminSchema.index({ 'permissions.news.create': 1 });
adminSchema.index({ createdAt: -1 });

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isLocked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for canLogin
adminSchema.virtual('canLogin').get(function() {
  return this.isActive && this.isVerified && !this.isLocked;
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check permission
adminSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'super-admin') return true;
  
  const modulePermissions = this.permissions[module];
  if (!modulePermissions) return false;
  
  return modulePermissions[action] === true;
};

// Instance method to check multiple permissions
adminSchema.methods.hasPermissions = function(permissions) {
  for (const [module, action] of Object.entries(permissions)) {
    if (!this.hasPermission(module, action)) {
      return false;
    }
  }
  return true;
};

// Instance method to log activity
adminSchema.methods.logActivity = function(action, target, targetId, details, req) {
  const logEntry = {
    action,
    target,
    targetId,
    details,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.headers?.['user-agent'],
    timestamp: new Date()
  };

  this.activityLog.push(logEntry);
  
  // Keep only last 100 activity logs
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find admins by role
adminSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find admins with permission
adminSchema.statics.findWithPermission = function(module, action) {
  return this.find({
    isActive: true,
    [`permissions.${module}.${action}`]: true
  }).sort({ createdAt: -1 });
};

// Static method to get admin stats
adminSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAdmins: { $sum: 1 },
        activeAdmins: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedAdmins: { $sum: { $cond: ['$isVerified', 1, 0] } },
        superAdmins: { $sum: { $cond: [{ $eq: ['$role', 'super-admin'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        moderators: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } }
      }
    }
  ]);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin; 