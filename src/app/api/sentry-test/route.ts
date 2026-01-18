// This endpoint is used to test that Sentry is working correctly.
// It throws an error that should be captured by Sentry.
// Access it at /api/sentry-test to trigger a test error.

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Log that we're about to throw a test error
  Sentry.addBreadcrumb({
    category: 'sentry-test',
    message: 'About to throw a test error',
    level: 'info',
  });

  // Throw a test error
  throw new Error('This is a test error from /api/sentry-test');
}

export async function POST() {
  // Alternative: manually capture an error without throwing
  const testError = new Error('Manual Sentry test error from POST /api/sentry-test');

  Sentry.captureException(testError, {
    tags: {
      source: 'sentry-test-endpoint',
      type: 'manual-capture',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Test error sent to Sentry',
  });
}
