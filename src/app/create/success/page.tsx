'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCheckoutSession } from '@/lib/api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [listingId, setListingId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const checkSession = async () => {
      try {
        const session = await getCheckoutSession(sessionId);
        if (session.status === 'paid') {
          setStatus('success');
          setListingId(session.listingId || null);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    checkSession();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">Something went wrong</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            We couldn&apos;t confirm your payment. If you were charged, please contact support.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/create"
              className="px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[var(--green)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">Your plate is listed!</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          Your listing is now live and visible to buyers across Australia.
        </p>
        <div className="flex flex-col gap-3">
          {listingId && (
            <Link
              href={`/plate/${listingId}`}
              className="px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
            >
              View Your Listing
            </Link>
          )}
          <Link
            href="/profile"
            className="px-6 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
          >
            Go to Profile
          </Link>
          <Link
            href="/"
            className="text-[var(--green)] hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}

export default function CreateSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
