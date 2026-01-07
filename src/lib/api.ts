import { Listing, ListingWithSeller, AustralianState, PlateColorScheme, PlateSizeFormat } from '@/types/listing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

// API response types (snake_case from backend)
interface APIListing {
  id: string;
  slug: string;
  combination: string;
  state: AustralianState;
  plate_type: string;
  price: number;
  description?: string;
  is_open_to_offers: boolean;
  is_featured: boolean;
  status: string;
  views_count: number;
  user_id: string;
  color_scheme?: PlateColorScheme;
  size_format?: PlateSizeFormat;  // Legacy
  size_formats?: PlateSizeFormat[];
  created_at: string;
  updated_at: string;
  seller?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    response_time_avg?: number;
    listings_count: number;
    sold_count: number;
  };
}

interface APIListingsResponse {
  data: APIListing[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// Transform API response to frontend format
function transformListing(api: APIListing): Listing {
  return {
    id: api.id,
    slug: api.slug,
    combination: api.combination,
    state: api.state,
    plateType: api.plate_type as Listing['plateType'],
    price: api.price,
    description: api.description,
    isOpenToOffers: api.is_open_to_offers,
    isFeatured: api.is_featured,
    status: api.status as Listing['status'],
    viewsCount: api.views_count,
    sellerId: api.user_id,
    colorScheme: api.color_scheme,
    sizeFormats: api.size_formats || [],
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

function transformListingWithSeller(api: APIListing): ListingWithSeller {
  return {
    ...transformListing(api),
    seller: api.seller ? {
      id: api.seller.id,
      fullName: api.seller.full_name,
      avatarUrl: api.seller.avatar_url,
      responseTimeAvg: api.seller.response_time_avg,
      listingsCount: api.seller.listings_count,
      soldCount: api.seller.sold_count,
    } : {
      id: api.user_id,
      fullName: 'Seller',
      listingsCount: 0,
      soldCount: 0,
    },
  };
}

interface ListingsParams {
  page?: number;
  pageSize?: number;
  state?: AustralianState;
  minPrice?: number;
  maxPrice?: number;
  plateType?: string;
  search?: string;
  featured?: boolean;
  sort?: 'recent' | 'price_asc' | 'price_desc';
}

export async function getListings(params: ListingsParams = {}): Promise<{ listings: Listing[]; total: number }> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.state) searchParams.set('state', params.state);
  if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
  if (params.plateType) searchParams.set('plateType', params.plateType);
  if (params.search) searchParams.set('search', params.search);
  if (params.featured) searchParams.set('featured', 'true');
  if (params.sort) searchParams.set('sort', params.sort);

  const url = `${API_BASE_URL}/api/listings?${searchParams.toString()}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch listings');
  }

  const data: APIListingsResponse = await res.json();

  return {
    listings: (data.data || []).map(transformListing),
    total: data.pagination?.total || data.data?.length || 0,
  };
}

export async function getFeaturedListings(): Promise<Listing[]> {
  const url = `${API_BASE_URL}/api/listings/featured`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch featured listings');
  }

  const data: APIListingsResponse = await res.json();
  return (data.data || []).map(transformListing);
}

export async function getRecentListings(limit = 12): Promise<Listing[]> {
  const url = `${API_BASE_URL}/api/listings/recent?limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch recent listings');
  }

  const data: APIListingsResponse = await res.json();
  return (data.data || []).map(transformListing);
}

export async function getListingBySlug(slug: string): Promise<ListingWithSeller | null> {
  const url = `${API_BASE_URL}/api/listings/${slug}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch listing');
  }

  const data = await res.json();
  // API might return { data: listing } or just listing
  const listing = data.data || data;
  return transformListingWithSeller(listing);
}

export async function getListingsByState(state: AustralianState, limit = 20): Promise<Listing[]> {
  try {
    const response = await getListings({ state, pageSize: limit, sort: 'recent' });
    return response?.listings || [];
  } catch {
    return [];
  }
}

export async function getStats(): Promise<{ totalListings: number; totalSold: number; totalValue: number }> {
  const url = `${API_BASE_URL}/api/stats`;

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    // Return defaults if stats endpoint doesn't exist
    return { totalListings: 0, totalSold: 0, totalValue: 0 };
  }

  return res.json();
}

// Get all listing slugs for sitemap
export async function getAllListingSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    // Fetch a large number of listings for sitemap
    const response = await getListings({ pageSize: 500, sort: 'recent' });
    return (response?.listings || []).map((listing) => ({
      slug: listing.slug,
      updatedAt: listing.updatedAt,
    }));
  } catch {
    return [];
  }
}
