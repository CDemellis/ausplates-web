export type AustralianState = 'VIC' | 'NSW' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

export type PlateType = 'custom' | 'heritage' | 'euro' | 'standard' | 'slimline' | 'numeric';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'draft' | 'removed';

export interface Listing {
  id: string;
  slug: string;
  combination: string;
  state: AustralianState;
  plateType: PlateType;
  price: number; // in cents
  description?: string;
  isOpenToOffers: boolean;
  isFeatured: boolean;
  status: ListingStatus;
  viewsCount: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingWithSeller extends Listing {
  seller: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    responseTimeAvg?: number;
    listingsCount: number;
    soldCount: number;
  };
}

export const STATE_NAMES: Record<AustralianState, string> = {
  VIC: 'Victoria',
  NSW: 'New South Wales',
  QLD: 'Queensland',
  SA: 'South Australia',
  WA: 'Western Australia',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
  ACT: 'Australian Capital Territory',
};

export const PLATE_TYPE_NAMES: Record<PlateType, string> = {
  custom: 'Custom',
  heritage: 'Heritage',
  euro: 'Euro Style',
  standard: 'Standard',
  slimline: 'Slimline',
  numeric: 'Numeric',
};

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
