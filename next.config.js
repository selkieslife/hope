/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  // Ensure these pages are built
  async rewrites() {
    return [
      {
        source: '/menu',
        destination: '/menu',
      },
      {
        source: '/subscribe',
        destination: '/subscribe',
      },
    ]
  },
}

module.exports = nextConfig
