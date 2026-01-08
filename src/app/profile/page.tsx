'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTokens, getLinkingStatus, linkEmail, LinkingStatus } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';
const APPLE_SERVICES_ID = 'app.ausplates.web';

function getAppleLinkUrl(): string {
  const params = new URLSearchParams({
    client_id: APPLE_SERVICES_ID,
    redirect_uri: `${API_BASE_URL}/api/auth/callback/apple`,
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
    state: 'link', // Indicate this is a linking request
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[var(--green)]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function UnlinkedIcon() {
  return (
    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function AccountLinkingSection() {
  const [status, setStatus] = useState<LinkingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Link email form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    try {
      const data = await getLinkingStatus(accessToken);
      setStatus(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsLinking(true);
    try {
      const response = await linkEmail(accessToken, email, password);
      if (response.success) {
        setSuccess(response.requiresVerification
          ? 'Email linked! Check your inbox to verify.'
          : 'Email linked successfully!');
        setShowEmailForm(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        await loadStatus();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkApple = () => {
    // Store current page to redirect back after linking
    sessionStorage.setItem('link_redirect', '/profile');
    window.location.href = getAppleLinkUrl();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text)]">Account Linking</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Link multiple sign-in methods to access your account different ways
        </p>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckIcon />
            {success}
          </div>
        )}

        {/* Email Status */}
        <div className="flex items-center justify-between p-4 bg-[var(--background-subtle)] rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status?.hasEmail ? 'bg-[var(--green)]/10' : 'bg-gray-100'}`}>
              <EmailIcon className={`w-5 h-5 ${status?.hasEmail ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`} />
            </div>
            <div>
              <div className="font-medium text-[var(--text)]">Email & Password</div>
              {status?.email && (
                <div className="text-sm text-[var(--text-muted)]">{status.email}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status?.hasEmail ? (
              <CheckIcon />
            ) : (
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-sm font-medium text-[var(--green)] hover:underline"
              >
                Add email
              </button>
            )}
          </div>
        </div>

        {/* Link Email Form */}
        {showEmailForm && !status?.hasEmail && (
          <form onSubmit={handleLinkEmail} className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div>
              <label htmlFor="link-email" className="block text-sm font-medium text-[var(--text)] mb-1">
                Email
              </label>
              <input
                type="email"
                id="link-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="link-password" className="block text-sm font-medium text-[var(--text)] mb-1">
                Password
              </label>
              <input
                type="password"
                id="link-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="link-confirm" className="block text-sm font-medium text-[var(--text)] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="link-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLinking}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--green)] text-white font-medium hover:bg-[#006B31] transition-colors disabled:opacity-50"
              >
                {isLinking ? 'Linking...' : 'Link Email'}
              </button>
            </div>
          </form>
        )}

        {/* Apple Status */}
        <div className="flex items-center justify-between p-4 bg-[var(--background-subtle)] rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status?.hasApple ? 'bg-black' : 'bg-gray-100'}`}>
              <AppleIcon className={`w-5 h-5 ${status?.hasApple ? 'text-white' : 'text-[var(--text-muted)]'}`} />
            </div>
            <div>
              <div className="font-medium text-[var(--text)]">Apple ID</div>
              {status?.hasApple && (
                <div className="text-sm text-[var(--text-muted)]">Connected</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status?.hasApple ? (
              <CheckIcon />
            ) : (
              <button
                onClick={handleLinkApple}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
              >
                <AppleIcon className="w-4 h-4" />
                Link Apple
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--green)] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-8">Profile & Settings</h1>

      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-[var(--green)]">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">{user.fullName}</h2>
              <p className="text-[var(--text-muted)]">{user.email}</p>
              {user.emailVerified && (
                <div className="flex items-center gap-1 mt-1 text-sm text-[var(--green)]">
                  <CheckIcon />
                  <span>Email verified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Linking */}
        <AccountLinkingSection />

        {/* Sign Out */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
