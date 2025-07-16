const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true,
    minlength: [5, 'News title must be at least 5 characters long'],
    maxlength: [200, 'News title cannot exceed 200 characters']
  },

  content: {
    type: String,
    required: [true, 'News content is required'],
    minlength: [20, 'News content must be at least 20 characters long'],
    maxlength: [5000, 'News content cannot exceed 5,000 characters']
  },

  excerpt: {
    type: String,
    maxlength: [300, 'News excerpt cannot exceed 300 characters'],
    default: function() {
      return this.content ? this.content.substring(0, 150) + '...' : '';
    }
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'News author is required'],
    index: true
  },

  // Admin-specific fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator information is required'],
    index: true
  },

  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'featured'],
    default: 'draft'
  },

  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  category: {
    type: String,
    required: [true, 'News category is required'],
    enum: [
      'academic', 
      'events', 
      'announcements', 
      'student-life', 
      'research', 
      'sports', 
      'technology', 
      'general'
    ],
    index: true
  },

  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],

  // Media and attachments
  featuredImage: {
    url: {
      type: String,
      trim: true,
      maxlength: [500, 'Image URL cannot exceed 500 characters']
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Image alt text cannot exceed 100 characters']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    }
  },

  attachments: [{
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: [1, 'File size must be at least 1 byte']
    }
  }],

  // Engagement metrics
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },

  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },

  shareCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Publishing and scheduling
  isPublished: {
    type: Boolean,
    default: false
  },

  publishedAt: {
    type: Date,
    default: null
  },

  scheduledFor: {
    type: Date,
    default: null
  },

  expiresAt: {
    type: Date,
    default: null
  },

  // SEO and meta information
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    maxlength: [200, 'Slug cannot exceed 200 characters']
  },

  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },

  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },

  // Access control
  isPublic: {
    type: Boolean,
    default: true
  },

  requiresAuth: {
    type: Boolean,
    default: false
  },

  allowedRoles: [{
    type: String,
    enum: ['user', 'admin', 'moderator']
  }],

  // Moderation
  isApproved: {
    type: Boolean,
    default: false
  },

  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  approvedAt: {
    type: Date,
    default: null
  },

  moderationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
newsSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
newsSchema.index({ author: 1, createdAt: -1 });
newsSchema.index({ createdBy: 1, createdAt: -1 });
newsSchema.index({ status: 1, isPublished: 1 });
newsSchema.index({ category: 1, status: 1 });
newsSchema.index({ priority: 1, createdAt: -1 });
newsSchema.index({ tags: 1 });
// Note: slug index is automatically created by unique: true
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ scheduledFor: 1 });
newsSchema.index({ isPublic: 1, isApproved: 1 });

// Virtual for reading time (estimated)
newsSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content ? this.content.split(' ').length : 0;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for full author name
newsSchema.virtual('authorName').get(function() {
  return this.author ? `${this.author.firstName} ${this.author.lastName}` : 'Unknown';
});

// Virtual for isExpired
newsSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for isScheduled
newsSchema.virtual('isScheduled').get(function() {
  if (!this.scheduledFor) return false;
  return new Date() < this.scheduledFor;
});

// Pre-save middleware
newsSchema.pre('save', function(next) {
  // Update excerpt if content changed
  if (this.isModified('content')) {
    this.excerpt = this.content ? this.content.substring(0, 150) + '...' : '';
  }
  
  // Generate slug from title if not provided
  if (this.isModified('title') && !this.slug) {
    this.slug = this.generateSlug(this.title);
  }
  
  // Update publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  
  // Set meta title and description if not provided
  if (this.isModified('title') && !this.metaTitle) {
    this.metaTitle = this.title;
  }
  
  if (this.isModified('excerpt') && !this.metaDescription) {
    this.metaDescription = this.excerpt;
  }
  
  next();
});

// Generate URL-friendly slug
newsSchema.methods.generateSlug = function(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

// Static method to find published news
newsSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published', 
    isPublished: true,
    isPublic: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .populate('author', 'firstName lastName email')
  .populate('createdBy', 'firstName lastName')
  .sort({ publishedAt: -1, priority: -1 });
};

// Static method to find news by category
newsSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'published', 
    isPublished: true,
    isPublic: true
  })
  .populate('author', 'firstName lastName')
  .sort({ publishedAt: -1 });
};

// Static method to find news by admin
newsSchema.statics.findByAdmin = function(adminId) {
  return this.find({ createdBy: adminId })
    .populate('author', 'firstName lastName')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

// Static method to find featured news
newsSchema.statics.findFeatured = function() {
  return this.find({ 
    status: 'featured', 
    isPublished: true,
    isPublic: true
  })
  .populate('author', 'firstName lastName')
  .sort({ publishedAt: -1 });
};

// Static method to find news by priority
newsSchema.statics.findByPriority = function(priority) {
  return this.find({ 
    priority, 
    status: 'published', 
    isPublished: true,
    isPublic: true
  })
  .populate('author', 'firstName lastName')
  .sort({ publishedAt: -1 });
};

// Instance method to increment view count
newsSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment like count
newsSchema.methods.incrementLikeCount = function() {
  this.likeCount += 1;
  return this.save();
};

// Instance method to increment share count
newsSchema.methods.incrementShareCount = function() {
  this.shareCount += 1;
  return this.save();
};

// Instance method to publish news
newsSchema.methods.publish = function() {
  this.status = 'published';
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Instance method to feature news
newsSchema.methods.feature = function() {
  this.status = 'featured';
  this.isPublished = true;
  if (!this.publishedAt) {
    this.publishedAt = new Date();
  }
  return this.save();
};

// Instance method to approve news
newsSchema.methods.approve = function(approvedByUserId) {
  this.isApproved = true;
  this.approvedBy = approvedByUserId;
  this.approvedAt = new Date();
  return this.save();
};

// Instance method to archive news
newsSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Instance method to check if user can edit (admin only)
newsSchema.methods.canEdit = function(userId, userRole) {
  return userRole === 'admin' || this.createdBy.toString() === userId.toString();
};

// Instance method to check if user can delete (admin only)
newsSchema.methods.canDelete = function(userRole) {
  return userRole === 'admin';
};

const News = mongoose.model('News', newsSchema);

module.exports = News; 