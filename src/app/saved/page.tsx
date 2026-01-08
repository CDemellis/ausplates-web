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
          <div className="w-20 h-20 rounded-full bg-[var(--background-subtle)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-2">No saved plates yet</h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            When you find plates you like, tap the heart icon to save them here for easy access later.
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
