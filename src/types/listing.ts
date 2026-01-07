export type AustralianState = 'VIC' | 'NSW' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

export type PlateType =
  | 'custom'
  | 'heritage'
  | 'euro'
  | 'standard'
  | 'slimline'
  | 'numeric'
  | 'prestige'
  | 'deluxe'
  | 'liquid_metal'
  | 'frameless'
  | 'signature'
  | 'afl_team'
  | 'fishing'
  | 'business'
  | 'sequential'
  | 'car_brand';

export type PlateMaterial = 'aluminium' | 'acrylic' | 'polycarbonate' | 'enamel';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'draft' | 'removed';

export type PlateColorScheme =
  // Standard two-tone
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
  // VIC standard custom colors
  | 'yellow_on_black'
  | 'red_on_white'
  | 'pink_on_white'
  | 'purple_on_white'
  | 'orange_on_white'
  | 'grey_on_black'
  // VIC extended motorcycle colors
  | 'teal_on_white'
  | 'ocean_blue_on_white'
  | 'sky_blue_on_white'
  | 'navy_on_white'
  | 'lime_on_white'
  | 'forest_green_on_white'
  | 'burgundy_on_white'
  | 'fire_red_on_white'
  | 'charcoal_on_white'
  | 'brown_on_white'
  | 'tan_on_black'
  | 'cream_on_black'
  | 'off_white_on_black'
  | 'matte_black_on_white'
  | 'matte_white_on_black'
  // JDM
  | 'blue_on_white_jdm'
  | 'green_on_white_jdm'
  // VIC AFL team colors
  | 'afl_carlton'
  | 'afl_collingwood'
  | 'afl_richmond'
  | 'afl_essendon'
  | 'afl_melbourne'
  | 'afl_geelong'
  | 'afl_hawthorn'
  | 'afl_north_melbourne'
  | 'afl_western_bulldogs'
  | 'afl_st_kilda'
  // VIC premium finishes
  | 'liquid_metal_silver'
  | 'liquid_metal_chrome'
  // Fallback
  | 'custom';

export type PlateSizeFormat =
  | 'standard'
  | 'slimline'
  | 'euro'
  | 'square'
  | 'us_style'
  | 'jdm'
  | 'motorcycle';

export type VehicleType = 'car' | 'motorcycle' | 'trailer';

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
  material?: PlateMaterial;
  vehicleType?: VehicleType;
  teamName?: string; // For AFL/NRL branded plates
  isDiscontinuedStyle?: boolean; // Plate style no longer available new
  characterCount?: number; // Auto-calculated character count
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
  deluxe: 'Deluxe',
  liquid_metal: 'Liquid Metal',
  frameless: 'Frameless',
  signature: 'Signature',
  afl_team: 'AFL Team',
  fishing: 'Fishing',
  business: 'Business',
  sequential: 'Sequential',
  car_brand: 'Car Brand',
};

export const PLATE_MATERIAL_NAMES: Record<PlateMaterial, string> = {
  aluminium: 'Aluminium',
  acrylic: 'Acrylic',
  polycarbonate: 'Polycarbonate',
  enamel: 'Enamel',
};

export const SIZE_FORMAT_NAMES: Record<PlateSizeFormat, string> = {
  standard: 'Standard',
  slimline: 'Slimline',
  euro: 'Euro',
  square: 'Square',
  us_style: 'US Style',
  jdm: 'JDM',
  motorcycle: 'Motorcycle',
};

// Color scheme to hex color mapping
export const COLOR_SCHEME_COLORS: Record<PlateColorScheme, { text: string; background: string }> = {
  // Standard two-tone
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

  // VIC standard custom colors
  yellow_on_black: { text: '#FFD700', background: '#000000' },
  red_on_white: { text: '#CC0000', background: '#FFFFFF' },
  pink_on_white: { text: '#FF69B4', background: '#FFFFFF' },
  purple_on_white: { text: '#800080', background: '#FFFFFF' },
  orange_on_white: { text: '#FF6600', background: '#FFFFFF' },
  grey_on_black: { text: '#808080', background: '#000000' },

  // VIC extended motorcycle colors
  teal_on_white: { text: '#008080', background: '#FFFFFF' },
  ocean_blue_on_white: { text: '#006994', background: '#FFFFFF' },
  sky_blue_on_white: { text: '#87CEEB', background: '#FFFFFF' },
  navy_on_white: { text: '#000080', background: '#FFFFFF' },
  lime_on_white: { text: '#32CD32', background: '#FFFFFF' },
  forest_green_on_white: { text: '#228B22', background: '#FFFFFF' },
  burgundy_on_white: { text: '#800020', background: '#FFFFFF' },
  fire_red_on_white: { text: '#FF0000', background: '#FFFFFF' },
  charcoal_on_white: { text: '#36454F', background: '#FFFFFF' },
  brown_on_white: { text: '#8B4513', background: '#FFFFFF' },
  tan_on_black: { text: '#D2B48C', background: '#000000' },
  cream_on_black: { text: '#FFFDD0', background: '#000000' },
  off_white_on_black: { text: '#FAF9F6', background: '#000000' },
  matte_black_on_white: { text: '#28282B', background: '#FFFFFF' },
  matte_white_on_black: { text: '#F5F5F5', background: '#000000' },

  // JDM
  blue_on_white_jdm: { text: '#1A4B8C', background: '#FFFFFF' },
  green_on_white_jdm: { text: '#2E5D34', background: '#FFFFFF' },

  // VIC AFL team colors
  afl_carlton: { text: '#FFFFFF', background: '#001C3D' },
  afl_collingwood: { text: '#FFFFFF', background: '#000000' },
  afl_richmond: { text: '#000000', background: '#FFD700' },
  afl_essendon: { text: '#000000', background: '#CC0000' },
  afl_melbourne: { text: '#FFFFFF', background: '#000080' },
  afl_geelong: { text: '#FFFFFF', background: '#001C3D' },
  afl_hawthorn: { text: '#FFD700', background: '#4D2004' },
  afl_north_melbourne: { text: '#FFFFFF', background: '#003B73' },
  afl_western_bulldogs: { text: '#FFFFFF', background: '#003B73' },
  afl_st_kilda: { text: '#FFFFFF', background: '#CC0000' },

  // VIC premium finishes
  liquid_metal_silver: { text: '#C0C0C0', background: '#1A1A1A' },
  liquid_metal_chrome: { text: '#4A4A4A', background: '#1A1A1A' },

  // Fallback
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
