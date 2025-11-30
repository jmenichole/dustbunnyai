/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  output: 'standalone',
}

module.exports = nextConfig
