/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ["@everpath/ui"],
  async rewrites() {
    return [
      {
        source: '/curio-critters/:path*',
        destination: '/curio-critters/:path*',
      },
    ]
  },
}

module.exports = nextConfig