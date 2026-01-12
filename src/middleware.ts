import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (main site)
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
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Check if this is the admin subdomain
  const isAdminSubdomain = hostname.startsWith('admin.') || hostname === 'admin.localhost:3000';

  // Admin subdomain: rewrite all requests to /ap-admin prefix
  if (isAdminSubdomain) {
    // Don't rewrite if already has the prefix or is a Next.js internal route
    if (pathname.startsWith('/ap-admin') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Rewrite to admin routes
    const url = request.nextUrl.clone();
    url.pathname = `/ap-admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Main domain: block access to admin routes
  if (pathname.startsWith('/ap-admin')) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // Check if user has access token (stored in cookie or localStorage)
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
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
