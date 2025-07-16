const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },

  storedName: {
    type: String,
    required: [true, 'Stored file name is required'],
    unique: true,
    index: true
  },

  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true,
    lowercase: true
  },

  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },

  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte'],
    max: [500 * 1024 * 1024, 'File size cannot exceed 500MB'] // 500MB limit
  },

  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },

  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },

  uploadBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Uploader information is required'],
    index: true
  },

  // Repository-specific fields
  category: {
    type: String,
    required: [true, 'File category is required'],
    enum: [
      'past-questions', 
      'textbooks', 
      'slides', 
      'tutorials', 
      'research', 
      'articles', 
      'presentations', 
      'journals',
      'videos',
      'audio',
      'images',
      'documents',
      'software',
      'datasets',
      'templates'
    ],
    index: true
  },

  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    index: true
  },

  level: {
    type: String,
    required: [true, 'Academic level is required'],
    enum: ['100', '200', '300', '400', '500', '600', 'general'],
    index: true
  },

  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['first', 'second', 'summer', 'general'],
    index: true
  },

  courseCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Course code cannot exceed 10 characters']
  },

  courseTitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],

  // File metadata
  fileFormat: {
    type: String,
    required: [true, 'File format is required'],
    trim: true,
    lowercase: true
  },

  fileExtension: {
    type: String,
    required: [true, 'File extension is required'],
    trim: true,
    lowercase: true
  },

  // Multimedia-specific fields
  duration: {
    type: Number, // Duration in seconds for audio/video files
    min: [0, 'Duration cannot be negative']
  },

  dimensions: {
    width: {
      type: Number,
      min: [1, 'Width must be at least 1 pixel']
    },
    height: {
      type: Number,
      min: [1, 'Height must be at least 1 pixel']
    }
  },

  bitrate: {
    type: Number, // Bitrate in kbps for audio/video files
    min: [1, 'Bitrate must be at least 1 kbps']
  },

  resolution: {
    type: String, // Resolution for video files (e.g., "1920x1080")
    trim: true
  },

  frameRate: {
    type: Number, // Frame rate for video files
    min: [1, 'Frame rate must be at least 1 fps']
  },

  // Document-specific fields
  pageCount: {
    type: Number, // Number of pages for documents
    min: [1, 'Page count must be at least 1']
  },

  language: {
    type: String,
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters']
  },

  version: {
    type: String,
    trim: true,
    maxlength: [20, 'Version cannot exceed 20 characters']
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  approvedAt: {
    type: Date,
    default: null
  },

  moderationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },

  // Engagement metrics
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },

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

  // File status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted', 'processing'],
    default: 'active'
  },

  // Thumbnail for multimedia files
  thumbnail: {
    url: {
      type: String,
      trim: true,
      maxlength: [500, 'Thumbnail URL cannot exceed 500 characters']
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Thumbnail alt text cannot exceed 100 characters']
    }
  },

  // Checksum for file integrity
  checksum: {
    type: String,
    trim: true,
    maxlength: [64, 'Checksum cannot exceed 64 characters']
  },

  // Expiry date for temporary files
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
fileSchema.index({ category: 1, department: 1, level: 1, semester: 1 });
fileSchema.index({ uploadBy: 1, createdAt: -1 });
fileSchema.index({ isPublic: 1, isApproved: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ fileName: 'text', description: 'text' });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ fileType: 1, fileFormat: 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ courseCode: 1, courseTitle: 1 });

// Virtual for file size in human readable format
fileSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for full course info
fileSchema.virtual('courseInfo').get(function() {
  return this.courseCode && this.courseTitle 
    ? `${this.courseCode} - ${this.courseTitle}`
    : this.courseCode || this.courseTitle || 'N/A';
});

// Virtual for duration in human readable format
fileSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return null;
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for file type category
fileSchema.virtual('fileTypeCategory').get(function() {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const presentationTypes = ['ppt', 'pptx', 'odp'];
  const spreadsheetTypes = ['xls', 'xlsx', 'ods', 'csv'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  const ext = this.fileExtension.toLowerCase();
  
  if (imageTypes.includes(ext)) return 'image';
  if (videoTypes.includes(ext)) return 'video';
  if (audioTypes.includes(ext)) return 'audio';
  if (documentTypes.includes(ext)) return 'document';
  if (presentationTypes.includes(ext)) return 'presentation';
  if (spreadsheetTypes.includes(ext)) return 'spreadsheet';
  if (archiveTypes.includes(ext)) return 'archive';
  
  return 'other';
});

// Virtual for isExpired
fileSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Pre-save middleware to ensure file type is lowercase
fileSchema.pre('save', function(next) {
  if (this.isModified('fileType')) {
    this.fileType = this.fileType.toLowerCase();
  }
  if (this.isModified('fileExtension')) {
    this.fileExtension = this.fileExtension.toLowerCase();
  }
  if (this.isModified('courseCode')) {
    this.courseCode = this.courseCode ? this.courseCode.toUpperCase() : this.courseCode;
  }
  next();
});

// Static method to find files by category and department
fileSchema.statics.findByCategoryAndDepartment = function(category, department) {
  return this.find({ 
    category, 
    department, 
    isPublic: true, 
    isApproved: true,
    status: 'active'
  })
  .populate('uploadBy', 'firstName lastName')
  .sort({ createdAt: -1 });
};

// Static method to find approved files
fileSchema.statics.findApproved = function() {
  return this.find({ isPublic: true, isApproved: true, status: 'active' })
    .populate('uploadBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

// Static method to find files by type
fileSchema.statics.findByType = function(fileType) {
  return this.find({ 
    fileType, 
    isPublic: true, 
    isApproved: true,
    status: 'active'
  })
  .populate('uploadBy', 'firstName lastName')
  .sort({ createdAt: -1 });
};

// Static method to find multimedia files
fileSchema.statics.findMultimedia = function() {
  return this.find({ 
    category: { $in: ['videos', 'audio', 'images'] },
    isPublic: true, 
    isApproved: true,
    status: 'active'
  })
  .populate('uploadBy', 'firstName lastName')
  .sort({ createdAt: -1 });
};

// Instance method to increment download count
fileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Instance method to increment view count
fileSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment like count
fileSchema.methods.incrementLikeCount = function() {
  this.likeCount += 1;
  return this.save();
};

// Instance method to approve file
fileSchema.methods.approve = function(approvedByUserId) {
  this.isApproved = true;
  this.approvedBy = approvedByUserId;
  this.approvedAt = new Date();
  return this.save();
};

// Instance method to archive file
fileSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Instance method to check if file is multimedia
fileSchema.methods.isMultimedia = function() {
  return ['videos', 'audio', 'images'].includes(this.category);
};

// Instance method to check if file is document
fileSchema.methods.isDocument = function() {
  return ['past-questions', 'textbooks', 'slides', 'tutorials', 'research', 'articles', 'presentations', 'journals', 'documents'].includes(this.category);
};

const RepoFile = mongoose.model("File", fileSchema);

module.exports = RepoFile;