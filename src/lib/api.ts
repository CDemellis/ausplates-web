import { Listing, ListingWithSeller, AustralianState, PlateType, PlateColorScheme, PlateSizeFormat } from '@/types/listing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

// API response types (snake_case from backend)
// Exported for use in client-side components
export interface APIListing {
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
  photo_urls?: string[];
  // Photos from listing_photos table (iOS app uses this)
  photos?: { id: string; url: string; order: number }[];
  created_at: string;
  updated_at: string;
  // Whether listing has been paid for (allows free republishing)
  has_paid?: boolean;
  // Boost properties
  boost_expires_at?: string;
  bumps_remaining?: number;
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
// Exported for use in client-side components
export function transformListing(api: APIListing): Listing {
  // Merge photos from both sources:
  // 1. photo_urls column (web uploads)
  // 2. photos from listing_photos table (iOS app uploads)
  const photoUrlsFromColumn = api.photo_urls || [];
  const photoUrlsFromTable = (api.photos || []).map(p => p.url);
  const allPhotoUrls = [...new Set([...photoUrlsFromColumn, ...photoUrlsFromTable])];

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
    photoUrls: allPhotoUrls,
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
    hasPaid: api.has_paid,
    boostExpiresAt: api.boost_expires_at,
    bumpsRemaining: api.bumps_remaining ?? 0,
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

  const res = await fetch(url, { cache: 'no-store' });

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

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch featured listings');
  }

  const data: APIListingsResponse = await res.json();
  return (data.data || []).map(transformListing);
}

export async function getRecentListings(limit = 12): Promise<Listing[]> {
  const url = `${API_BASE_URL}/api/listings/recent?limit=${limit}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch recent listings');
  }

  const data: APIListingsResponse = await res.json();
  return (data.data || []).map(transformListing);
}

export async function getListingBySlug(slug: string): Promise<ListingWithSeller | null> {
  const url = `${API_BASE_URL}/api/listings/${slug}`;

  const res = await fetch(url, { cache: 'no-store' });

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

  const response = await res.json();
  // API returns { data: [{ id, savedAt, listing }], count, hasMore }
  const listings = (response.data || []).map((item: { listing: APIListing }) => item.listing);
  return listings.map(transformListing);
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
  buyer_id: string;
  seller_id: string;
  listing: APIConversationListing;
  buyer?: APIConversationParticipant;
  seller?: APIConversationParticipant;
  other_user: APIConversationParticipant;
  last_message?: APIMessage;
  unread_count?: number;
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
    // API returns buyer/seller, not participants array
    participants: [
      api.buyer ? transformParticipant(api.buyer) : null,
      api.seller ? transformParticipant(api.seller) : null,
    ].filter(Boolean) as ConversationParticipant[],
    otherUser: transformParticipant(api.other_user),
    lastMessage: api.last_message ? transformMessage(api.last_message) : undefined,
    unreadCount: api.unread_count ?? 0,
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

  const data: APIConversation = await res.json();
  return transformConversationDetail(data);
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

// Send a message to an existing conversation
export async function sendMessage(accessToken: string, conversationId: string, content: string): Promise<Message> {
  // API endpoint is POST /conversations/:id (not /conversations/:id/messages)
  const url = `${API_BASE_URL}/api/messages/conversations/${conversationId}`;

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

  // API returns message directly, not wrapped in { data: ... }
  const data: APIMessage = await res.json();
  return transformMessage(data);
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
    body: JSON.stringify({ listing_id: listingId, message }),
  });

  if (!res.ok) {
    throw new Error('Failed to start conversation');
  }

  const data: { conversation_id: string; message: APIMessage } = await res.json();
  // Return minimal conversation object with the ID for redirect
  return { id: data.conversation_id } as Conversation;
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

// Delete conversation (soft delete - removes from user's view only)
export async function deleteConversation(accessToken: string, conversationId: string): Promise<{ success: boolean }> {
  const url = `${API_BASE_URL}/api/messages/conversations/${conversationId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete conversation');
  }

  return res.json();
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
  contactPreference?: string;
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
  contact_preference?: string;
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
    contact_preference: data.contactPreference,
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
    const errorData = await res.json().catch(() => ({}));
    // Handle Zod validation errors (nested object) or simple string errors
    const errorMessage = typeof errorData.error === 'string'
      ? errorData.error
      : errorData.error?.message || errorData.message || 'Failed to create listing';
    throw new Error(errorMessage);
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

// Create Stripe PaymentIntent for embedded Elements checkout
export interface CheckoutResponse {
  clientSecret?: string;
  paymentIntentId?: string;
  amount?: number;
  free?: boolean;
  listingSlug?: string;
}

export async function createCheckout(
  accessToken: string,
  listingId: string,
  boostType: 'none' | '7day' | '30day',
  promoCode?: string
): Promise<CheckoutResponse> {
  const url = `${API_BASE_URL}/api/payments/create-checkout`;

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
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to create payment intent');
  }

  const data = await res.json();
  return {
    clientSecret: data.client_secret,
    paymentIntentId: data.payment_intent_id,
    amount: data.amount,
    free: data.free,
    listingSlug: data.listing_slug,
  };
}

