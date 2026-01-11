'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';
import { createBoostCheckout, confirmBoostPayment } from '@/lib/api';
import { PlateView } from '@/components/PlateView';

interface PageProps {
  params: Promise<{ id: string }>;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type BoostType = '7day' | '30day';

const BOOST_PRICES = {
  '7day': 1998,  // $19.98
  '30day': 2499, // $24.99
} as const;

const BOOST_INFO: Record<BoostType, { name: string; features: string[] }> = {
  '7day': {
    name: 'Boost',
    features: ['Featured 7 days', 'Priority in search', 'Homepage spotlight'],
  },
  '30day': {
    name: 'Boost Pro',
    features: ['Featured 30 days', 'Priority in search', '2x Bump to top', 'Price drop alerts'],
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
  is_featured: boolean;
  boost_expires_at: string | null;
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
        if (!token) {
          onError('Session expired. Please refresh and try again.');
          setIsProcessing(false);
          return;
        }

        try {
          await confirmBoostPayment(token, paymentIntentId);
          onSuccess();
        } catch (confirmErr) {
          console.error('Confirm boost failed after payment:', confirmErr);
          onError('Payment received but boost activation failed. Please contact support or check My Listings in a few minutes.');
        }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

function Check() {
  return (
    <svg className="w-5 h-5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function BoostListingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken, user } = useAuth();

  const [listing, setListing] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [boostType, setBoostType] = useState<BoostType>('7day');
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

        // Verify active status
        if (data.status !== 'active') {
          throw new Error('Only active listings can be boosted');
        }

        // Check if already has active boost
        if (data.is_featured && data.boost_expires_at) {
          const boostExpires = new Date(data.boost_expires_at);
          if (boostExpires > new Date()) {
            throw new Error('This listing already has an active boost');
          }
        }

        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [isAuthenticated, id, getAccessToken, user?.id]);

  const handlePay = async () => {
    if (!listing) return;

    setIsCreatingPayment(true);
    setPaymentError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const result = await createBoostCheckout(token, listing.id, boostType);

      if (result.clientSecret && result.paymentIntentId) {
        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
        setPaymentAmount(result.amount || BOOST_PRICES[boostType]);
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
    router.push(`/my-listings?boosted=true`);
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
    : 'border-[var(--green)] shadow-lg shadow-green-100';

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
              <div className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                boostType === '30day'
                  ? 'bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black'
                  : 'bg-[var(--green)] text-white'
              }`}>
                <Star />
                {BOOST_INFO[boostType].name}
              </div>
              <PlateView
                combination={listing.combination}
                state={listing.state as any}
                colorScheme={listing.color_scheme as any}
                size="medium"
              />
              <p className="mt-3 text-white/60 text-sm">{listing.state}</p>
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

  // Boost selection
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/my-listings" className="text-[var(--text-secondary)] hover:text-[var(--text)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text)]">Boost Listing</h1>
            <div className="w-6" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Plate Preview */}
        <div className="mb-8 bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col items-center">
            <PlateView
              combination={listing.combination}
              state={listing.state as any}
              colorScheme={listing.color_scheme as any}
              size="large"
            />
            <p className="mt-3 text-white/60 text-sm">{listing.state}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              ${(listing.price / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Boost Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Get more visibility</h3>
              <p className="text-sm text-amber-700">
                Boosted listings get up to 5x more views and sell faster. Your listing will appear at the top of search results and on the homepage.
              </p>
            </div>
          </div>
        </div>

        {/* Boost Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Choose your boost</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Boost 7-day */}
            <button
              onClick={() => setBoostType('7day')}
              className={`relative bg-white rounded-xl text-left transition-all border-2 p-5 ${
                boostType === '7day'
                  ? 'border-[var(--green)] shadow-lg'
                  : 'border-[var(--border)] hover:border-[var(--green)]'
              }`}
            >
              <div className="flex items-center gap-1 mb-2">
                <Star />
                <h3 className="font-semibold text-[var(--text)]">Boost</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">$19.98</p>
              <p className="text-sm text-[var(--text-muted)] mb-3">7 days featured</p>
              <div className="space-y-2">
                {BOOST_INFO['7day'].features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {boostType === '7day' && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-[var(--green)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {/* Boost Pro 30-day */}
            <button
              onClick={() => setBoostType('30day')}
              className={`relative bg-white rounded-xl text-left transition-all border-2 p-5 ${
                boostType === '30day'
                  ? 'border-[var(--gold)] shadow-lg ring-2 ring-[var(--gold)]/20'
                  : 'border-[var(--border)] hover:border-[var(--gold)]'
              }`}
            >
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-[var(--gold)] to-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded">
                BEST VALUE
              </div>
              <div className="flex items-center gap-1 mb-2">
                <Star />
                <Star />
                <h3 className="font-semibold text-[var(--text)]">Boost Pro</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">$24.99</p>
              <p className="text-sm text-[var(--text-muted)] mb-3">30 days featured</p>
              <div className="space-y-2">
                {BOOST_INFO['30day'].features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {boostType === '30day' && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-[var(--gold)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Boost for ${(BOOST_PRICES[boostType] / 100).toFixed(2)}
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-center text-[var(--text-muted)]">
          Secure payment powered by Stripe. Your boost will be activated immediately.
        </p>
      </div>
    </div>
  );
}
