import axios from 'axios';
import useAuthStore from '../store/authStore';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_BASEURL || 'http://localhost:5000'}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - logout user
      if (error.response.status === 401) {
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
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  registerNGO: (data) => API.post('/auth/register-ngo', data),
  registerAdmin: (data) => API.post('/auth/register-admin', data),
  loginNGO: (data) => API.post('/auth/login-ngo', data),
  loginAdmin: (data) => API.post('/auth/login-admin', data),
};

// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
  getAll: () => API.get('/events/all'),
  getById: (id) => API.get(`/events/${id}`),
  getByLocation: (location) => API.get(`/events/by-location?location=${location}`),
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
  getJoinedEvents: (userId) => API.get(`/joined-events?userId=${userId}`),
  blockUser: (userId) => API.put(`/users/block/${userId}`),
  unblockUser: (userId) => API.put(`/users/unblock/${userId}`),
  getAllVolunteers: () => API.get('/users/volunteers'),
};

// ============================================
// NGO API
// ============================================
export const ngoAPI = {
  getAll: () => API.get('/ngos'),
  getById: (id) => API.get(`/ngos/${id}`),
  update: (id, data) => API.put(`/ngos/${id}`, data),
  block: (id) => API.put(`/ngos/block/${id}`),
  unblock: (id) => API.put(`/ngos/unblock/${id}`),
  getEvents: (ngoId) => API.get(`/ngos/${ngoId}/events`),
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
