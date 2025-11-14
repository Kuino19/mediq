/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // enables App Router
  },
  reactStrictMode: true,
  images: {
    // Add any external domains you use for <Image />
    domains: ['example.com'], 
  },
};

module.exports = nextConfig;
