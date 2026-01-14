import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ListingsGrid } from '@/components/ListingsGrid';
import { FilterPanel } from '@/components/FilterPanel';
import { getListings } from '@/lib/api';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PlateSizeFormat,
} from '@/types/listing';

export const metadata: Metadata = {
  title: 'Browse Personalised Number Plates For Sale',
  description:
    'Browse thousands of personalised number plates for sale across Australia. Find custom, heritage, and euro plates from VIC, NSW, QLD, SA, WA, TAS, NT, and ACT.',
  openGraph: {
    title: 'Browse Personalised Number Plates For Sale | AusPlates',
    description:
      'Browse thousands of personalised number plates for sale across Australia.',
    url: 'https://ausplates.app/plates',
  },
};

interface SearchParams {
  query?: string;
  states?: string;
  plate_types?: string;
  color_schemes?: string;
  size_formats?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
}

function FilterPanelWrapper() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl border border-[var(--border)] p-4 animate-pulse h-96" />}>
      <FilterPanel />
    </Suspense>
  );
}

export default async function BrowsePlatesPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};

  // Parse filter parameters
  const query = searchParams.query;
  const states = searchParams.states?.split(',').filter(Boolean) as AustralianState[] | undefined;
  const plateTypes = searchParams.plate_types?.split(',').filter(Boolean) as PlateType[] | undefined;
  const colorSchemes = searchParams.color_schemes?.split(',').filter(Boolean) as PlateColorScheme[] | undefined;
  const sizeFormats = searchParams.size_formats?.split(',').filter(Boolean) as PlateSizeFormat[] | undefined;
  const minPrice = searchParams.min_price ? parseInt(searchParams.min_price, 10) : undefined;
  const maxPrice = searchParams.max_price ? parseInt(searchParams.max_price, 10) : undefined;
  const sort = (searchParams.sort || 'recent') as 'recent' | 'price_asc' | 'price_desc' | 'views';

  // Fetch listings from API with all filters
  let listings: Awaited<ReturnType<typeof getListings>>['listings'] = [];
  let total = 0;

  try {
    const response = await getListings({
      query,
      states,
      plateTypes,
      colorSchemes,
      sizeFormats,
      minPrice,
      maxPrice,
      pageSize: 24,
      sort,
    });
    listings = response?.listings || [];
    total = response?.total || 0;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch listings:', error);
    }
  }

  // Count active filters for display
  const activeFilterCount =
    (states?.length || 0) +
    (plateTypes?.length || 0) +
    (colorSchemes?.length || 0) +
    (sizeFormats?.length || 0) +
    (minPrice || maxPrice ? 1 : 0);

  return (
    <div className="bg-[var(--background)]">
      {/* Page Header */}
      <div className="bg-[var(--background-subtle)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text)]">
            {query ? `Search: "${query}"` : 'Browse Number Plates'}
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {total > 0
              ? `${total.toLocaleString()} personalised plate${total !== 1 ? 's' : ''} found`
              : 'Personalised plates for sale across Australia'}
            {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied)`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanelWrapper />
            </div>
          </aside>

          {/* Mobile Filter Toggle & Results */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <details className="group">
                <summary className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[var(--border)] rounded-xl cursor-pointer list-none">
                  <span className="flex items-center gap-2 font-medium text-[var(--text)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[var(--green)] rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  <svg className="w-5 h-5 text-[var(--text-muted)] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4">
                  <FilterPanelWrapper />
                </div>
              </details>
            </div>

            {/* Live region for screen reader announcements */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {total > 0
                ? `${total} plates found.`
                : 'No plates found matching your filters.'}
            </div>

            {/* Listings Grid with Load More */}
            {listings.length > 0 ? (
              <ListingsGrid
                initialListings={listings}
                total={total}
                pageSize={24}
                filters={{
                  query,
                  states,
                  plateTypes,
                  colorSchemes,
                  sizeFormats,
                  minPrice,
                  maxPrice,
                  sort,
                }}
              />
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-[var(--border)]">
                <svg
                  className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">No plates found</h3>
                <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                  {query || activeFilterCount > 0
                    ? 'Try adjusting your search or filters to find more plates'
                    : 'Be the first to list a plate!'}
                </p>
                {(query || activeFilterCount > 0) && (
                  <Link
                    href="/plates"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                  >
                    Clear All Filters
                  </Link>
                )}
              </div>
            )}

            {/* App CTA */}
            {listings.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-[var(--text-muted)] mb-4">
                  iOS app coming soon with notifications and alerts
                </p>
                <span className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-[var(--text-secondary)] font-medium rounded-xl">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Coming Soon
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <section className="bg-[var(--background-subtle)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
            Buy Personalised Number Plates in Australia
          </h2>
          <div className="prose prose-gray max-w-none text-[var(--text-secondary)]">
            <p>
              AusPlates is Australia&apos;s premier marketplace for buying and selling personalised
              number plates. Browse thousands of custom plates from sellers across Victoria, New
              South Wales, Queensland, South Australia, Western Australia, Tasmania, Northern
              Territory, and the ACT.
            </p>
            <p className="mt-4">
              Whether you&apos;re looking for a custom plate with your name, a heritage plate for
              your classic car, or a prestige numeric plate, you&apos;ll find it here. Our iOS app
              is coming soon, allowing you to contact sellers directly, save your favourite plates,
              and get notified when new listings match your search.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
