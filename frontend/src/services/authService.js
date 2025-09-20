import apiClient, { tokenManager } from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

// Authentication service
class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: credentials.username || credentials.email,
        password: credentials.password,
      });

      if (response.success && response.token) {
        tokenManager.setToken(response.token);
        return {
          success: true,
          user: response.user,
          token: response.token,
        };
      }

      return {
        success: false,
        message: response.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'operator',
      });

      // Check if registration was successful
      if (response.success) {
        // If token is provided, store it (auto-login)
        if (response.token) {
          tokenManager.setToken(response.token);
          return {
            success: true,
            user: response.user,
            token: response.token,
          };
        }
        
        // Registration successful but no auto-login
        return {
          success: true,
          user: response.user,
          message: response.message || 'Account created successfully',
        };
      }

      return {
        success: false,
        message: response.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if token exists
      if (tokenManager.getToken()) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear token locally
      tokenManager.removeToken();
      return { success: true };
    }
  }

  // Verify token and get user info
  async verifyToken() {
    try {
      if (!tokenManager.getToken() || !tokenManager.isTokenValid()) {
        return { success: false, message: 'No valid token' };
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
      
      if (response.success && response.user) {
        return {
          success: true,
          user: response.user,
        };
      }

      return { success: false, message: 'Token verification failed' };
    } catch (error) {
      console.error('Token verification error:', error);
      tokenManager.removeToken();
      return { success: false, message: error.message };
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      
      if (response.success && response.user) {
        return {
          success: true,
          user: response.user,
        };
      }

      return { success: false, message: 'Failed to get profile' };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: error.message };
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, userData);
      
      if (response.success) {
        return {
          success: true,
          user: response.user,
          message: response.message || 'Profile updated successfully',
        };
      }

      return { success: false, message: response.message || 'Profile update failed' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      return {
        success: response.success,
        message: response.message || (response.success ? 'Password changed successfully' : 'Failed to change password'),
      };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error.message };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'Reset email sent' : 'Failed to send reset email'),
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: error.message };
    }
  }

  // Reset password
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token: resetData.token,
        password: resetData.password,
      });

      return {
        success: response.success,
        message: response.message || (response.success ? 'Password reset successfully' : 'Failed to reset password'),
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: error.message };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return tokenManager.getToken() && tokenManager.isTokenValid();
  }

  // Get current user from token
  getCurrentUser() {
    const token = tokenManager.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Check user role
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      admin: 4,
      manager: 3,
      supervisor: 2,
      operator: 1,
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;