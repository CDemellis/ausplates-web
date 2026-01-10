'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';
import { createCheckout, confirmPayment } from '@/lib/api';
import { PlateView } from '@/components/PlateView';
import { PLATE_TYPE_NAMES } from '@/types/listing';

interface PageProps {
  params: Promise<{ id: string }>;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type BoostType = 'none' | '7day' | '30day';

const TIER_PRICES = {
  none: 999,     // $9.99
  '7day': 1998,  // $19.98
  '30day': 2499, // $24.99
} as const;

const TIER_INFO: Record<BoostType, { name: string; features: string[] }> = {
  none: {
    name: 'Standard',
    features: ['Listed until sold', 'Secure messaging'],
  },
  '7day': {
    name: 'Boost',
    features: ['Featured 7 days', 'Priority search', 'Homepage spotlight'],
  },
  '30day': {
    name: 'Boost Pro',
    features: ['Featured 30 days', 'Priority search', '2x Bump to top'],
  },
};

interface ListingData {
  id: string;
  combination: string;
  state: string;
  plate_type: string;
  color_scheme: string;
  price: number;
  slug: string;
  status: string;
  user_id: string;
}

// Payment Form Component
function PaymentForm({
  amount,
  onSuccess,
  onError,
  paymentIntentId,
}: {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { getAccessToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-listings`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const token = await getAccessToken();
        if (token) {
          await confirmPayment(token, paymentIntentId);
        }
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-xl p-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay ${(amount / 100).toFixed(2)} AUD
          </>
        )}
      </button>

      <p className="text-xs text-center text-[var(--text-muted)]">
        Your payment is secure and encrypted by Stripe.
      </p>
    </form>
  );
}

function Star() {
  return (
    <svg className="w-4 h-4 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function Check({ included, highlight }: { included: boolean; highlight?: boolean }) {
  if (!included) {
    return <span className="w-5 h-5 text-[var(--text-muted)]">—</span>;
  }
  return (
    <svg
      className={`w-5 h-5 ${highlight ? 'text-[var(--gold)]' : 'text-[var(--green)]'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function PayDraftListingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken, user } = useAuth();

  const [listing, setListing] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [boostType, setBoostType] = useState<BoostType>('none');
  const [promoCode, setPromoCode] = useState('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/my-listings');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch listing data
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com'}/api/listings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Listing not found');
          }
          throw new Error('Failed to fetch listing');
        }

        const data = await res.json();

        // Verify ownership
        if (data.user_id !== user?.id) {
          throw new Error('You do not have permission to access this listing');
        }

