'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Listing, formatPrice, formatTimeAgo } from '@/types/listing';
import { PlateView } from './PlateView';
import { useAuth } from '@/lib/auth-context';
import { useSaved } from '@/lib/saved-context';

interface ListingCardProps {
  listing: Listing;
}

// Consistent light gray container for all plates
const CONTAINER_COLOR = '#F0F0F0';

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useSaved();

  const saved = isSaved(listing.id);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/signin?redirect=/plate/${listing.slug}`);
      return;
    }

    await toggleSave(listing.id);
  };

  return (
    <Link
      href={`/plate/${listing.slug}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Plate Preview */}
      <div className="relative p-3">
        <div
          className="rounded-xl aspect-[3/2] flex items-center justify-center"
          style={{ backgroundColor: CONTAINER_COLOR }}
        >
          <PlateView
            combination={listing.combination}
            state={listing.state}
            size="medium"
            colorScheme={listing.colorScheme}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors"
          aria-label={saved ? 'Unsave plate' : 'Save plate'}
        >
          {saved ? (
            <svg className="w-5 h-5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>

        {/* Featured Badge */}
        {listing.isFeatured && (
          <div className="absolute top-5 right-5">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--gold)] text-[var(--text)] text-[9px] font-semibold tracking-wide rounded">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              FEATURED
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        <p className="text-lg font-semibold text-[var(--text)]">
          {formatPrice(listing.price)}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {listing.state} · {formatTimeAgo(listing.createdAt)}
        </p>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm animate-pulse">
      <div className="p-3">
        <div className="bg-[var(--background-subtle)] rounded-xl aspect-[3/2]" />
      </div>
      <div className="px-4 pb-4 space-y-2">
        <div className="h-5 bg-[var(--background-subtle)] rounded w-24" />
        <div className="h-4 bg-[var(--background-subtle)] rounded w-16" />
      </div>
    </div>
  );
}
