/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'edutrack-saas-media.s3.amazonaws.com'],
  },
};

export default nextConfig;
