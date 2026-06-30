import axios from 'axios';

// In production (Vercel): use the Next.js API proxy route /api/* which forwards to the backend.
// In local dev: use NEXT_PUBLIC_API_URL env var, or fall back to localhost:3001 directly.
const isServer = typeof window === 'undefined';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL   // Explicitly configured backend URL (e.g. separate Vercel backend)
  : isServer
    ? 'http://localhost:3001'          // Server-side rendering in dev: direct backend call
    : '/api';                          // Client-side on Vercel: use Next.js proxy route

export function getTenantFromHostname(): string {
  if (typeof window === 'undefined') return 'demo-school';

  const hostname = window.location.hostname;
  const hostParts = hostname.split('.');

  const isVercelApp = hostname.includes('vercel.app');
  const isEdutrackDomain = hostname.includes('edutrack.com');

  if (isEdutrackDomain) {
    if (hostParts.length > 2 && hostParts[0] !== 'www') {
      return hostParts[0];
    }
  } else if (isVercelApp) {
    if (hostParts.length > 3) {
      return hostParts[0];
    }
  } else {
    // Local development (e.g. school-subdomain.localhost)
    if (hostParts.length > 1 && hostParts[0] !== 'localhost' && hostParts[0] !== 'www' && isNaN(Number(hostParts[0]))) {
      return hostParts[0];
    }
  }

  // Fallback to localStorage
  const stored = localStorage.getItem('tenantId');
  if (stored) return stored;

  return 'demo-school';
}

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'demo-school',
  },
});

// Interceptor to inject JWT Token and correct Tenant ID
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['X-Tenant-ID'] = getTenantFromHostname();
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
        localStorage.removeItem('userPhone');
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
