/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'iphonephotoscourse.vercel.app'],
    },
  },
  // Disable Edge Runtime globally
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken'],
  },
  // Specify routes that should use Node.js runtime
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