/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['fullshine.autos', 'localhost:3000'],
      // Por defecto son 1 MB, insuficiente para un CV en PDF con fotos.
      bodySizeLimit: '5mb',
    },
  },
  serverExternalPackages: ['web-push'],
  images: {
    domains: [],
  },
}

module.exports = nextConfig
