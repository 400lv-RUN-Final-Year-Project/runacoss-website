import { 
  RepositoryFile, 
  Blog, 
  News, 
  User,
  FileResponse, 
  BlogResponse, 
  NewsResponse,
  ApiResponse 
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get admin auth headers
const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Admin Authentication API
export const adminAuthApi = {
  // Admin login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    
    // Store admin token
    if (data.data?.token) {
      localStorage.setItem('adminToken', data.data.token);
    }

    return data;
  },

  // Admin logout
  logout: () => {
    localStorage.removeItem('adminToken');
  },

  // Get admin profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Update admin profile
  updateProfile: async (updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  // Admin registration
  register: async (adminData: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });
    return handleResponse(response);
  },

  // Admin verification
  verify: async ({ email, code }: { email: string; code: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    return handleResponse(response);
  },

  // Admin email verification (link-based)
  verifyEmail: async ({ token }: { token: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  // Admin forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  }
};

// Repository Management API
export const adminRepositoryApi = {
  // Get all repository files
  getAllFiles: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/repository/files?${params}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Approve repository file
  approveFile: async (fileId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/repository/files/${fileId}/approve`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Delete repository file
  deleteFile: async (fileId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/repository/files/${fileId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  }
};

// Blog Management API
export const adminBlogApi = {
  // Get all blogs
  getAllBlogs: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/blogs?${params}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Create blog
  createBlog: async (blogData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(blogData),
    });

    return handleResponse(response);
  },

  // Update blog
  updateBlog: async (blogId: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${blogId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  // Delete blog
  deleteBlog: async (blogId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${blogId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  }
};

// News Management API
export const adminNewsApi = {
  // Get all news
  getAllNews: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/news?${params}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Create news
  createNews: async (newsData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/news`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(newsData),
    });

    return handleResponse(response);
  },

  // Update news
  updateNews: async (newsId: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  // Delete news
  deleteNews: async (newsId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  }
};

// User Management API
export const adminUserApi = {
  // Get all users
  getAllUsers: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Update user
  updateUser: async (userId: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Admin management methods
  getAllAdmins: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/admins?${params}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  createAdmin: async (adminData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(adminData),
    });

    return handleResponse(response);
  },

  updateAdmin: async (adminId: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  deleteAdmin: async (adminId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  },

  toggleAdminStatus: async (adminId: string, isActive: boolean) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/toggle-status`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });

    return handleResponse(response);
  }
};

// Dashboard API
export const adminDashboardApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });

    return handleResponse(response);
  }
};

// Main admin API object
export const adminApi = {
  auth: adminAuthApi,
  repository: adminRepositoryApi,
  blogs: adminBlogApi,
  news: adminNewsApi,
  users: adminUserApi,
  dashboard: adminDashboardApi
};

export default adminApi; 