/**
 * API Configuration
 * Centralized API base URL configuration
 */

export const API_BASE_URL = process.env.REACT_APP_BACKEND_BASEURL || 'http://localhost:5001';
export const API_VERSION = 'v1';
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

export default {
  BASE_URL: API_BASE_URL,
  VERSION: API_VERSION,
  URL: API_URL,
};
