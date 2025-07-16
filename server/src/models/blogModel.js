const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    minlength: [5, 'Blog title must be at least 5 characters long'],
    maxlength: [200, 'Blog title cannot exceed 200 characters']
  },

  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [10, 'Blog content must be at least 10 characters long'],
    maxlength: [10000, 'Blog content cannot exceed 10,000 characters']
  },

  excerpt: {
    type: String,
    maxlength: [300, 'Blog excerpt cannot exceed 300 characters'],
    default: function() {
      return this.content ? this.content.substring(0, 150) + '...' : '';
    }
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Blog author is required'],
    index: true
  },

  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],

  readCount: {
    type: Number,
    default: 0,
    min: 0
  },

  isPublished: {
    type: Boolean,
    default: false
  },

  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ user: 1, createdAt: -1 });
blogSchema.index({ status: 1, isPublished: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });

// Virtual for reading time (estimated)
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content ? this.content.split(' ').length : 0;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to update excerpt and publishedAt
blogSchema.pre('save', function(next) {
  // Update excerpt if content changed
  if (this.isModified('content')) {
    this.excerpt = this.content ? this.content.substring(0, 150) + '...' : '';
  }
  
  // Update publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  
  next();
});

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({ status: 'published', isPublished: true })
    .populate('user', 'firstName lastName email')
    .sort({ publishedAt: -1 });
};

// Static method to find blogs by user
blogSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Instance method to increment read count
blogSchema.methods.incrementReadCount = function() {
  this.readCount += 1;
  return this.save();
};

// Instance method to publish blog
blogSchema.methods.publish = function() {
  this.status = 'published';
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;