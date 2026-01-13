import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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

// Admin emails that are allowed to access the admin panel
// This must match the list in src/app/ap-admin/layout.tsx
const ADMIN_EMAILS = ['hello@ausplates.app'];

// Get the JWT secret for verification
// Must be set to the Supabase JWT secret in production
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Verify JWT signature and decode payload.
 * Returns null if verification fails or token is invalid.
 */
async function verifyJwtAndGetPayload(token: string): Promise<{ email?: string; sub?: string } | null> {
  // If no secret configured, fail closed (deny access)
  if (!JWT_SECRET) {
    console.error('SUPABASE_JWT_SECRET not configured - JWT verification disabled');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return payload as { email?: string; sub?: string };
  } catch (error) {
    // JWT verification failed (invalid signature, expired, etc.)
    return null;
  }
}

/**
 * Decode JWT payload WITHOUT verification.
 * ONLY use this for non-security-critical checks (e.g., redirect optimization).
 * For security decisions, use verifyJwtAndGetPayload instead.
 */
function decodeJwtPayloadUnsafe(token: string): { email?: string; sub?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url decode
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Check if this is the admin subdomain
  const isAdminSubdomain = hostname.startsWith('admin.') || hostname === 'admin.localhost:3000';

  // Admin subdomain: verify admin access server-side with proper JWT verification
  if (isAdminSubdomain) {
    // Don't verify for Next.js internal routes
    if (pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Get access token from cookie
    const accessToken = request.cookies.get('ausplates_access_token')?.value;

    // No token = not authenticated, return 404
    if (!accessToken) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // SECURITY: Verify JWT signature before trusting claims
    // This prevents attackers from forging JWTs with admin emails
    const payload = await verifyJwtAndGetPayload(accessToken);
    if (!payload?.email || !ADMIN_EMAILS.includes(payload.email)) {
      // JWT invalid/forged or not an admin - return 404 (don't reveal admin panel exists)
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // Admin verified with valid JWT signature - rewrite to admin routes if needed
    if (!pathname.startsWith('/ap-admin')) {
      const url = request.nextUrl.clone();
      url.pathname = `/ap-admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
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
