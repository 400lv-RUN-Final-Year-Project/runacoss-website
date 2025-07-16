import { RepositoryFile, RepositoryCategory, RepositoryDepartment } from "../services/types";
import { repositoryApi } from "../services/api";
import { 
  HiDocumentText, 
  HiVideoCamera, 
  HiSpeakerphone, 
  HiPhotograph, 
  HiCode, 
  HiChartBar, 
  HiClipboardList,
  HiAcademicCap,
  HiBookOpen,
  HiPresentationChartLine,
  HiLightBulb,
  HiDocumentReport,
  HiCollection,
  HiTemplate,
  HiDocumentDuplicate,
  HiClipboardCheck
} from "react-icons/hi";

// Repository categories with multimedia support
export const repositoryCategories: RepositoryCategory[] = [
  {
    name: 'past-questions',
    label: 'Past Questions',
    description: 'Previous examination questions and solutions',
    icon: HiClipboardCheck,
    color: '#3B82F6',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    name: 'textbooks',
    label: 'Textbooks',
    description: 'Course textbooks and reference materials',
    icon: HiBookOpen,
    color: '#10B981',
    allowedFileTypes: ['pdf', 'epub', 'mobi', 'doc', 'docx'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  {
    name: 'slides',
    label: 'Slides',
    description: 'Lecture slides and presentations',
    icon: HiPresentationChartLine,
    color: '#F59E0B',
    allowedFileTypes: ['ppt', 'pptx', 'pdf', 'key'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    name: 'tutorials',
    label: 'Tutorials',
    description: 'Tutorial materials and guides',
    icon: HiAcademicCap,
    color: '#8B5CF6',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'mp4', 'avi', 'mov'],
    maxFileSize: 200 * 1024 * 1024 // 200MB
  },
  {
    name: 'research',
    label: 'Research',
    description: 'Research papers and publications',
    icon: HiLightBulb,
    color: '#EF4444',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'bib'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    name: 'final-year-projects',
    label: 'Final Year Projects',
    description: 'Final year project reports and documentation',
    icon: HiAcademicCap,
    color: '#8B5CF6',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'ppt', 'pptx'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  {
    name: 'articles',
    label: 'Articles',
    description: 'Academic articles and journals',
    icon: HiDocumentText,
    color: '#06B6D4',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'html'],
    maxFileSize: 30 * 1024 * 1024 // 30MB
  },
  {
    name: 'presentations',
    label: 'Presentations',
    description: 'Student and faculty presentations',
    icon: HiPresentationChartLine,
    color: '#84CC16',
    allowedFileTypes: ['ppt', 'pptx', 'pdf', 'key', 'mp4'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  {
    name: 'journals',
    label: 'Journals',
    description: 'Academic journals and publications',
    icon: HiBookOpen,
    color: '#F97316',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    name: 'videos',
    label: 'Videos',
    description: 'Educational videos and lectures',
    icon: HiVideoCamera,
    color: '#EC4899',
    allowedFileTypes: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
    maxFileSize: 500 * 1024 * 1024 // 500MB
  },
  {
    name: 'audio',
    label: 'Audio',
    description: 'Audio lectures and podcasts',
    icon: HiSpeakerphone,
    color: '#6366F1',
    allowedFileTypes: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  {
    name: 'images',
    label: 'Images',
    description: 'Educational images and diagrams',
    icon: HiPhotograph,
    color: '#14B8A6',
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
    maxFileSize: 20 * 1024 * 1024 // 20MB
  },
  {
    name: 'documents',
    label: 'Documents',
    description: 'General documents and files',
    icon: HiDocumentText,
    color: '#6B7280',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    name: 'software',
    label: 'Software',
    description: 'Software tools and applications',
    icon: HiCode,
    color: '#059669',
    allowedFileTypes: ['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'zip', 'rar'],
    maxFileSize: 500 * 1024 * 1024 // 500MB
  },
  {
    name: 'datasets',
    label: 'Datasets',
    description: 'Data files and datasets',
    icon: HiChartBar,
    color: '#7C3AED',
    allowedFileTypes: ['csv', 'xls', 'xlsx', 'json', 'xml', 'sql', 'zip', 'rar'],
    maxFileSize: 200 * 1024 * 1024 // 200MB
  },
  {
    name: 'templates',
    label: 'Templates',
    description: 'Document and project templates',
    icon: HiTemplate,
    color: '#DC2626',
    allowedFileTypes: ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  }
];

// Department structure
export const repositoryDepartments: RepositoryDepartment[] = [
  {
    code: 'cs',
    name: 'Computer Science',
    description: 'Computer Science and Information Technology',
    levels: ['100', '200', '300', '400', '500', '600']
  },
  {
    code: 'se',
    name: 'Software Engineering',
    description: 'Software Engineering and Development',
    levels: ['100', '200', '300', '400', '500', '600']
  },
  {
    code: 'it',
    name: 'Information Technology',
    description: 'Information Technology and Systems',
    levels: ['100', '200', '300', '400', '500', '600']
  },
  {
    code: 'ce',
    name: 'Computer Engineering',
    description: 'Computer Engineering and Hardware',
    levels: ['100', '200', '300', '400', '500', '600']
  },
  {
    code: 'general',
    name: 'General',
    description: 'General academic materials',
    levels: ['general']
  }
];

// API-based data fetching functions
export const repositoryDataService = {
  // Get files by category
  getFilesByCategory: async (category: string, filters: any = {}) => {
    try {
      const response = await repositoryApi.getFilesByCategory(category, filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files by category:', error);
      return [];
    }
  },

  // Get files by department
  getFilesByDepartment: async (department: string, filters: any = {}) => {
    try {
      const response = await repositoryApi.getFilesByDepartment(department, filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files by department:', error);
      return [];
    }
  },

  // Get files by path (category, department, level, semester)
  getFilesByPath: async (category: string, department: string, level: string, semester: string) => {
    try {
      const response = await repositoryApi.getFiles({
        category,
        department,
        level,
        semester
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files by path:', error);
      return [];
    }
  },

  // Get all files with filters
  getAllFiles: async (filters: any = {}) => {
    try {
      const response = await repositoryApi.getFiles(filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all files:', error);
      return [];
    }
  },

  // Search files
  searchFiles: async (query: string, filters: any = {}) => {
    try {
      const response = await repositoryApi.searchFiles(query, filters);
      return response.data || [];
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  },

  // Get multimedia files
  getMultimediaFiles: async (filters: any = {}) => {
    try {
      const response = await repositoryApi.getMultimediaFiles(filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching multimedia files:', error);
      return [];
    }
  },

  // Get repository statistics
  getStats: async () => {
    try {
      const response = await repositoryApi.getStats();
      return response.data || null;
    } catch (error) {
      console.error('Error fetching repository stats:', error);
      return null;
    }
  },

  // Upload file
  uploadFile: async (uploadData: any) => {
    try {
      const response = await repositoryApi.uploadFile(uploadData);
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Download file
  downloadFile: async (fileId: string) => {
    try {
      const blob = await repositoryApi.downloadFile(fileId);
      return blob;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Update file
  updateFile: async (fileId: string, updateData: any) => {
    try {
      const response = await repositoryApi.updateFile(fileId, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    try {
      await repositoryApi.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};

// Helper functions for repository data
export const getCategoryByName = (name: string): RepositoryCategory | undefined => {
  return repositoryCategories.find(cat => cat.name === name);
};

export const getDepartmentByCode = (code: string): RepositoryDepartment | undefined => {
  return repositoryDepartments.find(dept => dept.code === code);
};

export const getAllowedFileTypes = (category: string): string[] => {
  const cat = getCategoryByName(category);
  return cat ? cat.allowedFileTypes : [];
};

export const getMaxFileSize = (category: string): number => {
  const cat = getCategoryByName(category);
  return cat ? cat.maxFileSize : 50 * 1024 * 1024; // Default 50MB
};

// File type validation
export const validateFileType = (file: File, category: string): boolean => {
  const allowedTypes = getAllowedFileTypes(category);
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension || '');
};

export const validateFileSize = (file: File, category: string): boolean => {
  const maxSize = getMaxFileSize(category);
  return file.size <= maxSize;
};

// File format detection
export const getFileTypeCategory = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const presentationTypes = ['ppt', 'pptx', 'odp'];
  const spreadsheetTypes = ['xls', 'xlsx', 'ods', 'csv'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (imageTypes.includes(ext)) return 'image';
  if (videoTypes.includes(ext)) return 'video';
  if (audioTypes.includes(ext)) return 'audio';
  if (documentTypes.includes(ext)) return 'document';
  if (presentationTypes.includes(ext)) return 'presentation';
  if (spreadsheetTypes.includes(ext)) return 'spreadsheet';
  if (archiveTypes.includes(ext)) return 'archive';

  return 'other';
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Legacy static data (keeping for fallback)
export const repositoryFiles: {
  [category: string]: {
    [department: string]: {
      [level: string]: {
        [semester: string]: RepositoryFile[];
      };
    };
  };
} = {};

// Export the main service
export default repositoryDataService;
