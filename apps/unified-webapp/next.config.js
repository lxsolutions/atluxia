/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  transpilePackages: [
    '@atluxia/ui',
    '@atluxia/auth',
    '@atluxia/db',
    '@atluxia/core',
    '@atluxia/contracts'
  ],
  async rewrites() {
    return [
      // Proxy API requests to respective services
      {
        source: '/api/nomad/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/api/polyverse/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/api/everpath/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
      {
        source: '/api/critters/:path*',
        destination: 'http://localhost:56456/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;