/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Specify which routes should not use Edge Runtime
  serverRuntimeConfig: {
    // Will only be available on the server side
    JWT_SECRET: process.env.JWT_SECRET,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

module.exports = nextConfig 