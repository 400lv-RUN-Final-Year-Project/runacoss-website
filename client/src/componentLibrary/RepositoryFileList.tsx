import React, { useState, useEffect, useCallback } from 'react';
import { RepositoryFile, FileSearchFilters } from '../services/types';
import { repositoryDataService, formatFileSize, getFileTypeCategory } from '../data/RepositoryFileData';
import MultimediaViewer from './MultimediaViewer';
import { useAuth } from '../context/AuthContext';

interface RepositoryFileListProps {
  category?: string;
  department?: string;
  level?: string;
  semester?: string;
  search?: string;
  onFileDelete?: (fileId: string) => void;
  className?: string;
}

interface SortOption {
  label: string;
  value: string;
}

const RepositoryFileList: React.FC<RepositoryFileListProps> = ({
  category,
  department,
  level,
  semester,
  onFileDelete,
  className = '',
  search
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [filters, setFilters] = useState<FileSearchFilters>({
    category,
    department,
    level,
    semester,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Profile completeness check
  const isProfileComplete = user && user.department && user.level && user.semester && user.phone && user.address;
  const [showProfileMsg, setShowProfileMsg] = useState(false);
  const isApproved = user && user.isApproved;

  const sortOptions: SortOption[] = [
    { label: 'Newest First', value: 'createdAt:desc' },
    { label: 'Oldest First', value: 'createdAt:asc' },
    { label: 'Name A-Z', value: 'fileName:asc' },
    { label: 'Name Z-A', value: 'fileName:desc' },
    { label: 'Size (Largest)', value: 'fileSize:desc' },
    { label: 'Size (Smallest)', value: 'fileSize:asc' },
    { label: 'Most Downloads', value: 'downloadCount:desc' },
    { label: 'Most Views', value: 'viewCount:desc' }
  ];

  // Load files based on filters
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await repositoryDataService.getAllFiles({
        ...filters,
        search: searchQuery,
        page: currentPage,
        limit: 20
      });

      if (response && Array.isArray(response)) {
        setFiles(response);
        setTotalPages(1); // For now, assuming single page
        setTotalItems(response.length);
      } else if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        Array.isArray((response as any).data)
      ) {
        const resp = response as { data: any[]; pagination?: { totalPages?: number; totalItems?: number } };
        setFiles(resp.data);
        setTotalPages(resp.pagination?.totalPages || 1);
        setTotalItems(resp.pagination?.totalItems || 0);
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, currentPage]);

  // Load files when filters change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split(':');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    }));
    setCurrentPage(1);
  }, []);

  // Handle file download
  const handleDownload = async (file: RepositoryFile) => {
    if (!isApproved) {
      alert('You must be approved for repository access to download files.');
      return;
    }
    try {
      const blob = await repositoryDataService.downloadFile(file._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Handle file view
  const handleView = (file: RepositoryFile) => {
    setSelectedFile(file);
    setShowViewer(true);
  };

  // Handle file delete (with profile check)
  const handleDelete = async (fileId: string) => {
    if (!isApproved) {
      alert('You must be approved for repository access to delete files.');
      return;
    }
    if (!isProfileComplete) {
      setShowProfileMsg(true);
      return;
    }
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await repositoryDataService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      onFileDelete?.(fileId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Get file type icon
  const getFileIcon = (file: RepositoryFile) => {
    const category = getFileTypeCategory(file.fileName);
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
    return icons[category as keyof typeof icons] || icons.other;
  };

  // Get file type color
  const getFileTypeColor = (file: RepositoryFile) => {
    const category = getFileTypeCategory(file.fileName);
    const colors = {
      image: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      audio: 'bg-blue-100 text-blue-800',
      document: 'bg-gray-100 text-gray-800',
      presentation: 'bg-orange-100 text-orange-800',
      spreadsheet: 'bg-green-100 text-green-800',
      archive: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadFiles}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Render profile completeness message if needed
  if (showProfileMsg || !isProfileComplete) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-center ${className}`}>
        <p className="mb-2 font-semibold">Ensure you complete your profile before uploading or deleting on the repository.</p>
        <a href="/profile" className="text-primary underline">Go to Profile</a>
      </div>
    );
  }

  // In the render, show a message if not approved
  if (!isApproved) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-red-600 font-semibold text-lg mb-2">You must be approved for repository access to view, upload, or manage files.</div>
        <div className="text-gray-600">Please contact an admin or use the profile page to request approval.</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search files by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Count */}
      <div className="mb-4 text-sm text-gray-600">
        {totalItems > 0 ? `${totalItems} file${totalItems !== 1 ? 's' : ''} found` : 'No files found'}
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search terms.' : 'No files have been uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="text-3xl">{getFileIcon(file)}</div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {file.fileName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {file.description || 'No description available'}
                      </p>
                      
                      {/* File Metadata */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span className={`px-2 py-1 rounded-full ${getFileTypeColor(file)}`}>
                          {file.fileExtension.toUpperCase()}
                        </span>
                        {file.durationFormatted && (
                          <span>⏱️ {file.durationFormatted}</span>
                        )}
                        {file.dimensions && (
                          <span>📐 {file.dimensions.width}×{file.dimensions.height}</span>
                        )}
                        <span>👁️ {file.viewCount} views</span>
                        <span>⬇️ {file.downloadCount} downloads</span>
                      </div>

                      {/* Course Info */}
                      {file.courseCode && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700">
                            Course: {file.courseCode}
                            {file.courseTitle && ` - ${file.courseTitle}`}
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {file.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{file.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleView(file)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                      {onFileDelete && (
                        <button
                          onClick={() => handleDelete(file._id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Uploaded by {file.uploadBy.firstName} {file.uploadBy.lastName} on{' '}
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        {file.isPublic ? '🌐 Public' : '🔒 Private'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Multimedia Viewer Modal */}
      {showViewer && selectedFile ? (
        <MultimediaViewer
          file={selectedFile}
          onClose={() => setShowViewer(false)}
        />
      ) : null}
    </div>
  );
};

export default RepositoryFileList; 