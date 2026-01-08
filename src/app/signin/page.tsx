'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { QRLogin } from '@/components/QRLogin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';
const APPLE_SERVICES_ID = 'app.ausplates.web';

type SignInMethod = 'credentials' | 'qr';

function getAppleSignInUrl(): string {
  const params = new URLSearchParams({
    client_id: APPLE_SERVICES_ID,
    redirect_uri: `${API_BASE_URL}/api/auth/callback/apple`,
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

function AppleSignInButton() {
  const handleAppleSignIn = () => {
    window.location.href = getAppleSignInUrl();
  };

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-900 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
      </svg>
      Sign in with Apple
    </button>
  );
}

function QRLoginButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 bg-white text-[var(--text)] py-3 px-4 rounded-xl font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="3" height="3" />
        <rect x="18" y="14" width="3" height="3" />
        <rect x="14" y="18" width="3" height="3" />
        <rect x="18" y="18" width="3" height="3" />
      </svg>
      Scan with AusPlates app
    </button>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [method, setMethod] = useState<SignInMethod>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResendVerification(false);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push(redirect);
    } catch (err) {
      const error = err as Error & { code?: string };
      setError(error.message);
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        setShowResendVerification(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show QR login view
  if (method === 'qr') {
    return (
      <div className="space-y-6">
        <QRLogin onSuccess={() => router.push(redirect)} />

        {/* Back to credentials */}
        <div className="text-center">
          <button
            onClick={() => setMethod('credentials')}
            className="text-[var(--text-secondary)] hover:text-[var(--text)] text-sm"
          >
            &larr; Back to other sign in options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Apple Sign In */}
      <AppleSignInButton />

      {/* QR Login Button */}
      <QRLoginButton onClick={() => setMethod('qr')} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-[var(--text-muted)]">or continue with email</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
            {showResendVerification && (
              <Link
                href={`/resend-verification?email=${encodeURIComponent(email)}`}
                className="block mt-2 text-[var(--green)] hover:underline"
              >
                Resend verification email
              </Link>
            )}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text)]">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm text-[var(--green)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--green)] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#006B31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)]">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mt-2">Sign in to your AusPlates account</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
          <SignInForm />
        </Suspense>

        <p className="text-center text-[var(--text-secondary)] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--green)] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
