'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveTokens, getCurrentUser, Session, User } from '@/lib/auth';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserFromSignIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error from API
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        return;
      }

      // Extract tokens from URL
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const expiresAt = searchParams.get('expiresAt');
      const isNewUser = searchParams.get('isNewUser') === 'true';

      if (!accessToken || !refreshToken || !expiresAt) {
        setError('Missing authentication data');
        return;
      }

      try {
        // Create session object
        const session: Session = {
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt, 10),
        };

        // Save tokens
        saveTokens(session);

        // Fetch user profile
        const user = await getCurrentUser(accessToken);

        // Update auth context
        setUserFromSignIn(user, session);

        // Redirect to home or welcome page
        if (isNewUser) {
          router.push('/?welcome=true');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to complete sign in');
      }
    };

    handleCallback();
  }, [searchParams, router, setUserFromSignIn]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Sign In Failed</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="bg-[var(--green)] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#006B31] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-secondary)]">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
