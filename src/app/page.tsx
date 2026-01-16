import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { PlateView } from '@/components/PlateView';
import { StateCard } from '@/components/StateCard';
import { getFeaturedListings, getRecentListings } from '@/lib/api';
import { AustralianState, Listing } from '@/types/listing';

const STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

export default async function HomePage() {
  // Fetch from API
  let featuredListings: Listing[] = [];
  let recentListings: Listing[] = [];

  try {
    featuredListings = await getFeaturedListings();
  } catch {
    // API error - continue with empty
  }

  try {
    recentListings = await getRecentListings(8);
  } catch {
    // API error - continue with empty
  }

  // If no featured listings, use recent for the featured section
  const displayFeatured = featuredListings.length > 0 ? featuredListings : recentListings.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[var(--background)] to-[var(--background-subtle)] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              {/* Launch Special Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--green)]/10 border border-[var(--green)]/20 rounded-full mb-6">
                <svg className="w-4 h-4 text-[var(--green)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-[var(--green)]">Launch Special - Limited Time</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight">
                List Your Plate{' '}
                <span className="text-[var(--green)]">FREE</span>
              </h1>

              {/* Supporting Copy */}
              <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Be an early mover on Australia&apos;s newest number plate marketplace. Create your listing today - completely free during our launch special.
              </p>

              {/* Primary CTA */}
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--green)] text-white text-lg font-semibold rounded-xl hover:bg-[#006B31] transition-colors shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Claim Your Free Listing
                </Link>
              </div>

              {/* Trust Signals */}
              <ul className="mt-8 space-y-3">
                {[
                  'No credit card required',
                  'No commission fees',
                  'Reach buyers Australia-wide',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--green)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Secondary Browse Link */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  href="/plates"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  Or browse available plates
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Standard vs Featured Comparison */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="flex items-center gap-8">
                {/* Standard Listing */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative opacity-75 scale-95 transition-all">
                    <PlateView combination="LEGEND" state="VIC" size="large" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[var(--text-muted)]">Standard Listing</p>
                  </div>
                </div>

                {/* Arrow/Divider */}
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-xs font-semibold text-[var(--green)]">Upgrade</span>
                </div>

                {/* Featured Listing */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {/* Featured Badge */}
                    <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ✨ FEATURED
                    </div>
                    {/* Plate with glow effect */}
                    <div className="relative scale-105 transition-all" style={{
                      filter: 'drop-shadow(0 0 20px rgba(0, 123, 55, 0.4))',
                    }}>
                      <PlateView combination="LEGEND" state="VIC" size="large" />
                    </div>
                    {/* Subtle pulse animation ring */}
                    <div className="absolute inset-0 rounded-lg animate-pulse" style={{
                      boxShadow: '0 0 30px 10px rgba(0, 123, 55, 0.2)',
                      pointerEvents: 'none',
                    }}></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[var(--green)]">Get Featured</p>
                    <p className="text-xs text-[var(--text-muted)]">Stand out from the crowd</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured/Recent Listings */}
      {displayFeatured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
                  {featuredListings.length > 0 ? 'Featured Plates' : 'Latest Plates'}
                </h2>
                <p className="mt-1 text-[var(--text-secondary)]">
                  {featuredListings.length > 0 ? 'Premium listings from sellers across Australia' : 'Just listed across Australia'}
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
              {displayFeatured.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

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
              <StateCard key={state} state={state} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings - only show if we have more than featured */}
      {recentListings.length > 4 && (
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
      )}

      {/* App Download CTA */}
      <section className="py-16 bg-[var(--plate-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                AusPlates App Coming Soon
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Our iOS app is in development. Soon you&apos;ll be able to list your plate for just $9.99, message sellers directly, save your favourites, and get notified when new plates match your search.
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
                <span className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 text-white text-base font-medium rounded-xl">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Coming to the App Store
                </span>
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
