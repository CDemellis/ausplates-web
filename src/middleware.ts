import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/saved',
  '/messages',
  '/profile',
  '/create',
  '/my-listings',
  '/notifications',
];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = [
  '/signin',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has access token (stored in cookie or localStorage)
  // Note: We check for the cookie since localStorage isn't available in middleware
  const accessToken = request.cookies.get('ausplates_access_token')?.value;

  // For protected routes, redirect to signin if not authenticated
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !accessToken) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // For auth routes, redirect to home if already authenticated
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match protected routes
    '/saved/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/create/:path*',
    '/my-listings/:path*',
    '/notifications/:path*',
    // Match auth routes
    '/signin',
    '/signup',
  ],
};
