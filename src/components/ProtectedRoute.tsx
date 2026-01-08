'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that redirects unauthenticated users to sign in.
 * Shows a loading state while checking authentication.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Component to show when a page requires authentication.
 * Used for pages that show a sign-in prompt instead of redirecting.
 */
export function AuthRequired({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <SignInPrompt />;
  }

  return <>{children}</>;
}

/**
 * Sign-in prompt shown to unauthenticated users
 */
export function SignInPrompt({
  title = "Sign in to continue",
  message = "Create an account or sign in to access this content."
}: {
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--background-subtle)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">{title}</h2>
        <p className="text-[var(--text-secondary)] mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push(`/signin?redirect=${encodeURIComponent(pathname)}`)}
            className="bg-[var(--green)] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#006B31] transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push(`/signup?redirect=${encodeURIComponent(pathname)}`)}
            className="bg-white text-[var(--text)] py-3 px-6 rounded-xl font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
