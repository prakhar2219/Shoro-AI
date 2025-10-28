import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout to prevent hanging requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Only add auth token for API calls (not for external URLs)
    if (config.url?.startsWith('/') || config.url?.includes('localhost:8000')) {
      try {
        // Get Clerk token using the proper method
        if (typeof window !== 'undefined' && window.Clerk) {
          const token = await window.Clerk.session?.getToken();
          console.log('Auth token obtained:', token ? 'Yes' : 'No');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header set for request to:', config.url);
          } else {
            console.warn('No auth token available for request to:', config.url);
          }
        } else {
          console.warn('Clerk not available for request to:', config.url);
        }
      } catch (error) {
        console.warn('Could not get auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please sign in again.');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);