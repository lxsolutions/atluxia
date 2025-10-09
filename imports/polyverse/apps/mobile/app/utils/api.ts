import axios from 'axios';

// API configuration
const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // This would typically come from SecureStore
    const token = 'mock-jwt-token'; // Replace with actual token retrieval
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // This would typically trigger logout
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  shorts: {
    list: '/shorts',
    upload: '/shorts/upload',
    like: (id: string) => `/shorts/${id}/like`,
  },
  truth: {
    claims: '/truth/claims',
    claim: (id: string) => `/truth/claims/${id}`,
    evidence: (id: string) => `/truth/claims/${id}/evidence`,
  },
  algorithms: {
    list: '/algorithms',
    set: '/algorithms/set',
  },
};