/**
 * Analytics utility for tracking user behavior
 *
 * This module provides a privacy-respecting analytics interface.
 * Analytics are only tracked when user consent is given.
 *
 * @see docs/ANALYTICS_SETUP.md for configuration instructions
 */

// Type definitions for analytics
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'consent' | 'set',
      target: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// Standard event names for consistency
export const AnalyticsEvents = {
  // Listing events
  LISTING_VIEWED: 'listing_viewed',
  LISTING_SAVED: 'listing_saved',
  LISTING_UNSAVED: 'listing_unsaved',
  LISTING_SHARED: 'listing_shared',
  LISTING_CREATED: 'listing_created',
  LISTING_PUBLISHED: 'listing_published',
  LISTING_BOOSTED: 'listing_boosted',

  // Search events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',

  // User events
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATED: 'profile_updated',

  // Messaging events
  MESSAGE_SENT: 'message_sent',
  CONVERSATION_STARTED: 'conversation_started',

  // Payment events
  CHECKOUT_STARTED: 'checkout_started',
  PAYMENT_COMPLETED: 'payment_completed',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

// Storage key for consent
const CONSENT_KEY = 'analytics_consent';

/**
 * Check if analytics consent has been given
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  // Respect Do Not Track
  if (navigator.doNotTrack === '1') {
    return false;
  }

  return localStorage.getItem(CONSENT_KEY) === 'true';
}

/**
 * Set analytics consent
 */
export function setAnalyticsConsent(consent: boolean): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(CONSENT_KEY, String(consent));

  // Update Google Analytics consent
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: consent ? 'granted' : 'denied',
    });
  }
}

/**
 * Get current consent status
 * Returns null if not yet decided
 */
export function getAnalyticsConsent(): boolean | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === null) return null;
  return stored === 'true';
}

/**
 * Track an analytics event
 * Only sends if consent is given
 */
export function trackEvent(
  event: AnalyticsEvent | string,
  params?: Record<string, unknown>
): void {
  if (!hasAnalyticsConsent()) {
    return;
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', event, params);
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, params);
  }
}

/**
 * Track a page view
 * Typically called by the analytics provider automatically
 */
export function trackPageView(path: string, title?: string): void {
  if (!hasAnalyticsConsent()) {
    return;
  }

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
}

/**
 * Set user properties for attribution
 * Call after user login
 */
export function setUserProperties(properties: {
  userId?: string;
  userType?: 'buyer' | 'seller' | 'both';
  state?: string;
}): void {
  if (!hasAnalyticsConsent()) {
    return;
  }

  if (window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
}

/**
 * Clear user properties on logout
 */
export function clearUserProperties(): void {
  if (window.gtag) {
    window.gtag('set', 'user_properties', {
      userId: null,
      userType: null,
      state: null,
    });
  }
}

/**
 * Check if analytics are configured (DSN set)
 */
export function isAnalyticsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}
