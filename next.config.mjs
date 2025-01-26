/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'iphonephotoscourse.vercel.app'],
    },
  },
  serverComponents: {
    externalPackages: ['bcryptjs', 'jsonwebtoken'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'x-middleware-prefetch',
            value: 'disable',
          },
        ],
      },
    ];
  },
}

export default nextConfig 