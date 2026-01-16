'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { verifyEmail, resendVerification } from '@/lib/auth';
import { assignCodeToUser, isPoolExhausted } from '@/lib/promo-pool';

// Store the last assigned code for display on create page
const LAST_CODE_KEY = 'ausplates_welcome_code';

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
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      const doVerify = async () => {
        try {
          await verifyEmail(token);
          setStatus('success');

          // Assign a promo code to this verified user
          // Use token hash as unique identifier for this verification
          const verificationId = `verified_${token.substring(0, 16)}_${Date.now()}`;
          const code = assignCodeToUser(verificationId);
          if (code) {
            setPromoCode(code);
            // Store for display on create page
            try {
              localStorage.setItem(LAST_CODE_KEY, code);
            } catch {
              // localStorage may be unavailable
            }
          }
        } catch (err) {
          setStatus('error');
          setError((err as Error).message);
        }
      };
      doVerify();
    }
  }, [token]);

  const handleCopyCode = async () => {
    if (!promoCode) return;
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = promoCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  // Success state with promo code
  if (status === 'success') {
    return (
      <div className="w-full max-w-md text-center">
        {/* Celebratory header */}
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Welcome to AusPlates!</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Your email has been verified and your account is now active.
        </p>

        {/* Promo code section */}
        {promoCode ? (
          <div className="bg-gradient-to-br from-[var(--green)]/5 to-[var(--gold)]/10 border-2 border-[var(--green)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">🎁</span>
              <span className="text-lg font-semibold text-[var(--green)]">Your Free Listing Code</span>
            </div>
            <div className="bg-white rounded-xl p-4 mb-4 border border-[var(--border)]">
              <code className="text-2xl font-bold tracking-wider text-[var(--text)]">
                {promoCode}
              </code>
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text)] hover:border-[var(--green)] transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Use this code when creating your first listing to list for free!
            </p>
          </div>
        ) : !isPoolExhausted() ? (
          <div className="bg-[var(--background-subtle)] rounded-xl p-4 mb-6">
            <p className="text-[var(--text-secondary)]">
              Sign in to get started with your account.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--background-subtle)] rounded-xl p-4 mb-6">
            <p className="text-[var(--text-secondary)]">
              Your account is ready! Sign in to start browsing and listing.
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Link
          href="/signup"
          className="inline-block w-full bg-[var(--green)] text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-[#006B31] transition-colors mb-3"
        >
          {promoCode ? 'Claim Your Free Listing' : 'Sign Up'}
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
