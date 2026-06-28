/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['fullshine.autos', 'localhost:3000'],
    },
  },
  serverExternalPackages: ['web-push'],
  images: {
    domains: [],
  },
}

module.exports = nextConfig
