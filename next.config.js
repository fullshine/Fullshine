/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['fullshine.autos', 'localhost:3000'],
      // Por defecto son 1 MB, insuficiente para un CV en PDF con fotos.
      bodySizeLimit: '5mb',
    },
    serverComponentsExternalPackages: ['web-push'],
  },
  // En Next 14 esta opción vive dentro de `experimental`.
  // Como `serverExternalPackages` no existe en esta versión, el build avisaba
  // "Unrecognized key" y web-push quedaba sin excluir del bundle.
  images: {
    domains: [],
  },
}

module.exports = nextConfig
