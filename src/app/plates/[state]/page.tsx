import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { FilterPanel } from '@/components/FilterPanel';
import { getListings } from '@/lib/api';
import {
  AustralianState,
  PlateType,
  PlateColorScheme,
  PlateSizeFormat,
  STATE_NAMES,
  Listing,
} from '@/types/listing';

const VALID_STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

// Generate static pages for all states
export async function generateStaticParams() {
  return VALID_STATES.map((state) => ({
    state: state.toLowerCase(),
  }));
}

// State-specific descriptions for SEO
const STATE_DESCRIPTIONS: Record<AustralianState, string> = {
  VIC: 'VicRoads offers a wide range of personalised plate styles including custom combinations, heritage plates, and prestige numeric plates. Victorian plates are known for their classic dark blue and white design.',
  NSW: 'Service NSW provides custom plates with various background designs. NSW plates feature the classic blue and gold color scheme and offer heritage, custom, and euro-style options.',
  QLD: 'Queensland Transport offers colourful plate options with maroon and white designs. QLD plates include personalised combinations, prestige plates, and special themed editions.',
  SA: 'South Australia offers personalised plates through Service SA. SA plates feature the ochre and black colour scheme with custom, euro, and slimline options available.',
  WA: 'Western Australia provides custom plates through the Department of Transport. WA plates offer various styles including personalised combinations and euro-style plates.',
  TAS: 'Tasmania offers personalised plates with the distinctive green and white design. Tasmanian plates include custom combinations and themed options.',
  NT: 'Northern Territory provides personalised plates with the ochre and maroon outback design. NT plates offer unique Territory-themed options.',
  ACT: 'ACT offers personalised plates with the distinctive blue and gold Canberra design. Options include custom combinations and specialty plates.',
};

interface PageProps {
  params: Promise<{ state: string }>;
  searchParams?: Promise<{
    query?: string;
    plate_types?: string;
    color_schemes?: string;
    size_formats?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateUpper = state.toUpperCase() as AustralianState;

  if (!VALID_STATES.includes(stateUpper)) {
    return { title: 'State Not Found' };
  }

  const stateName = STATE_NAMES[stateUpper];
  const title = `${stateUpper} Number Plates For Sale - ${stateName} Personalised Plates`;
  const description = `Buy personalised number plates in ${stateName}. Browse custom, heritage, and euro plates from ${stateUpper}. ${STATE_DESCRIPTIONS[stateUpper]}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | AusPlates`,
      description,
      url: `https://ausplates.app/plates/${state}`,
    },
    alternates: {
      canonical: `https://ausplates.app/plates/${state}`,
    },
  };
}

function FilterPanelWrapper({ fixedState }: { fixedState: AustralianState }) {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl border border-[var(--border)] p-4 animate-pulse h-96" />}>
      <FilterPanel fixedState={fixedState} />
    </Suspense>
  );
}

export default async function StatePlatesPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { state } = await params;
  const stateUpper = state.toUpperCase() as AustralianState;

  if (!VALID_STATES.includes(stateUpper)) {
    notFound();
  }

  const stateName = STATE_NAMES[stateUpper];
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};

  // Parse filter parameters
  const query = searchParams.query;
  const plateTypes = searchParams.plate_types?.split(',').filter(Boolean) as PlateType[] | undefined;
  const colorSchemes = searchParams.color_schemes?.split(',').filter(Boolean) as PlateColorScheme[] | undefined;
  const sizeFormats = searchParams.size_formats?.split(',').filter(Boolean) as PlateSizeFormat[] | undefined;
  const minPrice = searchParams.min_price ? parseInt(searchParams.min_price, 10) : undefined;
  const maxPrice = searchParams.max_price ? parseInt(searchParams.max_price, 10) : undefined;
  const sort = (searchParams.sort || 'recent') as 'recent' | 'price_asc' | 'price_desc' | 'views';

  // Fetch listings from API with state fixed + other filters
  let listings: Listing[] = [];
  let total = 0;

  try {
    const response = await getListings({
      state: stateUpper,
      query,
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
    console.error('Failed to fetch listings:', error);
  }

  // Count active filters (excluding state since it's fixed)
  const activeFilterCount =
    (plateTypes?.length || 0) +
    (colorSchemes?.length || 0) +
    (sizeFormats?.length || 0) +
    (minPrice || maxPrice ? 1 : 0);

  // JSON-LD for state page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${stateUpper} Number Plates For Sale`,
    description: `Browse personalised number plates for sale in ${stateName}`,
    url: `https://ausplates.app/plates/${state}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'AusPlates',
      url: 'https://ausplates.app',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[var(--background)]">
        {/* Hero Section */}
        <div className="bg-[var(--plate-background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center">
              <p className="text-[var(--green)] text-sm font-semibold tracking-widest mb-2">
                {stateUpper}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {stateName} Number Plates
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {query ? `Search: "${query}"` : `Browse personalised plates for sale in ${stateName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-[var(--border)]">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--green)]">
              Home
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <Link href="/plates" className="text-[var(--text-muted)] hover:text-[var(--green)]">
              Plates
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text)]">{stateUpper}</span>
          </nav>
        </div>

        {/* Main Content with Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <FilterPanelWrapper fixedState={stateUpper} />
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
                    <FilterPanelWrapper fixedState={stateUpper} />
                  </div>
                </details>
              </div>

              {/* Results Count - with live region for screen readers */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[var(--text-muted)]">
                  {total > 0
                    ? `Showing ${listings.length} of ${total.toLocaleString()} ${stateUpper} plates`
                    : `No ${stateUpper} plates found`}
                  {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied)`}
                </p>
                {/* Live region for screen reader announcements */}
                <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                  {total > 0
                    ? `${total} ${stateUpper} plates found. Showing ${listings.length} results.`
                    : `No ${stateUpper} plates found matching your filters.`}
                </div>
              </div>

              {/* Listings Grid */}
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
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
                  <h3 className="text-lg font-medium text-[var(--text)] mb-2">
                    No {stateUpper} plates found
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                    {query || activeFilterCount > 0
                      ? 'Try adjusting your search or filters'
                      : `Be the first to list a ${stateName} plate`}
                  </p>
                  {(query || activeFilterCount > 0) && (
                    <Link
                      href={`/plates/${state}`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                    >
                      Clear Filters
                    </Link>
                  )}
                </div>
              )}

              {/* App CTA */}
              {listings.length > 0 && (
                <div className="mt-12 text-center">
                  <p className="text-[var(--text-muted)] mb-4">
                    iOS app coming soon with notifications for new {stateUpper} plates
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

        {/* Other States */}
        <section className="border-t border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
              Browse Other States
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {VALID_STATES.filter((s) => s !== stateUpper).map((s) => (
                <Link
                  key={s}
                  href={`/plates/${s.toLowerCase()}`}
                  className="flex items-center justify-center px-4 py-3 bg-[var(--background-subtle)] text-[var(--text)] font-medium rounded-lg hover:bg-[var(--green-subtle)] transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-[var(--background-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              About {stateName} Number Plates
            </h2>
            <div className="prose prose-gray max-w-none text-[var(--text-secondary)]">
              <p>{STATE_DESCRIPTIONS[stateUpper]}</p>
              <p className="mt-4">
                Looking to buy or sell a personalised number plate in {stateName}? AusPlates
                connects buyers and sellers across Australia. Our iOS app is coming soon, allowing
                you to list your plate, contact sellers, and get notified when new {stateUpper} plates are listed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
