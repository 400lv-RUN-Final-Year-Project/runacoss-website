import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../services/types';
import apiService from '../services/api';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { firstName: string; lastName: string; email: string; matricNumber: string; department: string; password: string }) => Promise<any>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const hasToken = !!localStorage.getItem('accessToken');
        if (!hasToken) {
          authService.clearAuth(); // Ensure all auth data is cleared if no token
          setUser(null);
          setLoading(false);
          return;
        }
        const response = await apiService.auth.getCurrentUser();
        console.log('[DEBUG] /api/auth/me raw JSON response:', JSON.stringify(response, null, 2));
        console.log('[DEBUG] /api/auth/me response:', response);
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          authService.clearAuth(); // Clear any stale data if token is invalid
          setUser(null);
        }
        setLoading(false);
      } catch (err) {
        authService.clearAuth(); // Clear any stale data on error
        setUser(null);
        console.log('No authenticated user found');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      // Call login API, which should store JWT in localStorage
      const response = await apiService.auth.login({ email, password });
      // If login failed, throw the backend error message and code
      if (!response.success) {
        setError(response.error ?? null);
        throw response;
      }
      // Set user context immediately from login response if available
      if (response.user) {
        setUser(response.user);
      }
      // Optionally, fetch user data again for extra safety
      const userResponse = await apiService.auth.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'error' in err) {
        setError((err as any).error);
        throw err;
      }
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiService.auth.logout();
      authService.clearAuth(); // Always clear all auth data on logout
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user even if logout request fails
      authService.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { firstName: string; lastName: string; email: string; matricNumber: string; department: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.auth.register(userData);
      // If registration failed, throw error with code
      if (response && response.error) {
        setError(response.error);
        throw response;
      }
      return response;
    } catch (err) {
      if (err && typeof err === 'object' && 'error' in err) {
        setError((err as any).error);
        throw err;
      }
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    setUser,
    login,
    logout,
    register,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 