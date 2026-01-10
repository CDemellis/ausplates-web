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
export async function verifyEmail(token: string): Promise<{ message: string; verified: boolean }> {
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

  // Transform snake_case to camelCase
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.full_name,
      avatarUrl: data.user.avatar_url,
      emailVerified: data.user.email_verified,
    },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
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

// Cookie helpers for middleware access
function setCookie(name: string, value: string, days: number = 30) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function saveTokens(session: Session) {
  if (typeof window !== 'undefined') {
    // Store in localStorage for client-side access
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    // Also store in cookies for middleware access
    setCookie(ACCESS_TOKEN_KEY, session.accessToken);
    setCookie(REFRESH_TOKEN_KEY, session.refreshToken);
  }
}

export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
