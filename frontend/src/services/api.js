import axios from 'axios';
import useAuthStore from '../store/authStore';
import { API_URL } from '../config/api.config';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased to 30 seconds
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token is now in HttpOnly cookie, sent automatically
// No need to add Authorization header manually
API.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically with withCredentials: true
    // No need to manually add token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => {
    console.log('API Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.message);
    
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized - logout user
      // BUT: Don't redirect during login attempts (let the login component handle it)
      const isLoginAttempt = error.config?.url?.includes('/login') || 
                             error.config?.url?.includes('/register');
      
      if (error.response.status === 401 && !isLoginAttempt) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data);
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.error('Resource not found:', error.response.data);
      }

      // Handle 500 Server Error
      if (error.response.status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (data) => API.post('/auth/register/volunteer', data),
  login: (data) => API.post('/auth/login', data),
  registerNGO: (data) => API.post('/auth/register/ngo', data),
  registerAdmin: (data) => API.post('/admin/register', data),
  loginNGO: (data) => API.post('/auth/login-ngo', data),
  loginAdmin: (data) => API.post('/admin/login', data),
  logout: () => API.post('/auth/logout'),
};

// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
  getAll: () => API.get('/events/all'),
  getById: (id) => API.get(`/events/${id}`),
  getByLocation: (location, page = 1, limit = 20, status = 'approved') => 
    API.get(`/events/by-location?location=${location}&page=${page}&limit=${limit}&status=${status}`),
  create: (data) => API.post('/events/create', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
  
  // Event actions
  like: (eventId, userId) => API.post('/events/likes', { eventId, userId }),
  unlike: (eventId, userId) => API.post('/events/unlike', { eventId, userId }),
  join: (userId, eventId) => API.post('/join-event', { userId, eventId }),
  unjoin: (userId, eventId) => API.post('/unjoin-event', { userId, eventId }),
  comment: (eventId, userId, text) => API.post('/events/comment', { eventId, userId, text }),
  
  // Event management
  approve: (id) => API.put(`/events/approve/${id}`),
  reject: (id) => API.put(`/events/reject/${id}`),
  getApproved: () => API.get('/events/approved'),
  getRejected: () => API.get('/events/rejected'),
  getPending: () => API.get('/events/pending'),
};

// ============================================
// USER API
// ============================================
export const userAPI = {
  getProfile: (userId) => API.get(`/users/${userId}`),
  updateProfile: (userId, data) => API.put(`/users/${userId}`, data),
  getJoinedEvents: (userId) => API.get(`/users/joined-events?userId=${userId}`),
  joinEvent: (userId, eventId) => API.post('/users/join-event', { userId, eventId }),
  unjoinEvent: (userId, eventId) => API.post('/users/unjoin-event', { userId, eventId }),
  blockUser: (userId) => API.put(`/users/block/${userId}`),
  unblockUser: (userId) => API.put(`/users/unblock/${userId}`),
  getAllVolunteers: () => API.get('/users/users'), // Fixed: correct endpoint
};

// ============================================
// NGO API
// ============================================
export const ngoAPI = {
  getAll: () => API.get('/ngo/ngo-users'), // Fixed: correct endpoint
  getById: (id) => API.get(`/ngo/${id}`),
  update: (id, data) => API.put(`/ngo/${id}`, data),
  block: (id) => API.put(`/ngo/block/${id}`),
  unblock: (id) => API.put(`/ngo/unblock/${id}`),
  getEvents: (ngoId) => API.get(`/ngo/${ngoId}/events`),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  getDashboardStats: () => API.get('/admin/stats'),
  getAllUsers: () => API.get('/admin/users'),
  getAllNGOs: () => API.get('/admin/ngos'),
  getAllEvents: () => API.get('/admin/events'),
};

export default API;
