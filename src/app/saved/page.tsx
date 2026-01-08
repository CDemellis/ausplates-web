'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTokens } from '@/lib/auth';
import { getSavedListings } from '@/lib/api';
import { Listing } from '@/types/listing';
import { ListingCard, ListingCardSkeleton } from '@/components/ListingCard';

export default function SavedPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/saved');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedListings();
    }
  }, [isAuthenticated]);

  const loadSavedListings = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    try {
      const listings = await getSavedListings(accessToken);
      setSavedListings(listings);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--green)] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Saved Plates</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {isLoading ? 'Loading...' : `${savedListings.length} ${savedListings.length === 1 ? 'plate' : 'plates'} saved`}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : savedListings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-2">No saved plates yet</h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            When you find plates you like, tap the star icon to save them here for easy access later.
          </p>
          <Link
            href="/plates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
          >
            Browse Plates
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
