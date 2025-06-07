import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from './lib/authCookie';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { auth_token, user_role } = getSessionFromCookies(request);

  console.log(`[Middleware] Path: ${pathname}, auth_token: ${auth_token}, user_role: ${user_role}`);

  // Protect /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!auth_token) {
      return NextResponse.redirect(new URL('/auth/login', request.url), 307);
    }
  }

  // Protect /admin
  if (pathname.startsWith('/admin')) {
    if (!auth_token) {
      return NextResponse.redirect(new URL('/auth/login', request.url), 307);
    }
    if (user_role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url), 307);
    }
  }

  // Redirect authenticated users from /auth/login
  if (pathname === '/auth/login' && auth_token) {
    return NextResponse.redirect(new URL('/dashboard', request.url), 307);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/login', '/unauthorized'],
};