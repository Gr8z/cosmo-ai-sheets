/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProduction ? '/cosmo-ai-sheets' : '',
  assetPrefix: isProduction ? '/cosmo-ai-sheets/' : '',
  reactStrictMode: true,
}

module.exports = nextConfig
