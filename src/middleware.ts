import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromCookies } from './lib/authCookie';

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/dashboard': null, // Any authenticated user
  '/analytics': null, // Any authenticated user
  '/products': null, // Any authenticated user
  '/orders': null, // Any authenticated user
  '/customers': null, // Any authenticated user
  '/settings': null, // Any authenticated user
  // Finance routes
  '/transactions': null,
  '/invoices': null,
  '/billing': null,
  // Support routes
  '/chat': null,
  '/supportTickets': null,
  '/faq': null,
  '/help': null,
  '/profile': null,
  '/messages': null,
  '/wishlist': null,
  '/nfts': null,
  // Admin routes
  '/admin': 'admin', // Only admin users
  //there's still no admin routes but this can be used to add them later
};

// Define public routes that don't need authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/unauthorized'];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Get session data from cookies
    const cookieHeader = request.headers.get('cookie') || undefined;
    const { token, role } = getSessionFromCookies(cookieHeader);

    // Check if the current path is a protected route
    const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the current path is a public route
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // If trying to access a protected route without a valid session
    if (isProtectedRoute && (!token || !role)) {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url, { status: 307 });
    }

    // If authenticated and trying to access auth routes, redirect to dashboard
    if (token && role && isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url), { status: 307 });
    }

    return NextResponse.next();
  } catch (error) {
    // If any error occurs, redirect to unauthorized to be safe
    console.error('Middleware error:', error);
    const url = new URL('/unauthorized', request.url);
    return NextResponse.redirect(url, { status: 307 });
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 