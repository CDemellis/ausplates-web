import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { getListingsByState } from '@/lib/api';
import {
  AustralianState,
  STATE_NAMES,
  PLATE_TYPE_NAMES,
  PlateType,
  Listing,
} from '@/types/listing';

const VALID_STATES: AustralianState[] = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

// Generate static pages for all states
export async function generateStaticParams() {
  return VALID_STATES.map((state) => ({
    state: state.toLowerCase(),
  }));
}

// Mock listings for development
const MOCK_LISTINGS: Record<AustralianState, Listing[]> = {
  VIC: [
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
      id: '4',
      slug: 'ceo-vic',
      combination: 'CEO',
      state: 'VIC',
      plateType: 'custom',
      price: 12000000,
      isOpenToOffers: true,
      isFeatured: true,
      status: 'active',
      viewsCount: 445,
      sellerId: '4',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '7',
      slug: '123-vic',
      combination: '123',
      state: 'VIC',
      plateType: 'numeric',
      price: 25000000,
      isOpenToOffers: true,
      isFeatured: true,
      status: 'active',
      viewsCount: 892,
      sellerId: '7',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '9',
      slug: 'melb-vic',
      combination: 'MELB',
      state: 'VIC',
      plateType: 'custom',
      price: 6500000,
      isOpenToOffers: false,
      isFeatured: false,
      status: 'active',
      viewsCount: 156,
      sellerId: '9',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  NSW: [
    {
      id: '2',
      slug: 'crypto-nsw',
      combination: 'CRYPTO',
      state: 'NSW',
      plateType: 'custom',
      price: 8500000,
      isOpenToOffers: false,
      isFeatured: true,
      status: 'active',
      viewsCount: 567,
      sellerId: '2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      slug: 'legend-nsw',
      combination: 'LEGEND',
      state: 'NSW',
      plateType: 'custom',
      price: 3500000,
      isOpenToOffers: false,
      isFeatured: false,
      status: 'active',
      viewsCount: 178,
      sellerId: '5',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10',
      slug: 'sydney-nsw',
      combination: 'SYDNEY',
      state: 'NSW',
      plateType: 'custom',
      price: 15000000,
      isOpenToOffers: true,
      isFeatured: true,
      status: 'active',
      viewsCount: 723,
      sellerId: '10',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  QLD: [
    {
      id: '3',
      slug: '4eva-qld',
      combination: '4EVA',
      state: 'QLD',
      plateType: 'custom',
      price: 1200000,
      isOpenToOffers: true,
      isFeatured: false,
      status: 'active',
      viewsCount: 89,
      sellerId: '3',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '11',
      slug: 'brisbane-qld',
      combination: 'BRISSY',
      state: 'QLD',
      plateType: 'custom',
      price: 2800000,
      isOpenToOffers: true,
      isFeatured: false,
      status: 'active',
      viewsCount: 112,
      sellerId: '11',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  SA: [
    {
      id: '6',
      slug: 'king-sa',
      combination: 'KING',
      state: 'SA',
      plateType: 'custom',
      price: 7500000,
      isOpenToOffers: true,
      isFeatured: false,
      status: 'active',
      viewsCount: 312,
      sellerId: '6',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  WA: [
    {
      id: '8',
      slug: 'amg-wa',
      combination: 'AMG',
      state: 'WA',
      plateType: 'custom',
      price: 4800000,
      isOpenToOffers: false,
      isFeatured: false,
      status: 'active',
      viewsCount: 201,
      sellerId: '8',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '12',
      slug: 'perth-wa',
      combination: 'PERTH',
      state: 'WA',
      plateType: 'custom',
      price: 3200000,
      isOpenToOffers: true,
      isFeatured: false,
      status: 'active',
      viewsCount: 145,
      sellerId: '12',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  TAS: [
    {
      id: '13',
      slug: 'tassie-tas',
      combination: 'TASSIE',
      state: 'TAS',
      plateType: 'custom',
      price: 1800000,
      isOpenToOffers: true,
      isFeatured: false,
      status: 'active',
      viewsCount: 67,
      sellerId: '13',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  NT: [
    {
      id: '14',
      slug: 'darwin-nt',
      combination: 'DARWIN',
      state: 'NT',
      plateType: 'custom',
      price: 2100000,
      isOpenToOffers: true,
      isFeatured: false,
      status: 'active',
      viewsCount: 45,
      sellerId: '14',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  ACT: [
    {
      id: '15',
      slug: 'canberra-act',
      combination: 'CANBRRA',
      state: 'ACT',
      plateType: 'custom',
      price: 2500000,
      isOpenToOffers: false,
      isFeatured: false,
      status: 'active',
      viewsCount: 89,
      sellerId: '15',
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

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

export default async function StatePlatesPage({ params }: PageProps) {
  const { state } = await params;
  const stateUpper = state.toUpperCase() as AustralianState;

  if (!VALID_STATES.includes(stateUpper)) {
    notFound();
  }

  const stateName = STATE_NAMES[stateUpper];

  // Try to fetch real listings - getListingsByState handles errors internally
  let listings: Listing[] = await getListingsByState(stateUpper);

  // Fall back to mock if no results
  if (!listings || listings.length === 0) {
    listings = MOCK_LISTINGS[stateUpper] || [];
  }

  // Sort by most recent
  listings = [...listings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
                Browse personalised plates for sale in {stateName}
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

        {/* Stats Bar */}
        <div className="border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text)]">{listings.length}</span> plates
              available in {stateUpper}
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h3 className="text-lg font-medium text-[var(--text)] mb-2">
                No {stateUpper} plates listed yet
              </h3>
              <p className="text-[var(--text-muted)] mb-6">
                Be the first to list a {stateName} plate
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
                List Your Plate
              </Link>
            </div>
          )}

          {/* App CTA */}
          {listings.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-[var(--text-muted)] mb-4">
                Get the app for instant notifications when new {stateUpper} plates are listed
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
                Get the App
              </Link>
            </div>
          )}
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
                connects buyers and sellers across Australia. Download the app to list your plate,
                contact sellers, and get notified when new {stateUpper} plates are listed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
