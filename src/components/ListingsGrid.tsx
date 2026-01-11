'use client';

import { useState, useCallback } from 'react';
import { ListingCard } from './ListingCard';
import { Listing, AustralianState, PlateType, PlateColorScheme, PlateSizeFormat } from '@/types/listing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

interface ListingsGridProps {
  initialListings: Listing[];
  total: number;
  pageSize?: number;
  // Filter params to pass when loading more
  filters: {
    query?: string;
    states?: AustralianState[];
    plateTypes?: PlateType[];
    colorSchemes?: PlateColorScheme[];
    sizeFormats?: PlateSizeFormat[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  };
}

export function ListingsGrid({
  initialListings,
  total,
  pageSize = 24,
  filters,
}: ListingsGridProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = listings.length < total;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = Math.floor(listings.length / pageSize) + 1;

      // Build query params
      const params = new URLSearchParams();
      params.set('page', nextPage.toString());
      params.set('pageSize', pageSize.toString());

      if (filters.query) params.set('query', filters.query);
      if (filters.states?.length) params.set('state', filters.states.join(','));
      if (filters.plateTypes?.length) params.set('plateType', filters.plateTypes.join(','));
      if (filters.colorSchemes?.length) params.set('colorScheme', filters.colorSchemes.join(','));
      if (filters.sizeFormats?.length) params.set('sizeFormats', filters.sizeFormats.join(','));
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sort) params.set('sort', filters.sort);

      const res = await fetch(`${API_BASE_URL}/api/listings?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to load more listings');
      }

      const data = await res.json();
      const newListings = (data.data || []).map(transformListing);

      setListings(prev => [...prev, ...newListings]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoading(false);
    }
  }, [listings.length, pageSize, filters, isLoading, hasMore]);

  return (
    <div>
      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Load More Section */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {/* Count indicator */}
        <p className="text-sm text-[var(--text-muted)]">
          Showing {listings.length.toLocaleString()} of {total.toLocaleString()} plates
        </p>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-8 py-3 bg-white border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] hover:border-[var(--green)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--green)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              `Load More (${(total - listings.length).toLocaleString()} remaining)`
            )}
          </button>
        )}

        {/* All loaded message */}
        {!hasMore && listings.length > 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            You&apos;ve seen all {total.toLocaleString()} plates
          </p>
        )}
      </div>
    </div>
  );
}

// Transform API response to frontend format (duplicated from api.ts for client-side use)
function transformListing(api: any): Listing {
  const photoUrlsFromColumn = api.photo_urls || [];
  const photoUrlsFromTable = (api.photos || []).map((p: any) => p.url);
  const allPhotoUrls = [...new Set([...photoUrlsFromColumn, ...photoUrlsFromTable])];

  return {
    id: api.id,
    slug: api.slug,
    combination: api.combination,
    state: api.state,
    plateType: api.plate_type,
    price: api.price,
    description: api.description,
    isOpenToOffers: api.is_open_to_offers,
    isFeatured: api.is_featured,
    status: api.status,
    viewsCount: api.views_count,
    sellerId: api.user_id,
    colorScheme: api.color_scheme,
    sizeFormats: api.size_formats || [],
    photoUrls: allPhotoUrls,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}
