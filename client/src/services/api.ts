import { 
  RepositoryFile, 
  FileResponse, 
  FileUploadRequest, 
  FileUploadResponse,
  FileSearchFilters,
  ApiResponse,
  Blog 
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

// Debug wrapper for fetch
const debugFetch = async (url: string, options: any) => {
  console.log('[DEBUG] Fetching:', url);
  console.log('[DEBUG] Fetch options:', options);
  const response = await fetch(url, options);
  return response;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  console.log('[DEBUG] accessToken from localStorage:', token);
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
  console.log('[DEBUG] Auth headers:', headers);
  return headers;
};

// Repository API Services
export const repositoryApi = {
  // Get all repository files with filtering
  getFiles: async (filters: FileSearchFilters = {}): Promise<FileResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await debugFetch(`${API_BASE_URL}/repository/files?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Get repository file by ID
  getFileById: async (fileId: string): Promise<ApiResponse<RepositoryFile>> => {
    const response = await debugFetch(`${API_BASE_URL}/repository/files/${fileId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Upload repository file
  uploadFile: async (uploadData: FileUploadRequest): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('category', uploadData.category);
    formData.append('department', uploadData.department);
    formData.append('level', uploadData.level);
    formData.append('semester', uploadData.semester);
    
    if (uploadData.courseCode) {
      formData.append('courseCode', uploadData.courseCode);
    }
    if (uploadData.courseTitle) {
      formData.append('courseTitle', uploadData.courseTitle);
    }
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }
    if (uploadData.tags && uploadData.tags.length > 0) {
      formData.append('tags', uploadData.tags.join(','));
    }
    if (uploadData.isPublic !== undefined) {
      formData.append('isPublic', String(uploadData.isPublic));
    }
    if (uploadData.requiresAuth !== undefined) {
      formData.append('requiresAuth', String(uploadData.requiresAuth));
    }
    if (uploadData.allowedRoles && uploadData.allowedRoles.length > 0) {
      formData.append('allowedRoles', JSON.stringify(uploadData.allowedRoles));
    }

    const token = localStorage.getItem('accessToken');
    const response = await debugFetch(`${API_BASE_URL}/repository/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  },

  // Update repository file
  updateFile: async (fileId: string, updateData: Partial<RepositoryFile>): Promise<ApiResponse<RepositoryFile>> => {
    const response = await debugFetch(`${API_BASE_URL}/repository/files/${fileId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  // Delete repository file
  deleteFile: async (fileId: string): Promise<ApiResponse<void>> => {
    const response = await debugFetch(`${API_BASE_URL}/repository/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Download repository file
  downloadFile: async (fileId: string): Promise<Blob> => {
    const token = localStorage.getItem('accessToken');
    const response = await debugFetch(`${API_BASE_URL}/repository/download/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  // Get repository statistics
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await debugFetch(`${API_BASE_URL}/repository/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Search files
  searchFiles: async (query: string, filters: Partial<FileSearchFilters> = {}): Promise<FileResponse> => {
    const params = new URLSearchParams();
    params.append('search', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const response = await debugFetch(`${API_BASE_URL}/repository/search?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Get files by category
  getFilesByCategory: async (category: string, filters: Partial<FileSearchFilters> = {}): Promise<FileResponse> => {
    const params = new URLSearchParams();
    params.append('category', category);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const response = await debugFetch(`${API_BASE_URL}/repository/category/${category}?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Get files by department
  getFilesByDepartment: async (department: string, filters: Partial<FileSearchFilters> = {}): Promise<FileResponse> => {
    const params = new URLSearchParams();
    params.append('department', department);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const response = await debugFetch(`${API_BASE_URL}/repository/department/${department}?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Get multimedia files
  getMultimediaFiles: async (filters: Partial<FileSearchFilters> = {}): Promise<FileResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const response = await debugFetch(`${API_BASE_URL}/repository/multimedia?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Increment download count
  incrementDownloadCount: async (fileId: string): Promise<void> => {
    await debugFetch(`${API_BASE_URL}/repository/files/${fileId}/download`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Increment view count
  incrementViewCount: async (fileId: string): Promise<void> => {
    await debugFetch(`${API_BASE_URL}/repository/files/${fileId}/view`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  }
};

// Legacy file API services (keeping for backward compatibility)
export const fileApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await debugFetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  },

  downloadFile: async (fileId: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await debugFetch(`${API_BASE_URL}/files/download/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  deleteFile: async (fileId: string) => {
    const response = await debugFetch(`${API_BASE_URL}/files/delete/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  getAllFiles: async (page = 1, limit = 10) => {
    const response = await debugFetch(`${API_BASE_URL}/files?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  getFileById: async (fileId: string) => {
    const response = await debugFetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  }
};

// Auth API services
export const authApi = {
  // Verify email with token
  verifyEmail: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await debugFetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      return await handleResponse(response);
    } catch (err) {
      return { success: false, error: 'Could not reach the server. Please try again later.' };
    }
  },

  // Register user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    matricNumber: string;
    department: string;
    password: string;
  }): Promise<{ success?: boolean; error?: string; code?: string; redirectTo?: string }> => {
    try {
      const response = await debugFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (err: any) {
      // Try to extract error code and message from backend
      if (err && err.response) {
        const errorData = await err.response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Could not reach the server. Please try again later.', code: errorData.code };
      }
      return { success: false, error: err?.message || 'Could not reach the server. Please try again later.' };
    }
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ success?: boolean; error?: string; code?: string; accessToken?: string; refreshToken?: string; user?: any }> => {
    try {
      const response = await debugFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      // Store token if login successful
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
      return data;
    } catch (err: any) {
      if (err && err.response) {
        const errorData = await err.response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Could not reach the server. Please try again later.', code: errorData.code };
      }
      return { success: false, error: err?.message || 'Could not reach the server. Please try again later.' };
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const headers = getAuthHeaders();
    console.log('[DEBUG] Calling /auth/me with headers:', headers);
    const response = await debugFetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response);
  },

  // Logout user
  logout: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await debugFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (err) {
      return { success: false, error: 'Could not reach the server. Please try again later.' };
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    const response = await debugFetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return handleResponse(response);
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<ApiResponse<any>> => {
    const response = await debugFetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    return handleResponse(response);
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<{ department: string; level: string; semester: string; phone: string; address: string }>) => {
    const response = await debugFetch(`${API_BASE_URL}/user/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Upload profile photo
  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('accessToken');
    const response = await debugFetch(`${API_BASE_URL}/user/me/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  }
};

// Blog API services
export const blogApi = {
  // Get all blogs
  getBlogs: async (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const response = await debugFetch(`${API_BASE_URL}/blogs?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get blog by ID
  getBlogById: async (blogId: string): Promise<ApiResponse<Blog>> => {
    const response = await debugFetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create new blog
  createBlog: async (blogData: { title: string; content: string }): Promise<ApiResponse<Blog>> => {
    const response = await debugFetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });
    return handleResponse(response);
  },

  // Update blog
  updateBlog: async (blogId: string, blogData: { title: string; content: string }): Promise<ApiResponse<Blog>> => {
    const response = await debugFetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });
    return handleResponse(response);
  },

  // Delete blog
  deleteBlog: async (blogId: string): Promise<ApiResponse<void>> => {
    const response = await debugFetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// Combined API service export
const apiService = {
  repository: repositoryApi,
  auth: authApi,
  blog: blogApi,
  
  // User management (admin only)
  approveUser: async (userId: string) => {
    const response = await debugFetch(`${API_BASE_URL}/user/approve/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return handleResponse(response);
  },

  getAllUsers: async () => {
    const response = await debugFetch(`${API_BASE_URL}/user/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return handleResponse(response);
  },

  // Development function to approve current user (for testing)
  approveCurrentUser: async () => {
    const response = await debugFetch(`${API_BASE_URL}/user/approve-me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return handleResponse(response);
  }
};

export default apiService;