import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin, AdminAuthResponse } from '../services/types';
import { adminApi } from '../services/adminApi';

interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  hasPermission: (module: string, action: string) => boolean;
  token: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

// Utility to clear admin auth data
const clearAdminAuth = () => {
  localStorage.removeItem('adminToken');
};

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if admin is already logged in on app start
  useEffect(() => {
    const checkAdminAuthStatus = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const response = await adminApi.auth.getProfile();
          if (response.success && response.data) {
            setAdmin(response.data);
          } else {
            // Invalid token, remove it
            clearAdminAuth();
            setAdmin(null);
          }
        } else {
          clearAdminAuth();
          setAdmin(null);
        }
      } catch (err) {
        // Admin is not authenticated, which is fine
        console.log('No authenticated admin found');
        clearAdminAuth();
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: AdminAuthResponse = await adminApi.auth.login(email, password);
      
      if (response.success && response.data) {
        setAdmin(response.data.admin);
        // Token is already stored in the API service
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Admin login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      adminApi.auth.logout();
      clearAdminAuth();
      setAdmin(null);
    } catch (err) {
      console.error('Admin logout error:', err);
      // Still clear admin even if logout request fails
      clearAdminAuth();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!admin) return false;
    
    // Super admin has all permissions
    if (admin.role === 'super-admin') return true;
    
    const modulePermissions = admin.permissions[module as keyof typeof admin.permissions];
    if (!modulePermissions) return false;
    
    return modulePermissions[action as keyof typeof modulePermissions] === true;
  };

  const value: AdminContextType = {
    admin,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!admin,
    hasPermission,
    token: localStorage.getItem('adminToken'),
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 