import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEFAULT_TENANT = 'demo-school';

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': DEFAULT_TENANT,
  },
});

// Interceptor to inject JWT Token from local storage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        // Prevent redirect loop if already on login, otp, or onboarding pages
        const path = window.location.pathname;
        if (!path.includes('/auth/login') && !path.includes('/auth/otp') && !path.includes('/register-school')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
