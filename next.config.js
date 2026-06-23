/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['fullshine.autos', 'localhost:3000'],
    },
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig
