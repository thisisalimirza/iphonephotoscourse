import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Force all API routes to use Node.js runtime
export const runtime = 'nodejs';

// Middleware to ensure proper CORS and content type
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: '/api/:path*',
} 