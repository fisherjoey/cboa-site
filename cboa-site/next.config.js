/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'export' for Netlify deployment
  // output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig