'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type BoostType = 'none' | '7day' | '30day';

interface TierConfig {
  title: string;
  subtitle: string;
  features: string[];
  iconBg: string;
  iconColor: string;
  showStar: boolean;
  showDoubleStar: boolean;
}

const TIER_CONFIG: Record<BoostType, TierConfig> = {
  none: {
    title: 'Your plate is listed!',
    subtitle: 'Your listing is now live and visible to buyers across Australia.',
    features: [],
    iconBg: 'bg-[var(--green)]/10',
    iconColor: 'text-[var(--green)]',
    showStar: false,
    showDoubleStar: false,
  },
  '7day': {
    title: 'Your boosted plate is live!',
    subtitle: 'Your listing is featured and getting priority placement.',
    features: [
      'Featured badge active for 7 days',
      'Priority placement in search results',
      'Highlighted on the homepage',
    ],
    iconBg: 'bg-[var(--green)]/10',
    iconColor: 'text-[var(--green)]',
    showStar: true,
    showDoubleStar: false,
  },
  '30day': {
    title: 'Your Boost Pro listing is live!',
    subtitle: 'Maximum exposure for 30 days with premium features.',
    features: [
      'Featured badge active for 30 days',
      'Priority placement in search results',
      'Highlighted on the homepage',
      '2 bumps available to refresh your listing',
      'Buyers notified if you drop the price',
    ],
    iconBg: 'bg-gradient-to-br from-[var(--gold)]/20 to-amber-100',
    iconColor: 'text-[var(--gold)]',
    showStar: false,
    showDoubleStar: true,
  },
};

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();

  // Payment complete flow from embedded checkout
  const paymentComplete = searchParams.get('payment') === 'complete';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tier, setTier] = useState<BoostType>('none');

  useEffect(() => {
    if (!paymentComplete) {
      setStatus('error');
      return;
    }

    // Read tier from draft before clearing
    try {
      const saved = localStorage.getItem('ausplates_listing_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.boostType && ['none', '7day', '30day'].includes(draft.boostType)) {
          setTier(draft.boostType);
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Clear the draft
    localStorage.removeItem('ausplates_listing_draft');

    // Small delay to ensure webhook has processed
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);

    return () => clearTimeout(timer);
  }, [paymentComplete]);

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

  const config = TIER_CONFIG[tier];

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
          <svg className={`w-8 h-8 ${config.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {config.showStar && (
            <Star className="w-5 h-5 text-[var(--gold)] absolute -top-1 -right-1" />
          )}
          {config.showDoubleStar && (
            <>
              <Star className="w-5 h-5 text-[var(--gold)] absolute -top-1 -right-1" />
              <Star className="w-4 h-4 text-[var(--gold)] absolute -top-2 right-3" />
            </>
          )}
        </div>

        {/* Tier Badge for Boost tiers */}
        {tier !== 'none' && (
          <div className="flex justify-center mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              tier === '30day'
                ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                : 'bg-[var(--green)] text-white'
            }`}>
              {tier === '30day' ? (
                <>
                  <Star className="w-3 h-3" />
                  <Star className="w-3 h-3" />
                  Boost Pro
                </>
              ) : (
                <>
                  <Star className="w-3 h-3" />
                  Boost
                </>
              )}
            </span>
          </div>
        )}

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">{config.title}</h1>
        <p className="text-[var(--text-secondary)] mb-6">{config.subtitle}</p>

        {/* Feature List for Boost tiers */}
        {config.features.length > 0 && (
          <div className="bg-[var(--background-subtle)] rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
              What&apos;s Active
            </p>
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg className={`w-5 h-5 flex-shrink-0 ${tier === '30day' ? 'text-[var(--gold)]' : 'text-[var(--green)]'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/my-listings"
            className="px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
          >
            View My Listings
          </Link>
          <Link
            href="/plates"
            className="px-6 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
          >
            Browse All Plates
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