// Legacy: Create PaymentIntent for embedded checkout
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
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to create payment intent');
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
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to confirm payment');
  }

  const data = await res.json();
  return {
    success: data.success,
    listingSlug: data.listing_slug,
  };
}

// Create boost checkout for existing listing
export async function createBoostCheckout(
  accessToken: string,
  listingId: string,
  boostType: '7day' | '30day',
  promoCode?: string
): Promise<CheckoutResponse> {
  const url = `${API_BASE_URL}/api/payments/create-boost-checkout`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listing_id: listingId,
      boost_type: boostType,
      promo_code: promoCode || undefined,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to create boost checkout');
  }

  const data = await res.json();
  return {
    clientSecret: data.client_secret,
    paymentIntentId: data.payment_intent_id,
    amount: data.amount,
    free: data.free || false,
    listingSlug: data.listing_slug,
  };
}

// Confirm boost payment and activate boost
export async function confirmBoostPayment(
  accessToken: string,
  paymentIntentId: string
): Promise<{ success: boolean; listingSlug?: string }> {
  const url = `${API_BASE_URL}/api/payments/confirm-boost`;

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
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to confirm boost payment');
  }

  const data = await res.json();
  return {
    success: data.success,
    listingSlug: data.listing_slug,
  };
}

// ============================================
// PROMO CODE API
// ============================================

export interface PromoValidationResult {
  valid: boolean;
  type?: string;
  message: string;
  error?: string;
}

