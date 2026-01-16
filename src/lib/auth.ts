const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  user: User;
  session: Session;
  isNewUser?: boolean;
}

export interface AuthError {
  error: string;
  code?: string;
}

// Sign up with email
export async function signUp(email: string, password: string, fullName: string): Promise<{ userId: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account');
  }

  return data;
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ message: string; verified: boolean; promoCode?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify email');
  }

  return data;
}

// Resend verification email
export async function resendVerification(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to resend verification email');
  }

  return data;
}

// Sign in with email
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'Invalid email or password') as Error & { code?: string };
    if (data.code) {
      error.code = data.code;
    }
    throw error;
  }

  // Transform user from snake_case to camelCase (session is already camelCase from API)
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.full_name,
      avatarUrl: data.user.avatar_url,
      emailVerified: data.user.email_verified,
    },
    session: data.session,
  };
}

// Forgot password
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to send reset email');
  }

  return data;
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }

  return data;
}

// Refresh token
export async function refreshSession(refreshToken: string): Promise<{ session: Session }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to refresh session');
  }

  return data;
}

// Get current user
export async function getCurrentUser(accessToken: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get user');
  }

  // Transform snake_case to camelCase
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    emailVerified: data.email_verified,
  };
}

// Sign out
export async function signOut(accessToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

// Token storage helpers
const ACCESS_TOKEN_KEY = 'ausplates_access_token';
const REFRESH_TOKEN_KEY = 'ausplates_refresh_token';

/**
 * SECURITY NOTE: Token Storage Strategy
 *
 * Current approach: localStorage + cookies (not httpOnly)
 *
 * Tradeoffs:
 * - localStorage is vulnerable to XSS attacks
 * - Non-httpOnly cookies are also accessible via JavaScript (XSS)
 * - httpOnly cookies would be more secure but require API changes
 *
 * Mitigations applied:
 * 1. Short token expiry (access tokens expire in 1 hour via Supabase)
 * 2. Refresh tokens can be revoked server-side
 * 3. Secure and SameSite cookie flags to prevent CSRF
 * 4. CSP headers should be configured to prevent inline scripts
 * 5. Input sanitization throughout the app
 *
 * Future improvement: Move token storage entirely to httpOnly cookies
 * set by the API server for maximum XSS protection.
 */

// Cookie helpers for middleware access (shared across subdomains)
function getCookieDomain(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  // Use .ausplates.app for production to share across subdomains
  if (hostname.endsWith('ausplates.app')) {
    return '; domain=.ausplates.app';
  }
  // Local development - no domain restriction
  return '';
}

function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

function setCookie(name: string, value: string, days: number = 30) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const domain = getCookieDomain();
  // Use Secure flag in production (HTTPS only)
  // Use SameSite=Strict for better CSRF protection (was Lax)
  const secure = isSecureContext() ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domain}; SameSite=Strict${secure}`;
}

function deleteCookie(name: string) {
  const domain = getCookieDomain();
  const secure = isSecureContext() ? '; Secure' : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domain}; SameSite=Strict${secure}`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Validates JWT format for access tokens.
 * JWTs have 3 base64url-encoded parts separated by dots (header.payload.signature).
 * This validates the structure to prevent XSS payload injection.
 */
function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  // Check each part is valid base64url (alphanumeric, -, _, no spaces)
  // Note: base64url omits padding '=' characters
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => part.length > 0 && base64urlRegex.test(part));
}

/**
 * Validates refresh token format.
 * Supabase refresh tokens are opaque strings (NOT JWTs), typically ~40 characters.
 * They contain only alphanumeric characters and possibly hyphens/underscores.
 * This validates the format to prevent XSS payload injection.
 */
function isValidRefreshTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  // Supabase refresh tokens are alphanumeric strings, typically 20-100 chars
  // Must not contain any special characters that could enable XSS
  const refreshTokenRegex = /^[A-Za-z0-9_-]+$/;
  return token.length >= 10 && token.length <= 200 && refreshTokenRegex.test(token);
}

export function saveTokens(session: Session) {
  if (typeof window !== 'undefined') {
    // Validate token formats before storing to prevent XSS payload injection
    // Access tokens are JWTs (3 parts separated by dots)
    // Refresh tokens are opaque strings (NOT JWTs)
    if (!isValidJwtFormat(session.accessToken)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Invalid access token format detected, not storing');
      }
      return;
    }
    if (!isValidRefreshTokenFormat(session.refreshToken)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Invalid refresh token format detected, not storing');
      }
      return;
    }
    // Store in localStorage for client-side access
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    // Also store in cookies for middleware access (with security flags)
    setCookie(ACCESS_TOKEN_KEY, session.accessToken);
    setCookie(REFRESH_TOKEN_KEY, session.refreshToken);
  }
}

export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  // Try localStorage first, fall back to cookies (for cross-subdomain auth)
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);

  // Validate tokens on retrieval as well (using correct format for each token type)
  return {
    accessToken: accessToken && isValidJwtFormat(accessToken) ? accessToken : null,
    refreshToken: refreshToken && isValidRefreshTokenFormat(refreshToken) ? refreshToken : null,
  };
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Clear admin 2FA session
    localStorage.removeItem('admin_2fa_verified_at');
    // Clear cookies
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  }
}

// Account Linking Types
export interface LinkingStatus {
  hasEmail: boolean;
  hasApple: boolean;
  authProvider: string;
  email: string | null;
  emailVerified: boolean;
}

export interface LinkResponse {
  success: boolean;
  message: string;
}

export interface LinkEmailResponse {
  success: boolean;
  message: string;
  requiresVerification: boolean;
}

// Get account linking status
export async function getLinkingStatus(accessToken: string): Promise<LinkingStatus> {
  const res = await fetch(`${API_BASE_URL}/api/auth/link/status`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get linking status');
  }

  // Transform snake_case to camelCase
  return {
    hasEmail: data.has_email,
    hasApple: data.has_apple,
    authProvider: data.auth_provider,
    email: data.email,
    emailVerified: data.email_verified,
  };
}

// Link Apple ID to account
export async function linkApple(accessToken: string, idToken: string): Promise<LinkResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/link/apple`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to link Apple ID');
  }

  return data;
}

// Link email/password to account
export async function linkEmail(accessToken: string, email: string, password: string): Promise<LinkEmailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/link/email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to link email');
  }

  // Transform snake_case to camelCase
  return {
    success: data.success,
    message: data.message,
    requiresVerification: data.requires_verification,
  };
}

// Delete account
export async function deleteAccount(accessToken: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete account');
  }

  return data;
}

// Change password
export async function changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to change password');
  }

  return data;
}
