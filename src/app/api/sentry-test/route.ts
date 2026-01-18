// This endpoint is used to test that Sentry is working correctly.
// Access it at /api/sentry-test to trigger a test error.

import { NextResponse } from 'next/server';
import { captureServerException } from '@/lib/sentry-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Throw a test error (will be caught by error boundary)
  throw new Error('This is a test error from /api/sentry-test');
}

export async function POST() {
  // Manually capture an error without throwing
  const testError = new Error('Manual Sentry test error from POST /api/sentry-test');

  const eventId = await captureServerException(testError, {
    tags: {
      source: 'sentry-test-endpoint',
      type: 'manual-capture',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Test error sent to Sentry',
    eventId,
  });
}
