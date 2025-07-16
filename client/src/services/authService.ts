const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Types for auth
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  role?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  resetToken?: string;
  qrCode?: string;
  secret?: string;
  otpauthUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth API Service
export const authService = {
  // Register a new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse(response);
    
    // Store token if login successful
    if (data.success && data.token) {
      localStorage.setItem('accessToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    // Clear local storage regardless of response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return handleResponse(response);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return handleResponse(response);
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    return handleResponse(response);
  },

  // 2FA Forgot Password - Step 1: Initiate 2FA password reset
  initiate2FAPasswordReset: async (email: string, phoneNumber: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, phoneNumber }),
    });

    return handleResponse(response);
  },

  // 2FA Forgot Password - Step 2: Verify codes and reset password
  verify2FACodesAndResetPassword: async (
    resetToken: string, 
    emailCode: string, 
    phoneCode: string, 
    newPassword: string
  ): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetToken, emailCode, phoneCode, newPassword }),
    });

    return handleResponse(response);
  },

  // Setup 2FA
  setup2FA: async (): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/setup-2fa`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Verify and enable 2FA
  verifyAndEnable2FA: async (token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    return handleResponse(response);
  },

  // Disable 2FA
  disable2FA: async (token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/disable-2fa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    return handleResponse(response);
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    
    // Update token if refresh successful
    if (data.success && data.token) {
      localStorage.setItem('accessToken', data.token);
    }

    return data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear stored auth data
  clearAuth: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};

export default authService; 