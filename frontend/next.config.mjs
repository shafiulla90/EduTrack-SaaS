/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'edutrack-saas-media.s3.amazonaws.com'],
  },
  // Pass backend URL as server-only env var (not exposed to browser)
  // Set BACKEND_INTERNAL_URL in your Vercel environment variables
  env: {
    BACKEND_INTERNAL_URL: process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
