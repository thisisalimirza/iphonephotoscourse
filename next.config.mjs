/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure server-side settings
  experimental: {
    // External packages that should be treated as server-only
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Headers to disable Edge Runtime where needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'x-middleware-prefetch',
            value: 'disable'
          }
        ]
      }
    ];
  },

  // Environment variables that should be available at build time
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
    MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
  },
};

export default nextConfig; 