export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  const url = `${API_BASE_URL}/api/promo/validate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();
  return {
    valid: data.valid,
    type: data.type,
    message: data.message,
    error: data.error,
  };
}

export async function redeemPromoCode(
  accessToken: string,
  code: string,
  listingId: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const url = `${API_BASE_URL}/api/promo/redeem`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      listing_id: listingId,
    }),
  });

  const data = await res.json();

  // Handle non-200 responses
  if (!res.ok) {
    return {
      success: false,
      message: data.message || 'Failed to redeem promo code',
      error: data.error || 'redemption_failed',
    };
  }

  return {
    success: data.success ?? true,
    message: data.message || 'Promo code redeemed successfully',
    error: data.error,
  };
}

// ============================================
// USER PROFILE API
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: string;
  authProvider: string;
  notificationPreferences?: {
    messages: boolean;
    priceDrops: boolean;
    newListings: boolean;
    savedPlateUpdates: boolean;
  };
}

export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  const url = `${API_BASE_URL}/api/users/me`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await res.json();
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    phoneNumber: data.phone_number,
    isVerified: data.is_verified,
    createdAt: data.created_at,
    authProvider: data.auth_provider,
    notificationPreferences: data.notification_preferences,
  };
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  notificationPreferences?: {
    messages: boolean;
    priceDrops: boolean;
    newListings: boolean;
    savedPlateUpdates: boolean;
  };
}

export async function updateUserProfile(
  accessToken: string,
  data: UpdateProfileData
): Promise<UserProfile> {
  const url = `${API_BASE_URL}/api/users/me`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: data.fullName,
      phone_number: data.phoneNumber,
      avatar_url: data.avatarUrl,
      notification_preferences: data.notificationPreferences,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to update profile');
  }

  const result = await res.json();
  return {
    id: result.id,
    email: result.email,
    fullName: result.full_name,
    avatarUrl: result.avatar_url,
    phoneNumber: result.phone_number,
    isVerified: result.is_verified,
    createdAt: result.created_at,
    authProvider: result.auth_provider,
    notificationPreferences: result.notification_preferences,
  };
}

// ============================================
// USER LISTINGS API
// ============================================

export interface UserListing {
  id: string;
  combination: string;
  state: string;
  plateType: string;
  colorScheme: string;
  price: number;
  status: 'draft' | 'active' | 'sold';
  slug: string;
  viewsCount: number;
  isFeatured: boolean;
  boostExpiresAt?: string;
  hasPaid: boolean;
  bumpsRemaining: number;
  bumpedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUserListings(
  accessToken: string,
  status?: 'draft' | 'active' | 'sold'
): Promise<UserListing[]> {
  let url = `${API_BASE_URL}/api/users/me/listings`;
  if (status) {
    url += `?status=${status}`;
  }

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch listings');
  }

  const response = await res.json();
  // API returns paginated format: { data: [...], count, hasMore }
  const listings = response.data || response;
  return listings.map((listing: Record<string, unknown>) => ({
    id: listing.id,
    combination: listing.combination,
    state: listing.state,
    plateType: listing.plate_type,
    colorScheme: listing.color_scheme,
    price: listing.price,
    status: listing.status,
    slug: listing.slug,
    viewsCount: listing.views_count,
    isFeatured: listing.is_featured,
    boostExpiresAt: listing.boost_expires_at,
    hasPaid: listing.has_paid || false,
    bumpsRemaining: listing.bumps_remaining || 0,
    bumpedAt: listing.bumped_at,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
  }));
}

export interface UpdateListingData {
  combination?: string;
  state?: string;
  plateType?: string;
  colorScheme?: string;
  sizeFormats?: [string, string];
  material?: string;
  vehicleType?: string;
  price?: number;
  isOpenToOffers?: boolean;
  description?: string;
  status?: 'draft' | 'active' | 'sold';
  photoUrls?: string[];
}

export interface UpdateListingResult {
  success: boolean;
  listing?: {
    id: string;
    status: string;
    [key: string]: unknown;
  };
}

export async function updateListing(
  accessToken: string,
  listingId: string,
  data: UpdateListingData
): Promise<UpdateListingResult> {
  const url = `${API_BASE_URL}/api/listings/${listingId}`;

  const apiData: Record<string, unknown> = {};
  if (data.combination !== undefined) apiData.combination = data.combination;
  if (data.state !== undefined) apiData.state = data.state;
  if (data.plateType !== undefined) apiData.plate_type = data.plateType;
  if (data.colorScheme !== undefined) apiData.color_scheme = data.colorScheme;
  if (data.sizeFormats !== undefined) apiData.size_formats = data.sizeFormats;
  if (data.material !== undefined) apiData.material = data.material;
  if (data.vehicleType !== undefined) apiData.vehicle_type = data.vehicleType;
  if (data.price !== undefined) apiData.price = data.price;
  if (data.isOpenToOffers !== undefined) apiData.is_open_to_offers = data.isOpenToOffers;
  if (data.description !== undefined) apiData.description = data.description;
  if (data.status !== undefined) apiData.status = data.status;
  if (data.photoUrls !== undefined) apiData.photo_urls = data.photoUrls;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to update listing');
  }

  const listing = await res.json();
  return { success: true, listing };
}

export async function deleteListing(
  accessToken: string,
  listingId: string
): Promise<{ success: boolean }> {
  const url = `${API_BASE_URL}/api/listings/${listingId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to delete listing');
  }

  return { success: true };
}

// Bump a listing to top (Boost Pro feature)
export async function bumpListing(
  accessToken: string,
  listingId: string
): Promise<{ success: boolean; bumpsRemaining: number; bumpedAt: string }> {
  const url = `${API_BASE_URL}/api/listings/${listingId}/bump`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to bump listing');
  }

  const data = await res.json();
  return {
    success: data.success,
    bumpsRemaining: data.bumps_remaining,
    bumpedAt: data.bumped_at,
  };
}

