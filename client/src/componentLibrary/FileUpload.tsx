import React, { useState, useRef, useCallback } from 'react';
import { FileUploadRequest, RepositoryCategory } from '../services/types';
import { repositoryDataService, validateFileType, validateFileSize, formatFileSize, getFileTypeCategory, getAllowedFileTypes, getMaxFileSize } from '../data/RepositoryFileData';

interface FileUploadProps {
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
  category?: string;
  department?: string;
  level?: string;
  semester?: string;
  className?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  category = '',
  department = '',
  level = '',
  semester = '',
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    courseCode: '',
    courseTitle: '',
    description: '',
    tags: '',
    isPublic: true,
    requiresAuth: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = [];

    if (!category) {
      errors.push('Please select a category first');
      return errors;
    }

    if (!validateFileType(file, category)) {
      const allowedTypes = getAllowedFileTypes(category);
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (!validateFileSize(file, category)) {
      const maxSize = getMaxFileSize(category);
      errors.push(`File too large. Maximum size: ${formatFileSize(maxSize)}`);
    }

    return errors;
  }, [category]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationErrors = validateFile(file);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, [validateFile]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validationErrors = validateFile(file);
      setErrors(validationErrors);

      if (validationErrors.length === 0) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  }, [validateFile]);

  // Handle form input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    setUploadData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    }));
  };

  // Handle file upload
  const handleUpload = async () => {
    const missingFields = [];
    if (!selectedFile) missingFields.push('file');
    if (!category) missingFields.push('category');
    if (!department) missingFields.push('department');
    if (!level) missingFields.push('level');
    if (!semester) missingFields.push('semester');

    if (missingFields.length > 0) {
      if (missingFields.includes('department') || missingFields.includes('level') || missingFields.includes('semester')) {
        setErrors(['Please complete your profile information (department, level, semester) before uploading files. You can edit your profile from the Profile page.']);
      } else {
        setErrors(['Please fill in all required fields and select a file']);
      }
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const uploadRequest: FileUploadRequest = {
        file: selectedFile!,
        category,
        department,
        level,
        semester,
        courseCode: uploadData.courseCode || undefined,
        courseTitle: uploadData.courseTitle || undefined,
        description: uploadData.description || undefined,
        tags: uploadData.tags ? uploadData.tags.split(',').map(tag => tag.trim()) : undefined,
        isPublic: uploadData.isPublic,
        requiresAuth: uploadData.requiresAuth,
        allowedRoles: []
      };

      // Simulate upload progress (in real implementation, you'd use XMLHttpRequest or fetch with progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return { loaded: 0, total: selectedFile!.size, percentage: 0 };
          const newLoaded = Math.min(prev.loaded + selectedFile!.size / 20, selectedFile!.size);
          const newPercentage = Math.round((newLoaded / selectedFile!.size) * 100);
          return { loaded: newLoaded, total: selectedFile!.size, percentage: newPercentage };
        });
      }, 100);

      const uploadedFile = await repositoryDataService.uploadFile(uploadRequest);

      clearInterval(progressInterval);
      setUploadProgress({ loaded: selectedFile!.size, total: selectedFile!.size, percentage: 100 });

      // Reset form
      setSelectedFile(null);
      setUploadData({
        courseCode: '',
        courseTitle: '',
        description: '',
        tags: '',
        isPublic: true,
        requiresAuth: false
      });
      setUploadProgress(null);

      onUploadSuccess?.(uploadedFile);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors([errorMessage]);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Get file type category for display
  const getFileTypeDisplay = (file: File) => {
    const category = getFileTypeCategory(file.name);
    const icons = {
      image: '🖼️',
      video: '🎥',
      audio: '🎧',
      document: '📄',
      presentation: '📊',
      spreadsheet: '📈',
      archive: '📦',
      other: '📁'
    };
    return { category, icon: icons[category as keyof typeof icons] || icons.other };
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload File to Repository</h3>

      {/* File Selection Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {(() => {
                const { icon } = getFileTypeDisplay(selectedFile);
                return <span className="text-3xl">{icon}</span>;
              })()}
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                <p className="text-xs text-gray-400">{getFileTypeCategory(selectedFile.name)}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 mb-2">Drag and drop a file here, or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept={category ? getAllowedFileTypes(category).map(type => `.${type}`).join(',') : undefined}
            />
          </div>
        )}
      </div>

      {/* File Information Form */}
      {selectedFile && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-gray-800">File Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code (Optional)
              </label>
              <input
                type="text"
                name="courseCode"
                value={uploadData.courseCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CSC101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title (Optional)
              </label>
              <input
                type="text"
                name="courseTitle"
                value={uploadData.courseTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={uploadData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the file content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={uploadData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="programming, algorithms, tutorial (comma-separated)"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={uploadData.isPublic}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Make file public</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="requiresAuth"
                checked={uploadData.requiresAuth}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require authentication</span>
            </label>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <button
          onClick={handleUpload}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Upload File
        </button>
      )}

      {isUploading && (
        <button
          disabled
          className="mt-6 w-full bg-gray-400 text-white py-3 px-4 rounded-md font-medium cursor-not-allowed"
        >
          Uploading...
        </button>
      )}
    </div>
  );
};

export default FileUpload; 