import { Metadata } from 'next';
import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { SortDropdown } from '@/components/SortDropdown';
import { getListings } from '@/lib/api';
import {
  AustralianState,
  PlateType,
  PLATE_TYPE_NAMES,
  Listing,
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

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
const PLATE_TYPES: PlateType[] = ['custom', 'heritage', 'euro', 'numeric', 'slimline'];

interface SearchParams {
  state?: string;
  type?: string;
  sort?: string;
}

export default async function BrowsePlatesPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  // Safely await searchParams
  const searchParams = props.searchParams ? await props.searchParams : {};
  const selectedState = searchParams?.state?.toUpperCase() as AustralianState | undefined;
  const selectedType = searchParams?.type as PlateType | undefined;
  const sortBy = searchParams?.sort || 'recent';

  // Fetch listings from API
  let listings: Listing[] = [];
  let total = 0;

  try {
    const sortParam = sortBy === 'price-low' ? 'price_asc' : sortBy === 'price-high' ? 'price_desc' : 'recent';
    const response = await getListings({
      state: selectedState,
      plateType: selectedType,
      pageSize: 24,
      sort: sortParam,
    });
    listings = response?.listings || [];
    total = response?.total || 0;
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    // Continue with empty listings
  }

  const buildFilterUrl = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams();
    if (selectedState && key !== 'state') newParams.set('state', selectedState.toLowerCase());
    if (selectedType && key !== 'type') newParams.set('type', selectedType);
    if (sortBy !== 'recent' && key !== 'sort') newParams.set('sort', sortBy);
    if (value) newParams.set(key, value);
    const queryString = newParams.toString();
    return `/plates${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="bg-[var(--background)]">
      {/* Page Header */}
      <div className="bg-[var(--background-subtle)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text)]">
            Browse Number Plates
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {total > 0 ? `${total} personalised plates for sale across Australia` : 'Personalised plates for sale across Australia'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          {/* State Filter */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/plates"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                !selectedState
                  ? 'bg-[var(--green)] text-white'
                  : 'bg-[var(--background-subtle)] text-[var(--text-secondary)] hover:bg-[var(--green-subtle)]'
              }`}
            >
              All States
            </Link>
            {STATES.map((state) => (
              <Link
                key={state}
                href={buildFilterUrl('state', state.toLowerCase())}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedState === state
                    ? 'bg-[var(--green)] text-white'
                    : 'bg-[var(--background-subtle)] text-[var(--text-secondary)] hover:bg-[var(--green-subtle)]'
                }`}
              >
                {state}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort Dropdown */}
          <SortDropdown currentSort={sortBy} />
        </div>

        {/* Plate Type Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={buildFilterUrl('type', undefined)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              !selectedType
                ? 'bg-[var(--text)] text-white'
                : 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text)]'
            }`}
          >
            All Types
          </Link>
          {PLATE_TYPES.map((type) => (
            <Link
              key={type}
              href={buildFilterUrl('type', type)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedType === type
                  ? 'bg-[var(--text)] text-white'
                  : 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text)]'
              }`}
            >
              {PLATE_TYPE_NAMES[type]}
            </Link>
          ))}
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">No plates found</h3>
            <p className="text-[var(--text-muted)] mb-6">
              {selectedState || selectedType ? 'Try adjusting your filters or browse all plates' : 'Be the first to list a plate!'}
            </p>
            {(selectedState || selectedType) && (
              <Link
                href="/plates"
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
              >
                View All Plates
              </Link>
            )}
          </div>
        )}

        {/* App CTA */}
        {listings.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-[var(--text-muted)] mb-4">
              Download the app to see more listings and set up alerts
            </p>
            <Link
              href="https://apps.apple.com/app/ausplates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Get the App for Full Access
            </Link>
          </div>
        )}
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
              your classic car, or a prestige numeric plate, you&apos;ll find it here. Download the
              AusPlates app to contact sellers directly, save your favourite plates, and get
              notified when new listings match your search.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
