import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';

interface DashboardStats {
  counts: {
    users: number;
    files: number;
    blogs: number;
    news: number;
    admins: number;
  };
  recentActivity: {
    files: any[];
    blogs: any[];
    news: any[];
  };
  fileStats: any[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { admin, hasPermission } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.dashboard.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage RUNACOSS content and users</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/admin/management')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Manage Content
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'repository', label: 'Repository', icon: '📁' },
              { id: 'blogs', label: 'Blogs', icon: '📝' },
              { id: 'news', label: 'News', icon: '📰' },
              { id: 'users', label: 'Users', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.counts.users || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📁</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.counts.files || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.counts.blogs || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-2xl">📰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total News</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.counts.news || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.counts.admins || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Statistics */}
            {stats?.fileStats && stats.fileStats.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">File Statistics by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.fileStats.map((stat, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 capitalize">{stat._id.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-600">{stat.count} files</p>
                      <p className="text-xs text-gray-500">
                        {(stat.totalSize / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Files */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Files</h3>
                <div className="space-y-3">
                  {stats?.recentActivity.files?.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">📁</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/admin/management/repository')}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all files →
                </button>
              </div>

              {/* Recent Blogs */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Blogs</h3>
                <div className="space-y-3">
                  {stats?.recentActivity.blogs?.slice(0, 5).map((blog, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">📝</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{blog.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/admin/management/blogs')}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all blogs →
                </button>
              </div>

              {/* Recent News */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent News</h3>
                <div className="space-y-3">
                  {stats?.recentActivity.news?.slice(0, 5).map((news, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">📰</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{news.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(news.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/admin/management/news')}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all news →
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hasPermission('repository', 'upload') && (
                  <button
                    onClick={() => navigate('/admin/management/repository')}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl">📁</span>
                      <p className="mt-2 font-medium text-blue-900">Manage Files</p>
                    </div>
                  </button>
                )}
                
                {hasPermission('blogs', 'create') && (
                  <button
                    onClick={() => navigate('/admin/management/blogs')}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl">📝</span>
                      <p className="mt-2 font-medium text-green-900">Manage Blogs</p>
                    </div>
                  </button>
                )}
                
                {hasPermission('news', 'create') && (
                  <button
                    onClick={() => navigate('/admin/management/news')}
                    className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl">📰</span>
                      <p className="mt-2 font-medium text-orange-900">Manage News</p>
                    </div>
                  </button>
                )}
                
                {hasPermission('users', 'view') && (
                  <button
                    onClick={() => navigate('/admin/management/users')}
                    className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl">👥</span>
                      <p className="mt-2 font-medium text-purple-900">Manage Users</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repository' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Repository Management</h2>
              <button
                onClick={() => navigate('/admin/management/repository')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Manage Repository
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Manage repository files, approve uploads, and monitor file usage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Total Files</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.counts.files || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Approved Files</h4>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.recentActivity.files?.filter(f => f.isApproved).length || 0}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900">Pending Approval</h4>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.recentActivity.files?.filter(f => !f.isApproved).length || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
              <button
                onClick={() => navigate('/admin/management/blogs')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Manage Blogs
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Create, edit, and manage blog posts and articles.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Total Blogs</h4>
                <p className="text-2xl font-bold text-green-600">{stats?.counts.blogs || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Recent Blogs</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.recentActivity.blogs?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
              <button
                onClick={() => navigate('/admin/management/news')}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Manage News
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Create, edit, and manage news articles and announcements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900">Total News</h4>
                <p className="text-2xl font-bold text-orange-600">{stats?.counts.news || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Recent News</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.recentActivity.news?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => navigate('/admin/management/users')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Manage Users
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, permissions, and system access.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Total Users</h4>
                <p className="text-2xl font-bold text-purple-600">{stats?.counts.users || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Total Admins</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.counts.admins || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Regular Users</h4>
                <p className="text-2xl font-bold text-green-600">
                  {(stats?.counts.users || 0) - (stats?.counts.admins || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 