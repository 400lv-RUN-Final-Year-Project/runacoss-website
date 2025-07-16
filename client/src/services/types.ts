// User related types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNumber: string;
  department: string;
  isVerified: boolean;
  isApproved: boolean;
  canAccessRepository: boolean;
  role?: 'user' | 'admin' | 'moderator';
  level?: string;
  semester?: string;
  phone?: string;
  address?: string;
  avatar?: {
    url: string;
    alt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Admin related types
export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'super-admin' | 'admin' | 'moderator';
  permissions: AdminPermissions;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  avatar?: {
    url: string;
    alt: string;
  };
  bio?: string;
  department?: string;
  position?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermissions {
  repository: {
    view: boolean;
    upload: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    manageCategories: boolean;
    manageDepartments: boolean;
    viewStats: boolean;
  };
  blogs: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    publish: boolean;
    manageComments: boolean;
  };
  news: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    publish: boolean;
    manageCategories: boolean;
    schedule: boolean;
  };
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    suspend: boolean;
    manageRoles: boolean;
    viewStats: boolean;
  };
  system: {
    viewLogs: boolean;
    manageSettings: boolean;
    backupData: boolean;
    restoreData: boolean;
    manageAdmins: boolean;
  };
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    token: string;
  };
}

export interface DashboardStats {
  counts: {
    users: number;
    files: number;
    blogs: number;
    news: number;
    admins: number;
  };
  recentActivity: {
    files: RepositoryFile[];
    blogs: Blog[];
    news: News[];
  };
  fileStats: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
}

export interface AuthResponse {
  message: string;
  refreshToken: string;
  user?: User;
}

// Blog related types
export interface Blog {
  _id: string;
  title: string;
  content: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface BlogResponse {
  message: string;
  blogs: Blog[];
  page: number;
  limit: number;
  totalPages: number;
  totalBlogs: number;
}

// News related types
export interface News {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  createdBy: User;
  category: 'academic' | 'events' | 'announcements' | 'student-life' | 'research' | 'sports' | 'technology' | 'general';
  status: 'draft' | 'published' | 'archived' | 'featured';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
    caption: string;
  };
  attachments: NewsAttachment[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isPublished: boolean;
  publishedAt?: string;
  scheduledFor?: string;
  expiresAt?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublic: boolean;
  requiresAuth: boolean;
  allowedRoles: string[];
  isApproved: boolean;
  approvedBy?: User;
  approvedAt?: string;
  moderationNotes?: string;
  readingTime: number;
  authorName: string;
  isExpired: boolean;
  isScheduled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface NewsResponse {
  success: boolean;
  data: News[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// File and Repository related types
export interface RepositoryFile {
  _id: string;
  fileName: string;
  storedName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  filePath: string;
  fileUrl: string;
  uploadBy: User;
  
  // Repository categorization
  category: 'past-questions' | 'textbooks' | 'slides' | 'tutorials' | 'research' | 'final-year-projects' | 'articles' | 'presentations' | 'journals' | 'videos' | 'audio' | 'images' | 'documents' | 'software' | 'datasets' | 'templates';
  department: string;
  level: '100' | '200' | '300' | '400' | '500' | '600' | 'general';
  semester: 'first' | 'second' | 'summer' | 'general';
  courseCode?: string;
  courseTitle?: string;
  courseInfo: string;
  description?: string;
  tags: string[];
  
  // File metadata
  fileFormat: string;
  fileExtension: string;
  fileTypeCategory: 'image' | 'video' | 'audio' | 'document' | 'presentation' | 'spreadsheet' | 'archive' | 'other';
  
  // Multimedia-specific fields
  duration?: number;
  durationFormatted?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  bitrate?: number;
  resolution?: string;
  frameRate?: number;
  
  // Document-specific fields
  pageCount?: number;
  language?: string;
  version?: string;
  
  // Access control
  isPublic: boolean;
  requiresAuth: boolean;
  allowedRoles: string[];
  
  // Moderation
  isApproved: boolean;
  approvedBy?: User;
  approvedAt?: string;
  moderationNotes?: string;
  
  // Engagement metrics
  downloadCount: number;
  viewCount: number;
  likeCount: number;
  
  // File status
  status: 'active' | 'archived' | 'deleted' | 'processing';
  
  // Thumbnail for multimedia files
  thumbnail?: {
    url: string;
    alt: string;
  };
  
  // File integrity
  checksum?: string;
  expiresAt?: string;
  isExpired: boolean;
  
  // Helper methods
  isMultimedia: boolean;
  isDocument: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface FileUpload {
  _id: string;
  fileName: string;
  storedName: string;
  fileType: string;
  fileSize: number;
  uploadBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface FileResponse {
  success: boolean;
  data: RepositoryFile[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

// Repository structure types
import { IconType } from 'react-icons';

export interface RepositoryCategory {
  name: string;
  label: string;
  description: string;
  icon: string | IconType;
  color: string;
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
}

export interface RepositoryDepartment {
  code: string;
  name: string;
  description: string;
  levels: string[];
}

export interface RepositoryLevel {
  level: string;
  name: string;
  semesters: string[];
}

export interface RepositorySemester {
  semester: string;
  name: string;
  description: string;
}

// File upload types
export interface FileUploadRequest {
  file: File;
  category: string;
  department: string;
  level: string;
  semester: string;
  courseCode?: string;
  courseTitle?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

export interface FileUploadResponse {
  success: boolean;
  data: RepositoryFile;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  stack?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FileSearchFilters {
  category?: string;
  department?: string;
  level?: string;
  semester?: string;
  fileType?: string;
  fileFormat?: string;
  tags?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Curriculum related types
export interface Course {
  title: string;
  code: string;
  units: number;
  type: 'Compulsory' | 'Elective';
}

export interface Curriculum {
  [level: string]: {
    [semester: string]: Course[];
  };
}