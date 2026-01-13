import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListingBySlug } from '@/lib/api';
import {
  formatPrice,
  formatTimeAgo,
  STATE_NAMES,
  PLATE_TYPE_NAMES,
  Listing,
} from '@/types/listing';
import { PlateFeatureTags } from '@/components/PlateFeatureTags';
import { PlateView } from '@/components/PlateView';
import { SaveButton } from '@/components/SaveButton';
import { ContactSellerButton } from '@/components/ContactSellerButton';
import { OwnerActions } from '@/components/OwnerActions';
import { PhotoGallery } from '@/components/PhotoGallery';
import { ReportListingButton } from '@/components/ReportListingButton';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}

// Consistent light gray container for all plates
const CONTAINER_COLOR = '#F0F0F0';

function PlateHero({ listing }: { listing: Listing }) {
  return (
    <div
      className="relative rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px]"
      style={{ backgroundColor: CONTAINER_COLOR }}
    >
      {/* Save Button */}
      <div className="absolute top-4 left-4">
        <SaveButton listingId={listing.id} slug={listing.slug} size="small" />
      </div>

      {listing.isFeatured && (
        <span className="inline-flex items-center gap-1 px-2 py-1 mb-6 bg-[var(--gold)] text-[var(--text)] text-xs font-semibold tracking-wide rounded">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          FEATURED
        </span>
      )}

      {/* The plate - using consistent PlateView component */}
      <PlateView
        combination={listing.combination}
        state={listing.state}
        colorScheme={listing.colorScheme}
        size="xlarge"
      />
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

export default async function ListingDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { created } = await searchParams;
  const isNewlyCreated = created === 'true';

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
        {/* Success Banner for newly created listings */}
        {isNewlyCreated && (
          <div className="bg-[var(--green)] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium">Your plate is now listed! It&apos;s live and visible to buyers.</p>
              </div>
            </div>
          </div>
        )}

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

              {/* Photo Gallery */}
              {listing.photoUrls && listing.photoUrls.length > 0 && (
                <PhotoGallery photos={listing.photoUrls} combination={listing.combination} />
              )}

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
                <ReportListingButton
                  listingId={listing.id}
                  combination={listing.combination}
                  sellerId={listing.seller?.id}
                />
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

              {/* Primary Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-[var(--background-subtle)] text-[var(--text-secondary)] text-sm rounded-lg">
                  {STATE_NAMES[listing.state]}
                </span>
                <span className="px-3 py-1 bg-[var(--background-subtle)] text-[var(--text-secondary)] text-sm rounded-lg">
                  {PLATE_TYPE_NAMES[listing.plateType]}
                </span>
              </div>

              {/* Feature Tags */}
              <PlateFeatureTags listing={listing} className="mb-6" />

              {/* Description */}
              {listing.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-[var(--text)] mb-2">Description</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Owner Actions - only visible to listing owner */}
              {listing.seller?.id && (
                <OwnerActions
                  listingId={listing.id}
                  slug={listing.slug}
                  sellerId={listing.seller.id}
                  status={listing.status}
                  hasPaid={listing.hasPaid}
                  isFeatured={listing.isFeatured}
                  boostExpiresAt={listing.boostExpiresAt}
                  bumpsRemaining={listing.bumpsRemaining}
                />
              )}

              {/* Save Button */}
              <div className="mb-6">
                <SaveButton listingId={listing.id} slug={listing.slug} size="large" />
              </div>

              {/* Contact Seller - hide for owner */}
              <div className="mb-6">
                <ContactSellerButton
                  listingId={listing.id}
                  combination={listing.combination}
                  sellerName={listing.seller?.fullName || 'Seller'}
                  sellerId={listing.seller?.id}
                />
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
                      <p className="text-sm text-[var(--green)] flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified member
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