// ============================================
// NOTIFICATIONS API
// ============================================

export type NotificationType = 'price_drop' | 'new_message' | 'listing_sold' | 'boost_expiring' | 'system';

export interface NotificationListing {
  id: string;
  combination: string;
  state: AustralianState;
  slug: string;
  price: number;
  colorScheme?: PlateColorScheme;
}

export interface NotificationMetadata {
  oldPrice?: number;
  newPrice?: number;
  dropPercent?: number;
  dropAmount?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  listingId?: string;
  conversationId?: string;
  metadata?: NotificationMetadata;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  listing?: NotificationListing;
}

// API response types (snake_case from backend)
interface APINotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  listing_id?: string;
  conversation_id?: string;
  metadata?: {
    old_price?: number;
    new_price?: number;
    drop_percent?: number;
    drop_amount?: number;
  };
  is_read: boolean;
  read_at?: string;
  created_at: string;
  listing?: {
    id: string;
    combination: string;
    state: AustralianState;
    slug: string;
    price: number;
    color_scheme?: PlateColorScheme;
  };
}

function transformNotification(api: APINotification): AppNotification {
  return {
    id: api.id,
    userId: api.user_id,
    type: api.type as NotificationType,
    title: api.title,
    body: api.body,
    listingId: api.listing_id,
    conversationId: api.conversation_id,
    metadata: api.metadata ? {
      oldPrice: api.metadata.old_price,
      newPrice: api.metadata.new_price,
      dropPercent: api.metadata.drop_percent,
      dropAmount: api.metadata.drop_amount,
    } : undefined,
    isRead: api.is_read,
    readAt: api.read_at,
    createdAt: api.created_at,
    listing: api.listing ? {
      id: api.listing.id,
      combination: api.listing.combination,
      state: api.listing.state,
      slug: api.listing.slug,
      price: api.listing.price,
      colorScheme: api.listing.color_scheme,
    } : undefined,
  };
}

// Get notifications for authenticated user
export async function getNotifications(
  accessToken: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
): Promise<{ notifications: AppNotification[]; count: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());
  if (options.unreadOnly) params.set('unread', 'true');

  const url = `${API_BASE_URL}/api/notifications?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }

  const data: { data: APINotification[]; count: number; has_more: boolean } = await res.json();
  return {
    notifications: (data.data || []).map(transformNotification),
    count: data.count || 0,
    hasMore: data.has_more || false,
  };
}

// Get unread notification count
export async function getUnreadNotificationCount(accessToken: string): Promise<number> {
  const url = `${API_BASE_URL}/api/notifications/unread-count`;

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

// Mark a notification as read
export async function markNotificationRead(accessToken: string, notificationId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/notifications/${notificationId}/read`;

  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  // Ignore errors for marking read - not critical
}

// Mark all notifications as read
export async function markAllNotificationsRead(accessToken: string): Promise<void> {
  const url = `${API_BASE_URL}/api/notifications/mark-all-read`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  // Ignore errors - not critical
}

// Delete a notification
export async function deleteNotification(accessToken: string, notificationId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/notifications/${notificationId}`;

  await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  // Ignore errors - not critical
}

// Upload a photo to Supabase Storage
export async function uploadPhoto(
  accessToken: string,
  file: File,
  listingId?: string
): Promise<{ url: string; path: string }> {
  const url = `${API_BASE_URL}/api/storage/upload`;

  const formData = new FormData();
  formData.append('file', file);
  if (listingId) {
    formData.append('listing_id', listingId);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to upload photo');
  }

  return res.json();
}

// Delete a photo from Supabase Storage
export async function deletePhoto(
  accessToken: string,
  path: string
): Promise<{ success: boolean }> {
  const url = `${API_BASE_URL}/api/storage/delete?path=${encodeURIComponent(path)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to delete photo');
  }

  return { success: true };
}

// ============================================
// REPORT LISTING API
// ============================================

export type ReportReason =
  | 'inappropriate_content'
  | 'suspected_fraud'
  | 'incorrect_information'
  | 'already_sold'
  | 'other';

