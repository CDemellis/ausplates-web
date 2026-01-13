# Sentry Error Tracking Setup

This document explains how to configure Sentry error tracking for the AusPlates web application.

## Overview

Sentry is integrated to capture and report:
- JavaScript runtime errors
- React component errors (via ErrorBoundary)
- Next.js page errors (via error.tsx)
- Unhandled promise rejections
- Console errors in production

## Installation

The Sentry SDK is already configured. If you need to reinstall:

```bash
npm install @sentry/nextjs
```

## Configuration

### 1. Environment Variables

Add these to your `.env.local` file (development) and Vercel environment variables (production):

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here

# Optional
SENTRY_AUTH_TOKEN=your-auth-token-for-source-maps
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=ausplates-web
```

### 2. Get Your DSN

1. Go to [sentry.io](https://sentry.io)
2. Create a new project (select Next.js)
3. Copy the DSN from Project Settings > Client Keys

### 3. File Structure

```
ausplates-web/
├── sentry.client.config.ts    # Client-side Sentry init
├── sentry.server.config.ts    # Server-side Sentry init
├── sentry.edge.config.ts      # Edge runtime Sentry init
├── next.config.ts             # withSentryConfig wrapper
└── src/
    └── lib/
        └── sentry.ts          # Sentry utility functions
```

## Usage

### Automatic Error Capture

All unhandled errors are automatically captured. No code changes needed.

### Manual Error Reporting

```typescript
import { captureError, captureMessage, setUserContext } from '@/lib/sentry';

// Report an error with context
captureError(error, {
  tags: { feature: 'payments' },
  extra: { listingId: '123', amount: 999 }
});

// Report a message
captureMessage('User completed checkout', 'info');

// Set user context after login
setUserContext({
  id: user.id,
  email: user.email,
});
```

### Error Boundary Integration

The ErrorBoundary component automatically reports errors to Sentry:

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Privacy & PII

Sentry is configured to:
- Scrub sensitive data (passwords, tokens, credit cards)
- Not send user emails (only hashed user IDs)
- Respect Do Not Track headers
- Sample transactions at 10% in production

## Testing

1. Set `NEXT_PUBLIC_SENTRY_DSN` in `.env.local`
2. Throw a test error:

```tsx
<button onClick={() => { throw new Error('Test Sentry error'); }}>
  Test Sentry
</button>
```

3. Check your Sentry dashboard for the error

## Vercel Deployment

Add these environment variables in Vercel:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@xxx.ingest.sentry.io/xxx` | Required |
| `SENTRY_AUTH_TOKEN` | `sntrys_xxx` | For source maps upload |
| `SENTRY_ORG` | `your-org` | Your Sentry org slug |
| `SENTRY_PROJECT` | `ausplates-web` | Project name |

## Troubleshooting

### Errors not appearing in Sentry

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify the DSN is correct (no typos)
3. Check browser console for Sentry initialization errors
4. Ensure you're not in development mode with debug disabled

### Source maps not working

1. Verify `SENTRY_AUTH_TOKEN` has correct permissions
2. Check build logs for source map upload errors
3. Ensure release version matches deployed code

## Resources

- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Privacy & Data Scrubbing](https://docs.sentry.io/product/data-management-settings/scrubbing/)
