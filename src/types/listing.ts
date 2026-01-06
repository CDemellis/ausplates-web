export type AustralianState = 'VIC' | 'NSW' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

export type PlateType = 'custom' | 'heritage' | 'euro' | 'standard' | 'slimline' | 'numeric' | 'prestige';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'draft' | 'removed';

export type PlateColorScheme =
  | 'black_on_white'
  | 'white_on_black'
  | 'blue_on_white'
  | 'black_on_yellow'
  | 'green_on_white'
  | 'maroon_on_white'
  | 'silver_on_black'
  | 'gold_on_black'
  | 'white_on_blue'
  | 'white_on_maroon'
  | 'blue_on_white_jdm'
  | 'green_on_white_jdm'
  | 'custom';

export type PlateSizeFormat =
  | 'standard'
  | 'slimline'
  | 'euro'
  | 'square'
  | 'us_style'
  | 'jdm'
  | 'motorcycle';

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
  colorScheme?: PlateColorScheme;
  sizeFormat?: PlateSizeFormat;
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
  prestige: 'Prestige',
};

// Color scheme to hex color mapping
export const COLOR_SCHEME_COLORS: Record<PlateColorScheme, { text: string; background: string }> = {
  black_on_white: { text: '#000000', background: '#FFFFFF' },
  white_on_black: { text: '#FFFFFF', background: '#000000' },
  blue_on_white: { text: '#003B73', background: '#FFFFFF' },
  black_on_yellow: { text: '#000000', background: '#FFD100' },
  green_on_white: { text: '#00843D', background: '#FFFFFF' },
  maroon_on_white: { text: '#7B2D26', background: '#FFFFFF' },
  silver_on_black: { text: '#C0C0C0', background: '#000000' },
  gold_on_black: { text: '#FFD700', background: '#000000' },
  white_on_blue: { text: '#FFFFFF', background: '#003B73' },
  white_on_maroon: { text: '#FFFFFF', background: '#7B2D26' },
  blue_on_white_jdm: { text: '#1A4B8C', background: '#FFFFFF' },
  green_on_white_jdm: { text: '#2E5D34', background: '#FFFFFF' },
  custom: { text: '#FFFFFF', background: '#000000' },
};

export function getColorSchemeColors(scheme?: PlateColorScheme): { text: string; background: string } {
  return COLOR_SCHEME_COLORS[scheme || 'white_on_black'];
}

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
