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

      const { user, token } = response.data;
      setAuth(user, token);
      
      return { success: true, user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
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

      const { user, token } = response.data;
      setAuth(user, token);
      
      return { success: true, user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  }, [setAuth]);

  // Logout function
  const logout = useCallback(() => {
    logoutStore();
    navigate('/login');
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
