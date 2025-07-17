import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RepositoryFile } from '../../services/types';
import { repositoryDataService, getCategoryByName } from '../../data/RepositoryFileData';
import RepositoryFileList from '../../componentLibrary/RepositoryFileList';
import FileUpload from '../../componentLibrary/FileUpload';
import MultimediaViewer from '../../componentLibrary/MultimediaViewer';
import { useAuth } from '../../context/AuthContext';

const RepositoryCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Get category information
  useEffect(() => {
    if (category) {
      const catInfo = getCategoryByName(category);
      setCategoryInfo(catInfo);
    }
  }, [category]);

  // Load category statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const categoryStats = await repositoryDataService.getStats();
        if (categoryStats && categoryStats.byCategory) {
          const catStats = categoryStats.byCategory.find((stat: any) => stat._id === category);
          setStats(catStats);
        }
      } catch (error) {
        console.error('Error loading category stats:', error);
      }
    };

    loadStats();
  }, [category]);

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error}`);
  };

  if (!categoryInfo) {
    return (
      <div className="px-6 md:px-20 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The requested category does not exist.</p>
          <button
            onClick={() => navigate('/repository')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-20 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/repository')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Repository
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{categoryInfo.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{categoryInfo.label}</h1>
                <p className="text-gray-600">{categoryInfo.description}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <span>📤</span>
            <span>Upload File</span>
          </button>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalSize ? `${(stats.totalSize / (1024 * 1024)).toFixed(1)} MB` : '0 MB'}
            </div>
            <div className="text-sm text-gray-600">Total Size</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">
              {categoryInfo.allowedFileTypes.length}
            </div>
            <div className="text-sm text-gray-600">Supported Formats</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">
              {categoryInfo.maxFileSize ? `${(categoryInfo.maxFileSize / (1024 * 1024)).toFixed(0)} MB` : '50 MB'}
            </div>
            <div className="text-sm text-gray-600">Max File Size</div>
          </div>
        </div>

        {/* Supported File Types */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Supported File Types</h3>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.allowedFileTypes.map((type: string) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                .{type.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <RepositoryFileList
          category={category}
          className="p-6"
        />
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload to {categoryInfo.label}</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <FileUpload
                category={category}
                department={user?.department || ''}
                level={user?.level || ''}
                semester={user?.semester || ''}
                onUploadSuccess={() => {
                  setShowUpload(false);
                  // Refresh the file list
                  window.location.reload();
                }}
                onUploadError={handleUploadError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multimedia Viewer Modal */}
      {showViewer && selectedFile && (
        <MultimediaViewer
          file={selectedFile}
          onClose={() => {
            setShowViewer(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default RepositoryCategory;
