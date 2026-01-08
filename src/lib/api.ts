import { Listing, ListingWithSeller, AustralianState, PlateType, PlateColorScheme, PlateSizeFormat } from '@/types/listing';

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
  // Single state (legacy) or multiple states
  state?: AustralianState;
  states?: AustralianState[];
  minPrice?: number;
  maxPrice?: number;
  // Single plate type (legacy) or multiple
  plateType?: string;
  plateTypes?: PlateType[];
  // Color schemes
  colorSchemes?: PlateColorScheme[];
  // Size formats
  sizeFormats?: PlateSizeFormat[];
  // Search query
  query?: string;
  search?: string; // Legacy alias for query
  featured?: boolean;
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'views';
}

export async function getListings(params: ListingsParams = {}): Promise<{ listings: Listing[]; total: number }> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  // States - support both single and multiple
  if (params.states && params.states.length > 0) {
    searchParams.set('state', params.states.join(','));
  } else if (params.state) {
    searchParams.set('state', params.state);
  }

  // Price range
  if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());

  // Plate types - support both single and multiple
  if (params.plateTypes && params.plateTypes.length > 0) {
    searchParams.set('plateType', params.plateTypes.join(','));
  } else if (params.plateType) {
    searchParams.set('plateType', params.plateType);
  }

  // Color schemes
  if (params.colorSchemes && params.colorSchemes.length > 0) {
    searchParams.set('colorScheme', params.colorSchemes.join(','));
  }

  // Size formats
  if (params.sizeFormats && params.sizeFormats.length > 0) {
    searchParams.set('sizeFormats', params.sizeFormats.join(','));
  }

  // Search query
  if (params.query) searchParams.set('query', params.query);
  if (params.search) searchParams.set('query', params.search);

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

// Get saved listings for authenticated user
export async function getSavedListings(accessToken: string): Promise<Listing[]> {
  const url = `${API_BASE_URL}/api/users/me/saved`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch saved listings');
  }

  const data: { data: APIListing[] } = await res.json();
  return (data.data || []).map(transformListing);
}

// Save a listing
export async function saveListing(accessToken: string, listingId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/listings/${listingId}/save`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to save listing');
  }
}

// Unsave a listing
export async function unsaveListing(accessToken: string, listingId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/listings/${listingId}/save`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to unsave listing');
  }
}

// Get saved listing IDs for checking saved status
export async function getSavedListingIds(accessToken: string): Promise<Set<string>> {
  const listings = await getSavedListings(accessToken);
  return new Set(listings.map(l => l.id));
}

// ============================================
// MESSAGING API
// ============================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ConversationParticipant {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface ConversationListing {
  id: string;
  slug: string;
  combination: string;
  state: AustralianState;
  price: number;
}

export interface Conversation {
  id: string;
  listingId: string;
  listing: ConversationListing;
  participants: ConversationParticipant[];
  otherUser: ConversationParticipant;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

// API response types (snake_case from backend)
interface APIMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface APIConversationParticipant {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface APIConversationListing {
  id: string;
  slug: string;
  combination: string;
  state: AustralianState;
  price: number;
}

interface APIConversation {
  id: string;
  listing_id: string;
  listing: APIConversationListing;
  participants: APIConversationParticipant[];
  other_user: APIConversationParticipant;
  last_message?: APIMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
  messages?: APIMessage[];
}

// Transform functions
function transformMessage(api: APIMessage): Message {
  return {
    id: api.id,
    conversationId: api.conversation_id,
    senderId: api.sender_id,
    content: api.content,
    createdAt: api.created_at,
    isRead: api.is_read,
  };
}

function transformParticipant(api: APIConversationParticipant): ConversationParticipant {
  return {
    id: api.id,
    fullName: api.full_name,
    avatarUrl: api.avatar_url,
  };
}

function transformConversation(api: APIConversation): Conversation {
  return {
    id: api.id,
    listingId: api.listing_id,
    listing: {
      id: api.listing.id,
      slug: api.listing.slug,
      combination: api.listing.combination,
      state: api.listing.state,
      price: api.listing.price,
    },
    participants: api.participants.map(transformParticipant),
    otherUser: transformParticipant(api.other_user),
    lastMessage: api.last_message ? transformMessage(api.last_message) : undefined,
    unreadCount: api.unread_count,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

function transformConversationDetail(api: APIConversation): ConversationDetail {
  return {
    ...transformConversation(api),
    messages: (api.messages || []).map(transformMessage),
  };
}

// Get all conversations for authenticated user
export async function getConversations(accessToken: string): Promise<Conversation[]> {
  const url = `${API_BASE_URL}/api/messages/conversations`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch conversations');
  }

  const data: { data: APIConversation[] } = await res.json();
  return (data.data || []).map(transformConversation);
}

// Get single conversation with messages
export async function getConversation(accessToken: string, conversationId: string): Promise<ConversationDetail> {
  const url = `${API_BASE_URL}/api/messages/conversations/${conversationId}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch conversation');
  }

  const data: { data: APIConversation } = await res.json();
  return transformConversationDetail(data.data);
}

// Get messages for a conversation (for polling new messages)
export async function getMessages(accessToken: string, conversationId: string, since?: string): Promise<Message[]> {
  let url = `${API_BASE_URL}/api/messages/conversations/${conversationId}/messages`;
  if (since) {
    url += `?since=${encodeURIComponent(since)}`;
  }

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data: { data: APIMessage[] } = await res.json();
  return (data.data || []).map(transformMessage);
}

// Send a message
export async function sendMessage(accessToken: string, conversationId: string, content: string): Promise<Message> {
  const url = `${API_BASE_URL}/api/messages/conversations/${conversationId}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error('Failed to send message');
  }

  const data: { data: APIMessage } = await res.json();
  return transformMessage(data.data);
}

// Start a new conversation (contact seller)
export async function startConversation(accessToken: string, listingId: string, message: string): Promise<Conversation> {
  const url = `${API_BASE_URL}/api/messages/conversations`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId, message }),
  });

  if (!res.ok) {
    throw new Error('Failed to start conversation');
  }

  const data: { data: APIConversation } = await res.json();
  return transformConversation(data.data);
}

