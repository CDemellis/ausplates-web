/**
 * Server-side Sentry initialization for serverless environments (Vercel)
 *
 * The instrumentation.ts hook doesn't reliably run on Vercel serverless functions.
 * This utility ensures Sentry is initialized before capturing errors.
 */

import * as Sentry from '@sentry/nextjs';

let isInitialized = false;

export function ensureSentryInitialized() {
  if (isInitialized || Sentry.getClient()) {
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
    debug: false,
    enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'false',
  });

  isInitialized = true;
}

/**
 * Capture an exception with automatic initialization and flush for serverless
 */
export async function captureServerException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<string | undefined> {
  ensureSentryInitialized();

  const eventId = Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
  });

  // Flush for serverless - wait up to 2 seconds
  await Sentry.flush(2000);

  return eventId;
}

// Re-export Sentry for convenience
export { Sentry };
