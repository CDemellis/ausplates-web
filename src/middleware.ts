import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

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

// Supabase project reference for JWKS URL
// Try env var first, fall back to hardcoded value (public info, used for JWKS verification)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://djestcmobrmoryhivduy.supabase.co';
const SUPABASE_PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const JWKS_URL = SUPABASE_PROJECT_REF
  ? new URL(`https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json`)
  : null;

// Create JWKS keyset for ES256 verification (cached by jose library)
const JWKS = JWKS_URL ? createRemoteJWKSet(JWKS_URL) : null;

// Debug logging (remove after fixing)
console.log('[Middleware Init] SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('[Middleware Init] JWKS_URL:', JWKS_URL?.toString() || 'NOT SET');

// Get the JWT secret for HS256 verification (legacy fallback)
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Verify JWT signature and decode payload.
 * Supports both ES256 (asymmetric, via JWKS) and HS256 (symmetric, via secret).
 * Returns null if verification fails or token is invalid.
 */
async function verifyJwtAndGetPayload(token: string): Promise<{ email?: string; sub?: string } | null> {
  try {
    // Decode header to check algorithm
    const headerPart = token.split('.')[0];
    const header = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')));

    console.log('[JWT Verify] Algorithm:', header.alg, 'JWKS available:', !!JWKS, 'JWT_SECRET available:', !!JWT_SECRET);

    if (header.alg === 'ES256' && JWKS) {
      // ES256: Verify using Supabase's public JWKS
      console.log('[JWT Verify] Attempting ES256 verification via JWKS...');
      const { payload } = await jwtVerify(token, JWKS, {
        algorithms: ['ES256'],
      });
      console.log('[JWT Verify] ES256 verification SUCCESS, email:', payload.email);
      return payload as { email?: string; sub?: string };
    } else if (header.alg === 'HS256' && JWT_SECRET) {
      // HS256: Verify using shared secret (legacy)
      console.log('[JWT Verify] Attempting HS256 verification via secret...');
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      });
      console.log('[JWT Verify] HS256 verification SUCCESS, email:', payload.email);
      return payload as { email?: string; sub?: string };
    } else {
      console.error(`[JWT Verify] FAILED: unsupported algorithm ${header.alg} or missing config (JWKS: ${!!JWKS}, SECRET: ${!!JWT_SECRET})`);
      return null;
    }
  } catch (error) {
    // JWT verification failed (invalid signature, expired, etc.)
    console.error('[JWT Verify] ERROR:', error);
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

    // Get access token from cookie (URL-encoded by auth.ts)
    const rawToken = request.cookies.get('ausplates_access_token')?.value;
    const accessToken = rawToken ? decodeURIComponent(rawToken) : undefined;

    // No token = not authenticated, redirect to signin
    // This allows admins to log in via the main signin page
    // SECURITY: Only unauthenticated users see the redirect; authenticated non-admins get 404
    if (!accessToken) {
      // Build redirect URL to main signin with return to admin subdomain
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = pathname === '/' ? '/' : pathname;
      const redirectTarget = `https://admin.ausplates.app${adminUrl.pathname}${adminUrl.search}`;
      const signinUrl = new URL('https://ausplates.app/signin');
      signinUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(signinUrl);
    }

    // SECURITY: Verify JWT signature before trusting claims
    // This prevents attackers from forging JWTs with admin emails
    const payload = await verifyJwtAndGetPayload(accessToken);
    if (!payload?.email || !ADMIN_EMAILS.includes(payload.email)) {
      // JWT invalid/forged or not an admin - return 404 (don't reveal admin panel exists)
      // SECURITY: Authenticated non-admins see 404, not a login redirect
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

  // For protected routes, redirect to signin if not authenticated
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if user has access token (stored in cookie or localStorage)
  // Cookie value is URL-encoded by auth.ts, so we need to decode it
  const rawToken = request.cookies.get('ausplates_access_token')?.value;
  const accessToken = rawToken ? decodeURIComponent(rawToken) : undefined;

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