// Get unread message count
export async function getUnreadCount(accessToken: string): Promise<number> {
  const url = `${API_BASE_URL}/api/messages/unread-count`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return 0; // Fail silently for unread count
  }

  const data: { count: number } = await res.json();
  return data.count || 0;
}

// Mark conversation as read
export async function markConversationRead(accessToken: string, conversationId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/messages/conversations/${conversationId}/read`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  // Ignore errors for marking read - not critical
}

// ============================================
// LISTING CREATION API
// ============================================

export interface CreateListingData {
  combination: string;
  state: AustralianState;
  plateType: string;
  colorScheme: PlateColorScheme;
  sizeFormats: [PlateSizeFormat, PlateSizeFormat];
  material: string;
  vehicleType: string;
  price: number;
  isOpenToOffers: boolean;
  description: string;
  photoUrls?: string[];
}

interface APICreateListingData {
  combination: string;
  state: AustralianState;
  plate_type: string;
  color_scheme: PlateColorScheme;
  size_formats: [PlateSizeFormat, PlateSizeFormat];
  material: string;
  vehicle_type: string;
  price: number;
  is_open_to_offers: boolean;
  description: string;
  photo_urls?: string[];
}

// Create a new draft listing
export async function createListing(accessToken: string, data: CreateListingData): Promise<{ id: string; slug: string }> {
  const url = `${API_BASE_URL}/api/listings`;

  const apiData: APICreateListingData = {
    combination: data.combination,
    state: data.state,
    plate_type: data.plateType,
    color_scheme: data.colorScheme,
    size_formats: data.sizeFormats,
    material: data.material,
    vehicle_type: data.vehicleType,
    price: data.price,
    is_open_to_offers: data.isOpenToOffers,
    description: data.description,
    photo_urls: data.photoUrls,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create listing');
  }

  const listing = await res.json();
  return { id: listing.id, slug: listing.slug };
}

// ============================================
// PAYMENTS API
// ============================================

export interface PaymentIntentResponse {
  clientSecret?: string;
  amount?: number;
  listingFee?: number;
  boostFee?: number;
  success?: boolean;
  free?: boolean;
  listingSlug?: string;
}

// Create PaymentIntent for embedded checkout
export async function createPaymentIntent(
  accessToken: string,
  listingId: string,
  boostType: 'none' | '7day' | '30day',
  promoCode?: string
): Promise<PaymentIntentResponse> {
  const url = `${API_BASE_URL}/api/payments/create-payment-intent`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listing_id: listingId,
      boost_type: boostType,
      promo_code: promoCode,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create payment intent');
  }

  const data = await res.json();
  return {
    clientSecret: data.client_secret,
    amount: data.amount,
    listingFee: data.listing_fee,
    boostFee: data.boost_fee,
    success: data.success,
    free: data.free,
    listingSlug: data.listing_slug,
  };
}

// Confirm payment and publish listing
export async function confirmPayment(
  accessToken: string,
  paymentIntentId: string
): Promise<{ success: boolean; listingSlug?: string }> {
  const url = `${API_BASE_URL}/api/payments/confirm`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment_intent_id: paymentIntentId,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to confirm payment');
  }

  const data = await res.json();
  return {
    success: data.success,
    listingSlug: data.listing_slug,
  };
}
