import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListingBySlug } from '@/lib/api';
import {
  formatPrice,
  formatTimeAgo,
  STATE_NAMES,
  PLATE_TYPE_NAMES,
  getColorSchemeColors,
} from '@/types/listing';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Light backgrounds need a dark container for visibility
const LIGHT_BACKGROUNDS = ['#FFFFFF', '#FFD100', '#F5F5F5'];

function PlateHero({ listing }: { listing: any }) {
  const colors = getColorSchemeColors(listing.colorScheme);
  const isLightBackground = LIGHT_BACKGROUNDS.includes(colors.background.toUpperCase());
  const containerColor = isLightBackground ? '#1A1A2E' : '#F0F0F0';

  return (
    <div
      className="rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px]"
      style={{ backgroundColor: containerColor }}
    >
      {listing.isFeatured && (
        <span className="inline-flex items-center gap-1 px-2 py-1 mb-6 bg-[var(--gold)] text-[var(--text)] text-xs font-semibold tracking-wide rounded">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          FEATURED
        </span>
      )}

      {/* The plate itself */}
      <div
        className="rounded-lg px-8 py-6 border-2 flex flex-col items-center"
        style={{
          backgroundColor: colors.background,
          borderColor: isLightBackground ? '#E5E5E5' : colors.background,
        }}
      >
        <p
          className="text-sm font-semibold tracking-widest mb-1"
          style={{ color: colors.text, opacity: 0.7 }}
        >
          {listing.state}
        </p>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider"
          style={{ color: colors.text }}
        >
          {listing.combination}
        </h1>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: 'Plate Not Found',
    };
  }

  const title = `${listing.combination} - ${listing.state} Number Plate For Sale`;
  const description = `Buy the personalised plate "${listing.combination}" in ${STATE_NAMES[listing.state]} for ${formatPrice(listing.price)}. ${listing.description?.slice(0, 100) || 'View details and contact the seller on AusPlates.'}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://ausplates.app/plate/${listing.slug}`,
      images: [
        {
          url: `/api/og?plate=${listing.combination}&state=${listing.state}`,
          width: 1200,
          height: 630,
          alt: `${listing.combination} ${listing.state} Number Plate`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${listing.combination} Number Plate`,
    description: listing.description || `Personalised number plate ${listing.combination} for sale in ${STATE_NAMES[listing.state]}`,
    offers: {
      '@type': 'Offer',
      price: listing.price / 100,
      priceCurrency: 'AUD',
      availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Person',
        name: listing.seller?.fullName || 'Seller',
      },
    },
    category: 'Vehicle Number Plates',
    brand: {
      '@type': 'Brand',
      name: STATE_NAMES[listing.state],
    },
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[var(--background)]">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--green)]">
              Home
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <Link href="/plates" className="text-[var(--text-muted)] hover:text-[var(--green)]">
              Plates
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <Link
              href={`/plates/${listing.state.toLowerCase()}`}
              className="text-[var(--text-muted)] hover:text-[var(--green)]"
            >
              {listing.state}
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text)]">{listing.combination}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Plate Display */}
            <div>
              <PlateHero listing={listing} />

              {/* Stats */}
              <div className="mt-6 flex items-center gap-6 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {listing.viewsCount} views
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Listed {formatTimeAgo(listing.createdAt)}
                </span>
              </div>
            </div>

            {/* Right: Details */}
            <div>
              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl md:text-5xl font-semibold text-[var(--text)]">
                  {formatPrice(listing.price)}
                </p>
                {listing.isOpenToOffers && (
                  <p className="mt-2 text-[var(--green)] font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                    Open to offers
                  </p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[var(--background-subtle)] text-[var(--text-secondary)] text-sm rounded-lg">
                  {STATE_NAMES[listing.state]}
                </span>
                <span className="px-3 py-1 bg-[var(--background-subtle)] text-[var(--text-secondary)] text-sm rounded-lg">
                  {PLATE_TYPE_NAMES[listing.plateType]}
                </span>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-[var(--text)] mb-2">Description</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* App CTA */}
              <div className="bg-[var(--background-subtle)] rounded-2xl p-6">
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">
                  Interested in this plate?
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  Download the AusPlates app to contact the seller, save to favourites, and get notified of similar listings.
                </p>
                <Link
                  href="https://apps.apple.com/app/ausplates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--green)] text-white text-base font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Get the App to Contact Seller
                </Link>
              </div>

              {/* Seller Info (if available) */}
              {listing.seller && (
                <div className="mt-6 p-6 border border-[var(--border)] rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--green)] rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                      {listing.seller.avatarUrl ? (
                        <img src={listing.seller.avatarUrl} alt={listing.seller.fullName} className="w-full h-full object-cover" />
                      ) : (
                        listing.seller.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{listing.seller.fullName}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {listing.seller.listingsCount} listings · {listing.seller.soldCount} sold
                      </p>
                    </div>
                  </div>
                  {listing.seller.responseTimeAvg && (
                    <p className="mt-4 text-sm text-[var(--text-secondary)] flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--green)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Usually responds within {listing.seller.responseTimeAvg < 60 ? `${listing.seller.responseTimeAvg} minutes` : `${Math.round(listing.seller.responseTimeAvg / 60)} hours`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More Plates CTA */}
        <section className="py-12 bg-[var(--background-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              Looking for more plates?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Browse thousands of personalised plates from across Australia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/plates"
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
              >
                Browse All Plates
              </Link>
              <Link
                href={`/plates/${listing.state.toLowerCase()}`}
                className="inline-flex items-center justify-center px-6 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-white transition-colors"
              >
                More {listing.state} Plates
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
