import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, role, isAuthenticated, setAuth, logout: logoutStore, hasRole } = useAuthStore();

  // Login function
  const login = useCallback(async (credentials, userType = 'volunteer') => {
    try {
      let response;
      
      switch (userType) {
        case 'ngo':
          response = await authAPI.loginNGO(credentials);
          break;
        case 'admin':
          response = await authAPI.loginAdmin(credentials);
          break;
        default:
          response = await authAPI.login(credentials);
      }

      // Backend returns: { success, message, data: { user } }
      // Token is now in HttpOnly cookie, not in response!
      console.log('Login response full:', response);
      console.log('Login response.data:', response.data);
      console.log('Login response.data.data:', response.data.data);
      
      // Extract user from response
      const responseData = response.data.data || response.data;
      console.log('responseData:', responseData);
      
      const user = responseData.user;
      console.log('Extracted user:', user);
      
      if (!user) {
        console.error('No user in response. Full response:', response.data);
        console.error('responseData:', responseData);
        throw new Error('Invalid response structure');
      }
      
      // Store user data only (no token needed - it's in cookie)
      setAuth(user, null);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  }, [setAuth]);

  // Register function
  const register = useCallback(async (userData, userType = 'volunteer') => {
    try {
      let response;
      
      switch (userType) {
        case 'ngo':
          response = await authAPI.registerNGO(userData);
          break;
        case 'admin':
          response = await authAPI.registerAdmin(userData);
          break;
        default:
          response = await authAPI.register(userData);
      }

      // Backend returns: { success, message, data: { user, token } }
      // Axios wraps it in response.data
      const { user, token } = response.data.data || response.data;
      
      if (!user || !token) {
        throw new Error('Invalid response structure');
      }
      
      setAuth(user, token);
      
      return { success: true, user, token };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  }, [setAuth]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call backend to clear HttpOnly cookies
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless
      logoutStore();
      navigate('/login');
    }
  }, [logoutStore, navigate]);

  // Check authentication
  const checkAuth = useCallback(() => {
    return isAuthenticated && token && user;
  }, [isAuthenticated, token, user]);

  return {
    user,
    token,
    role,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    hasRole,
  };
};

export default useAuth;
