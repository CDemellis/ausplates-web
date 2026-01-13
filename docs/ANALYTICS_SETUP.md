# Analytics Setup

This document explains how to configure user behavior analytics for the AusPlates web application.

## Overview

Analytics helps understand:
- User journeys and conversion funnels
- Page performance and engagement
- Feature adoption and usage patterns
- Marketing campaign effectiveness

## Recommended Options

### 1. Google Analytics 4 (Recommended)

Free, comprehensive analytics with good privacy controls.

**Installation:**

```bash
npm install @next/third-parties
```

**Configuration in `layout.tsx`:**

```tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
```

**Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Track Events:**

```tsx
import { sendGAEvent } from '@next/third-parties/google';

// Track custom event
sendGAEvent('event', 'listing_viewed', {
  listing_id: listing.id,
  state: listing.state,
  plate_type: listing.plateType,
});
```

### 2. Plausible (Privacy-Focused)

Simple, privacy-respecting analytics. No cookies required.

**Installation:**

```bash
npm install next-plausible
```

**Configuration:**

```tsx
import PlausibleProvider from 'next-plausible';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="ausplates.app" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Mixpanel (Product Analytics)

Best for detailed user behavior and funnel analysis.

```bash
npm install mixpanel-browser
```

### 4. PostHog (Open Source)

Self-hostable, feature flags, session recording.

```bash
npm install posthog-js
```

## Privacy-Respecting Configuration

### Google Analytics 4 Privacy Settings

```tsx
// Disable personalized advertising
<GoogleAnalytics
  gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
  dataLayerName="dataLayer"
/>

// In GA4 admin:
// 1. Enable IP anonymization
// 2. Disable data sharing with Google
// 3. Set data retention to 2 months
// 4. Disable advertising features
```

### Consent Management

For GDPR/privacy compliance:

```tsx
'use client';

import { useState, useEffect } from 'react';

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('analytics_consent');
    if (stored !== null) {
      setConsent(stored === 'true');
    }
  }, []);

  const handleConsent = (value: boolean) => {
    localStorage.setItem('analytics_consent', String(value));
    setConsent(value);

    if (value) {
      // Enable analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg">
      <p>We use analytics to improve your experience.</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => handleConsent(true)}>Accept</button>
        <button onClick={() => handleConsent(false)}>Decline</button>
      </div>
    </div>
  );
}
```

## Key Events to Track

### Marketplace Events

| Event | Parameters | Purpose |
|-------|------------|---------|
| `listing_viewed` | `listing_id`, `state`, `plate_type` | Track listing engagement |
| `listing_saved` | `listing_id` | Track interest signals |
| `search_performed` | `query`, `filters`, `results_count` | Understand search behavior |
| `contact_seller` | `listing_id`, `method` | Track conversion intent |
| `listing_created` | `state`, `plate_type`, `boost_type` | Track seller behavior |
| `payment_completed` | `amount`, `product_type` | Track revenue |

### User Journey Events

| Event | Parameters | Purpose |
|-------|------------|---------|
| `signup_started` | `method` | Track funnel entry |
| `signup_completed` | `method` | Track conversion |
| `login` | `method` | Track retention |
| `profile_updated` | - | Track engagement |

### Implementation Example

```tsx
// lib/analytics.ts
export function trackEvent(event: string, params?: Record<string, unknown>) {
  // Only track if consent given
  if (localStorage.getItem('analytics_consent') !== 'true') {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

// Usage
trackEvent('listing_viewed', {
  listing_id: listing.id,
  state: listing.state,
});
```

## Do Not Track

Respect user browser settings:

```tsx
function shouldTrack(): boolean {
  // Respect Do Not Track
  if (navigator.doNotTrack === '1') {
    return false;
  }
  // Check consent
  return localStorage.getItem('analytics_consent') === 'true';
}
```

## Testing

1. Set up environment variables
2. Use Google Analytics Debug Mode extension
3. Check Real-time reports in GA4
4. Use browser DevTools to verify events

## Vercel Analytics (Alternative)

Vercel offers built-in analytics with Web Vitals:

```bash
npm install @vercel/analytics
```

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Resources

- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [Plausible Documentation](https://plausible.io/docs)
- [GDPR Compliance Guide](https://gdpr.eu/what-is-gdpr/)
