import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { PlateView } from '@/components/PlateView';
import { getFeaturedListings, getRecentListings } from '@/lib/api';
import { AustralianState, STATE_NAMES, Listing } from '@/types/listing';

// Mock data for development (until API has real data)
const MOCK_FEATURED: Listing[] = [
  {
    id: '1',
    slug: 'boss-vic',
    combination: 'BOSS',
    state: 'VIC',
    plateType: 'custom',
    price: 4500000,
    isOpenToOffers: true,
    isFeatured: true,
    status: 'active',
    viewsCount: 234,
    sellerId: '1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    slug: 'ceo-nsw',
    combination: 'CEO',
    state: 'NSW',
    plateType: 'custom',
    price: 8500000,
    isOpenToOffers: false,
    isFeatured: true,
    status: 'active',
    viewsCount: 456,
    sellerId: '2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    slug: 'crypto-qld',
    combination: 'CRYPTO',
    state: 'QLD',
    plateType: 'custom',
    price: 2500000,
    isOpenToOffers: true,
    isFeatured: true,
    status: 'active',
    viewsCount: 189,
    sellerId: '3',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    slug: 'legend-vic',
    combination: 'LEGEND',
    state: 'VIC',
    plateType: 'custom',
    price: 3200000,
    isOpenToOffers: true,
    isFeatured: true,
    status: 'active',
    viewsCount: 312,
    sellerId: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_RECENT: Listing[] = [
  ...MOCK_FEATURED,
  {
    id: '5',
    slug: '4eva-nsw',
    combination: '4EVA',
    state: 'NSW',
    plateType: 'custom',
    price: 1800000,
    isOpenToOffers: true,
    isFeatured: false,
    status: 'active',
    viewsCount: 98,
    sellerId: '4',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    slug: 'vip-1-vic',
    combination: 'VIP 1',
    state: 'VIC',
    plateType: 'heritage',
    price: 15000000,
    isOpenToOffers: false,
    isFeatured: false,
    status: 'active',
    viewsCount: 567,
    sellerId: '5',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    slug: 'king-sa',
    combination: 'KING',
    state: 'SA',
    plateType: 'custom',
    price: 950000,
    isOpenToOffers: true,
    isFeatured: false,
    status: 'active',
    viewsCount: 145,
    sellerId: '6',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    slug: 'queen-wa',
    combination: 'QUEEN',
    state: 'WA',
    plateType: 'custom',
    price: 1100000,
    isOpenToOffers: true,
    isFeatured: false,
    status: 'active',
    viewsCount: 203,
    sellerId: '7',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

export default async function HomePage() {
  // Try to fetch from API, fall back to mock data
  let featuredListings = MOCK_FEATURED;
  let recentListings = MOCK_RECENT;

  try {
    const featured = await getFeaturedListings();
    if (featured && featured.length > 0) {
      featuredListings = featured;
    }
  } catch {
    // Use mock data
  }

  try {
    const recent = await getRecentListings(8);
    if (recent && recent.length > 0) {
      recentListings = recent;
    }
  } catch {
    // Use mock data
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--text)] leading-tight">
                Find Your Perfect{' '}
                <span className="text-[var(--green)]">Plate</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl">
                Australia&apos;s marketplace for personalised number plates. Browse thousands of plates from every state.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/plates"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white text-base font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                >
                  Browse Plates
                </Link>
                <Link
                  href="https://apps.apple.com/app/ausplates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-base font-medium rounded-xl hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Download App
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div>
                  <p className="text-2xl md:text-3xl font-semibold text-[var(--text)]">1,000+</p>
                  <p className="text-sm text-[var(--text-muted)]">Active Listings</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-semibold text-[var(--text)]">8</p>
                  <p className="text-sm text-[var(--text-muted)]">States & Territories</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-semibold text-[var(--green)]">$9.99</p>
                  <p className="text-sm text-[var(--text-muted)]">To List</p>
                </div>
              </div>
            </div>

            {/* Right: Featured Plates Preview */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Decorative plates */}
                <div className="absolute -top-4 -left-8 transform -rotate-6 opacity-80">
                  <PlateView combination="LEGEND" state="VIC" size="large" />
                </div>
                <div className="relative z-10">
                  <PlateView combination="BOSS" state="NSW" size="large" />
                </div>
                <div className="absolute -bottom-4 -right-8 transform rotate-6 opacity-80">
                  <PlateView combination="CEO" state="QLD" size="large" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
                Featured Plates
              </h2>
              <p className="mt-1 text-[var(--text-secondary)]">
                Premium listings from sellers across Australia
              </p>
            </div>
            <Link
              href="/plates?featured=true"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--green)] hover:text-[#006B31] transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredListings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section className="py-16 bg-[var(--background-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
              Browse by State
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Find plates from your state or territory
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATES.map((state) => (
              <Link
                key={state}
                href={`/plates/${state.toLowerCase()}`}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <PlateView combination={state} state={state} size="small" />
                <span className="mt-3 text-sm font-medium text-[var(--text)] group-hover:text-[var(--green)] transition-colors">
                  {STATE_NAMES[state]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
                Recent Listings
              </h2>
              <p className="mt-1 text-[var(--text-secondary)]">
                Just listed across Australia
              </p>
            </div>
            <Link
              href="/plates"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--green)] hover:text-[#006B31] transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentListings.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* App Download CTA */}
      <section className="py-16 bg-[var(--plate-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Get the AusPlates App
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                List your plate for just $9.99. Message sellers directly. Save your favourites. Get notified when new plates match your search.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Free to browse and buy',
                  '$9.99 to list your plate',
                  'Direct messaging with sellers',
                  'Push notifications for new listings',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-[var(--green)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="https://apps.apple.com/app/ausplates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black text-base font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Download on the App Store
                </Link>
              </div>
            </div>

            {/* Phone Mockup Placeholder */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-64 h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-4">
                      <PlateView combination="APP" state="VIC" size="medium" />
                    </div>
                    <p className="text-lg font-semibold text-[var(--text)]">AusPlates</p>
                    <p className="text-sm text-[var(--text-muted)]">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