export async function reportListing(
  accessToken: string,
  listingId: string,
  reason: ReportReason,
  details?: string
): Promise<{ reported: boolean }> {
  const url = `${API_BASE_URL}/api/listings/${listingId}/report`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
      details: details?.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message || errorData.message;
    throw new Error(errorMessage || 'Failed to report listing');
  }

  return res.json();
}

// ============================================================================
// ADMIN - Promo Code Management
// ============================================================================

export interface PromoCode {
  id: string;
  code: string;
  type: 'welcome' | 'sourced' | 'manual' | 'free_listing';
  discountType: string;
  discountValue: number;
  appliesTo: string;
  maxUses: number;
  timesUsed: number;
  redeemedBy: string | null;
  redeemedAt: string | null;
  listingId: string | null;
  expiresAt: string | null;
  source: string | null;
  sourceUrl: string | null;
  campaign: string | null;
  status: 'active' | 'redeemed' | 'expired' | 'superseded';
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  users?: { email: string; fullName: string } | null;
  redemptions?: { count: number }[];
}

export interface PromoStats {
  totalCodes: number;
  welcomeCodes: number;
  sourcedCodes: number;
  manualCodes: number;
  totalRedemptions: number;
  activeWelcomeCodes: number;
  flaggedUsers: number;
  pageViewsLast7Days: number;
}

export interface PromoRedemption {
  id: string;
  redeemedAt: string;
  source: string | null;
  promoCodes: { code: string; type: string };
  users: { email: string; fullName: string };
}

export interface FlaggedAttempt {
  id: string;
  userId: string;
  promoCodeId: string | null;
  attemptCount: number;
  lastError: string | null;
  flaggedAt: string;
  resolvedAt: string | null;
  notes: string | null;
  users: { email: string; fullName: string; createdAt: string };
  promoCodes: { code: string; type: string } | null;
}

export interface SourceStats {
  source: string;
  campaign: string | null;
  totalCodes: number;
  totalUses: number;
  maxPossibleUses: number;
  activeCodes: number;
  pageViews: number;
  conversionRate: string;
}

// Transform snake_case API response to camelCase
function transformPromoCode(api: Record<string, unknown>): PromoCode {
  return {
    id: api.id as string,
    code: api.code as string,
    type: api.type as PromoCode['type'],
    discountType: (api.discount_type || 'percentage') as string,
    discountValue: (api.discount_value || 100) as number,
    appliesTo: (api.applies_to || 'basic_listing') as string,
    maxUses: api.max_uses as number,
    timesUsed: api.times_used as number,
    redeemedBy: api.redeemed_by as string | null,
    redeemedAt: api.redeemed_at as string | null,
    listingId: api.listing_id as string | null,
    expiresAt: api.expires_at as string | null,
    source: api.source as string | null,
    sourceUrl: api.source_url as string | null,
    campaign: api.campaign as string | null,
    status: (api.status || 'active') as PromoCode['status'],
    isActive: api.is_active as boolean,
    createdAt: api.created_at as string,
    updatedAt: api.updated_at as string | null,
    users: api.users as { email: string; fullName: string } | null,
    redemptions: api.redemptions as { count: number }[] | undefined,
  };
}

// Get promo dashboard stats
export async function getPromoStats(accessToken: string): Promise<{
  stats: PromoStats;
  recentRedemptions: PromoRedemption[];
}> {
  const url = `${API_BASE_URL}/api/admin/promos/stats`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch promo stats');
  }

  const data = await res.json();
  return {
    stats: data.stats,
    recentRedemptions: (data.recentRedemptions || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      redeemedAt: r.redeemed_at,
      source: r.source,
      promoCodes: r.promo_codes,
      users: r.users,
    })),
  };
}

// List promo codes with filters
export async function getPromoCodes(
  accessToken: string,
  params?: {
    type?: string;
    status?: string;
    campaign?: string;
    source?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  codes: PromoCode[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.campaign) searchParams.set('campaign', params.campaign);
  if (params?.source) searchParams.set('source', params.source);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/admin/promos?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch promo codes');
  }

  const data = await res.json();
  return {
    codes: (data.codes || []).map(transformPromoCode),
    pagination: data.pagination,
  };
}

