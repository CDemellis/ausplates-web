import { Listing, ListingWithSeller, AustralianState } from '@/types/listing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
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

export async function getListings(params: ListingsParams = {}): Promise<ListingsResponse> {
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

  const res = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds

  if (!res.ok) {
    throw new Error('Failed to fetch listings');
  }

  return res.json();
}

export async function getFeaturedListings(): Promise<Listing[]> {
  const url = `${API_BASE_URL}/api/listings/featured`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch featured listings');
  }

  const data = await res.json();
  return data.listings || data;
}

export async function getRecentListings(limit = 12): Promise<Listing[]> {
  const url = `${API_BASE_URL}/api/listings/recent?limit=${limit}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch recent listings');
  }

  const data = await res.json();
  return data.listings || data;
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

  return res.json();
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

  const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes

  if (!res.ok) {
    // Return defaults if stats endpoint doesn't exist
    return { totalListings: 0, totalSold: 0, totalValue: 0 };
  }

  return res.json();
}