        // Verify draft status
        if (data.status !== 'draft') {
          // Already published, redirect to listing
          router.push(`/plate/${data.slug}`);
          return;
        }

        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [isAuthenticated, id, getAccessToken, user?.id, router]);

  const handlePay = async () => {
    if (!listing) return;

    setIsCreatingPayment(true);
    setPaymentError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const result = await createCheckout(
        token,
        listing.id,
        boostType,
        promoCode || undefined
      );

      // If free (promo code covered full amount), redirect to listing
      if (result.free && result.listingSlug) {
        router.push(`/plate/${result.listingSlug}?published=true`);
        return;
      }

      if (result.clientSecret && result.paymentIntentId) {
        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
        setPaymentAmount(result.amount || TIER_PRICES[boostType]);
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (listing) {
      router.push(`/plate/${listing.slug}?published=true`);
    } else {
      router.push('/my-listings?published=true');
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text)] mb-2">{error}</h1>
          <Link href="/my-listings" className="text-[var(--green)] hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const borderClass = boostType === '30day'
    ? 'border-[var(--gold)] shadow-lg shadow-amber-100'
    : boostType === '7day'
    ? 'border-[var(--green)] shadow-lg shadow-green-100'
    : 'border-[var(--border)]';

  // Show Stripe payment form
  if (clientSecret && paymentIntentId) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="sticky top-0 z-20 bg-white border-b border-[var(--border)]">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setClientSecret(null);
                  setPaymentIntentId(null);
                  setPaymentError(null);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-[var(--text)]">Complete Payment</h1>
              <div className="w-6" />
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8">
          <div className={`bg-white rounded-2xl overflow-hidden border-2 ${borderClass}`}>
            {/* Plate Preview */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center relative">
              {boostType !== 'none' && (
                <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  boostType === '30day'
                    ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                    : 'bg-[var(--green)] text-white'
                }`}>
                  <Star />
                  {TIER_INFO[boostType].name}
                </div>
              )}
              <PlateView
                combination={listing.combination}
                state={listing.state as any}
                colorScheme={listing.color_scheme as any}
                size="medium"
              />
              <p className="mt-3 text-white/60 text-sm">
                {listing.state} • {PLATE_TYPE_NAMES[listing.plate_type as keyof typeof PLATE_TYPE_NAMES]}
              </p>
            </div>

            <div className="p-6">
              {paymentError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-[var(--error)]">{paymentError}</p>
                </div>
              )}

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#00843D',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={paymentAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  paymentIntentId={paymentIntentId}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Plan selection and checkout
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/my-listings" className="text-[var(--text-secondary)] hover:text-[var(--text)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text)]">Publish Listing</h1>
            <div className="w-6" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Draft Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800">Draft listing</h3>
              <p className="text-sm text-amber-700">
                This listing is saved as a draft. Complete payment to publish it and make it visible to buyers.
              </p>
            </div>
          </div>
        </div>

        {/* Plate Preview */}
        <div className="mb-8 bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center">
            <PlateView
              combination={listing.combination}
              state={listing.state as any}
              colorScheme={listing.color_scheme as any}
              size="large"
            />
            <p className="mt-3 text-white/60 text-sm">
              {listing.state} • {PLATE_TYPE_NAMES[listing.plate_type as keyof typeof PLATE_TYPE_NAMES]}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              ${(listing.price / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Choose your listing plan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Standard */}
            <button
              onClick={() => setBoostType('none')}
              className={`relative bg-white rounded-xl text-left transition-all border-2 p-4 ${
                boostType === 'none'
                  ? 'border-[var(--green)] shadow-lg'
                  : 'border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              <h3 className="font-semibold text-[var(--text)]">Standard</h3>
              <p className="text-2xl font-bold text-[var(--text)] mt-1">$9.99</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check included />
                  <span>Listed until sold</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check included />
                  <span>Up to 5 photos</span>
                </div>
              </div>
              {boostType === 'none' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--green)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {/* Boost */}
            <button
              onClick={() => setBoostType('7day')}
              className={`relative bg-white rounded-xl text-left transition-all border-2 p-4 ${
                boostType === '7day'
                  ? 'border-[var(--green)] shadow-lg'
                  : 'border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              <div className="absolute -top-3 left-4 bg-[var(--green)] text-white text-xs font-bold px-2 py-0.5 rounded">
                POPULAR
              </div>
              <div className="flex items-center gap-1">
                <Star />
                <h3 className="font-semibold text-[var(--text)]">Boost</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mt-1">$19.98</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check included highlight />
                  <span>Featured 7 days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check included highlight />
                  <span>Priority in search</span>
                </div>
              </div>
              {boostType === '7day' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--green)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {/* Boost Pro */}
            <button
              onClick={() => setBoostType('30day')}
              className={`relative bg-white rounded-xl text-left transition-all border-2 p-4 ${
                boostType === '30day'
                  ? 'border-[var(--gold)] shadow-lg ring-2 ring-[var(--gold)]/20'
                  : 'border-[var(--border)] hover:border-[var(--gold)]'
              }`}
            >
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded">
                BEST VALUE
              </div>
              <div className="flex items-center gap-1">
                <Star />
                <Star />
                <h3 className="font-semibold text-[var(--text)]">Boost Pro</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mt-1">$24.99</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check included highlight />
                  <span>Featured 30 days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check included highlight />
                  <span>2x Bump to top</span>
                </div>
              </div>
              {boostType === '30day' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--gold)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Promo Code & Total */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Promo Code
            </label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent uppercase"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
            <div>
              <span className="text-[var(--text)] font-medium">Listing Fee</span>
              {boostType !== 'none' && (
                <p className="text-xs text-[var(--text-muted)]">
                  {boostType === '30day' ? '30 days featured' : '7 days featured'}
                </p>
              )}
            </div>
            <span className="text-2xl font-bold text-[var(--text)]">
              ${(TIER_PRICES[boostType] / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-[var(--error)]">{paymentError}</p>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={isCreatingPayment}
          className="w-full py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isCreatingPayment ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Preparing payment...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay ${(TIER_PRICES[boostType] / 100).toFixed(2)} & Publish
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-center text-[var(--text-muted)]">
          Secure payment powered by Stripe. Your listing will be published immediately after payment.
        </p>
      </div>
    </div>
  );
}