// Create a promo code
export async function createPromoCode(
  accessToken: string,
  params: {
    code: string;
    type: 'sourced' | 'manual';
    maxUses?: number;
    expiresAt?: string;
    source?: string;
    sourceUrl?: string;
    campaign?: string;
  }
): Promise<PromoCode> {
  const url = `${API_BASE_URL}/api/admin/promos`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: params.code,
      type: params.type,
      max_uses: params.maxUses || 1,
      expires_at: params.expiresAt,
      source: params.source,
      source_url: params.sourceUrl,
      campaign: params.campaign,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to create promo code');
  }

  const data = await res.json();
  return transformPromoCode(data.code);
}

// Update a promo code
export async function updatePromoCode(
  accessToken: string,
  id: string,
  updates: {
    isActive?: boolean;
    status?: string;
    maxUses?: number;
    expiresAt?: string | null;
    campaign?: string | null;
    source?: string | null;
    sourceUrl?: string | null;
  }
): Promise<PromoCode> {
  const url = `${API_BASE_URL}/api/admin/promos/${id}`;

  const body: Record<string, unknown> = {};
  if (updates.isActive !== undefined) body.is_active = updates.isActive;
  if (updates.status !== undefined) body.status = updates.status;
  if (updates.maxUses !== undefined) body.max_uses = updates.maxUses;
  if (updates.expiresAt !== undefined) body.expires_at = updates.expiresAt;
  if (updates.campaign !== undefined) body.campaign = updates.campaign;
  if (updates.source !== undefined) body.source = updates.source;
  if (updates.sourceUrl !== undefined) body.source_url = updates.sourceUrl;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update promo code');
  }

  const data = await res.json();
  return transformPromoCode(data.code);
}

// Bulk create promo codes
export async function bulkCreatePromoCodes(
  accessToken: string,
  params: {
    prefix: string;
    count: number;
    type: 'sourced' | 'manual';
    maxUses?: number;
    expiresAt?: string;
    source?: string;
    sourceUrl?: string;
    campaign?: string;
  }
): Promise<PromoCode[]> {
  const url = `${API_BASE_URL}/api/admin/promos/bulk`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prefix: params.prefix,
      count: params.count,
      type: params.type,
      max_uses: params.maxUses || 1,
      expires_at: params.expiresAt,
      source: params.source,
      source_url: params.sourceUrl,
      campaign: params.campaign,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to bulk create promo codes');
  }

  const data = await res.json();
  return (data.codes || []).map(transformPromoCode);
}

// Get flagged attempts
export async function getFlaggedAttempts(accessToken: string): Promise<FlaggedAttempt[]> {
  const url = `${API_BASE_URL}/api/admin/promos/flagged`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch flagged attempts');
  }

  const data = await res.json();
  return (data.flagged || []).map((f: Record<string, unknown>) => ({
    id: f.id,
    userId: f.user_id,
    promoCodeId: f.promo_code_id,
    attemptCount: f.attempt_count,
    lastError: f.last_error,
    flaggedAt: f.flagged_at,
    resolvedAt: f.resolved_at,
    notes: f.notes,
    users: f.users,
    promoCodes: f.promo_codes,
  }));
}

// Resolve a flagged attempt
export async function resolveFlaggedAttempt(
  accessToken: string,
  id: string,
  notes?: string
): Promise<void> {
  const url = `${API_BASE_URL}/api/admin/promos/flagged/${id}/resolve`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to resolve flagged attempt');
  }
}

// Kill switch for promo codes
export async function promoKillSwitch(
  accessToken: string,
  action: 'disable_all' | 'disable_sourced' | 'disable_welcome' | 'enable_all',
  campaign?: string
): Promise<{ affectedCount: number }> {
  const url = `${API_BASE_URL}/api/admin/promos/kill-switch`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, campaign }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to execute kill switch');
  }

  return res.json();
}

// Get source performance stats
export async function getSourceStats(accessToken: string): Promise<SourceStats[]> {
  const url = `${API_BASE_URL}/api/admin/promos/sources`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch source stats');
  }

  const data = await res.json();
  return data.sources || [];
}

// Get all campaigns
export async function getCampaigns(accessToken: string): Promise<string[]> {
  const url = `${API_BASE_URL}/api/admin/promos/campaigns`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch campaigns');
  }

  const data = await res.json();
  return data.campaigns || [];
}
