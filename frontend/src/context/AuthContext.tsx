import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

interface User {
  userId: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (authService.isAuthenticated()) {
        const result = await authService.verifyToken();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          // Token is invalid, clear it
          await authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      } else {
        setError(result.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.register(userData);
      
      if (result.success) {
        // If registration included a token (auto-login), set the user
        if (result.user && result.token) {
          setUser(result.user);
        }
        // Registration successful
        return true;
      } else {
        setError(result.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.updateProfile(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      } else {
        setError(result.message || 'Profile update failed');
        return false;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError('Profile update failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.changePassword(passwordData);
      
      if (result.success) {
        return true;
      } else {
        setError(result.message || 'Password change failed');
        return false;
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('Password change failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;