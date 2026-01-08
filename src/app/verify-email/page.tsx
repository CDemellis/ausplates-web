'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { verifyEmail, resendVerification } from '@/lib/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const sent = searchParams.get('sent') === 'true';

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle'
  );
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (verifyToken: string) => {
    try {
      await verifyEmail(verifyToken);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  };

  const handleResend = async () => {
    if (!email || resendStatus === 'sending') return;

    setResendStatus('sending');
    try {
      await resendVerification(email);
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

  // Show "check your email" page after signup
  if (!token && (sent || email)) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-[var(--green)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Check your email</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          We&apos;ve sent a verification link to{' '}
          <span className="font-medium text-[var(--text)]">{email}</span>
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Click the link in the email to verify your account. The link expires in 24 hours.
        </p>

        {email && (
          <button
            onClick={handleResend}
            disabled={resendStatus !== 'idle'}
            className="text-[var(--green)] hover:underline text-sm disabled:opacity-50"
          >
            {resendStatus === 'sending' && 'Sending...'}
            {resendStatus === 'sent' && 'Email sent!'}
            {resendStatus === 'idle' && "Didn't receive the email? Resend"}
          </button>
        )}
      </div>
    );
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[var(--text)]">Verifying your email...</h1>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Email verified!</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Your account is now active. You can sign in to start browsing.
        </p>
        <Link
          href="/signin"
          className="inline-block bg-[var(--green)] text-white py-3 px-8 rounded-xl font-medium hover:bg-[#006B31] transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Verification failed</h1>
        <p className="text-[var(--text-secondary)] mb-6">{error}</p>
        <Link
          href="/signup"
          className="inline-block bg-[var(--green)] text-white py-3 px-8 rounded-xl font-medium hover:bg-[#006B31] transition-colors"
        >
          Try again
        </Link>
      </div>
    );
  }

  // Default - no token, no email
  return (
    <div className="w-full max-w-md text-center">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Verify your email</h1>
      <p className="text-[var(--text-secondary)] mb-6">
        Please check your email for a verification link.
      </p>
      <Link
        href="/signin"
        className="inline-block bg-[var(--green)] text-white py-3 px-8 rounded-xl font-medium hover:bg-[#006B31] transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[var(--text)]">Loading...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
