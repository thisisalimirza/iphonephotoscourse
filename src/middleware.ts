import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Add any paths that should be accessible without authentication
const publicPaths = [
  '/',
  '/login',
  '/auth/verify',
  '/api/auth/login',
  '/api/auth/magic-link',
  '/api/auth/verify',
];

// Add paths that require admin role
const adminPaths = [
  '/admin',
  '/api/modules',
  '/api/lessons',
];

// Force Node.js runtime for all API routes
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For admin paths, verify admin role
  if (adminPaths.some(path => pathname.startsWith(path))) {
    try {
      const user = await verifyToken(token);
      if (!user || user.role !== 'ADMIN') {
        // For API routes, return 401 instead of redirecting
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // Token verification failed
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 