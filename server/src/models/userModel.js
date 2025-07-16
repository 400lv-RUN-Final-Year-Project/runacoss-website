const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  matricNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^RUN\/[A-Z]{3}\/[0-9]{2}\/[0-9]{5}$/i, 'Matric number must be in format: RUN/DEPT/YY/12345']
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Cyber Security', 'Information Technology']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  canAccessRepository: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  verificationTokenExpires: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  passwordResetExpires: {
    type: Date
  },
  lastLogin: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phone: { type: String },
  address: { type: String },
  level: { type: String },
  semester: { type: String },
  avatar: {
    url: { type: String },
    alt: { type: String }
  },
}, {
  timestamps: true,
});

userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.methods.isVerificationTokenExpired = function() {
  return this.verificationTokenExpires < new Date();
};

userSchema.methods.isPasswordResetTokenExpired = function() {
  return this.passwordResetExpires < new Date();
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;