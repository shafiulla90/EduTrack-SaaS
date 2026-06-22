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

// Interceptor to handle 401 and auto-authenticate in dev mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Auto login with seed credentials
        const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
          email: 'admin@demoschool.com',
          password: 'Password@123',
        });
        const token = loginRes.data.access_token || loginRes.data.accessToken;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (loginError) {
        console.error('Auto login failed:', loginError);
      }
    }
    return Promise.reject(error);
  }
);
