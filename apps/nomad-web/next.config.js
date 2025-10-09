

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  transpilePackages: ['@nomad-life/ui', '@nomad-life/db'],
}

module.exports = nextConfig

