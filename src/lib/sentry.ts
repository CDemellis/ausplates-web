/**
 * Sentry error tracking utilities
 *
 * This module provides a wrapper around Sentry for consistent error tracking.
 * If Sentry is not configured (no DSN), operations are no-ops.
 *
 * @see docs/SENTRY_SETUP.md for configuration instructions
 */

// Type definitions for Sentry-like interface
interface SentryScope {
  setTag: (key: string, value: string) => void;
  setExtra: (key: string, value: unknown) => void;
  setUser: (user: SentryUser | null) => void;
}

interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: SentryUser;
  level?: SeverityLevel;
}

// Check if Sentry is configured
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const IS_SENTRY_ENABLED = Boolean(SENTRY_DSN);

// Lazy-loaded Sentry module
let sentryModule: typeof import('@sentry/nextjs') | null = null;

async function getSentry() {
  if (!IS_SENTRY_ENABLED) return null;

  if (!sentryModule) {
    try {
      sentryModule = await import('@sentry/nextjs');
    } catch {
      console.warn('Sentry module not installed. Run: npm install @sentry/nextjs');
      return null;
    }
  }
  return sentryModule;
}

/**
 * Capture an error and send to Sentry
 */
export async function captureError(
  error: Error | unknown,
  context?: ErrorContext
): Promise<string | undefined> {
  const Sentry = await getSentry();
  if (!Sentry) {
    console.error('[Sentry disabled]', error);
    return undefined;
  }

  return Sentry.withScope((scope: SentryScope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.user) {
      scope.setUser(context.user);
    }

    if (error instanceof Error) {
      return Sentry.captureException(error);
    }
    return Sentry.captureException(new Error(String(error)));
  });
}

/**
 * Capture a message with optional severity level
 */
export async function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: ErrorContext
): Promise<string | undefined> {
  const Sentry = await getSentry();
  if (!Sentry) {
    console.log(`[Sentry disabled] ${level}: ${message}`);
    return undefined;
  }

  return Sentry.withScope((scope: SentryScope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    return Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for all subsequent events
 * Call after user login
 */
export async function setUserContext(user: SentryUser | null): Promise<void> {
  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export async function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: SeverityLevel;
  data?: Record<string, unknown>;
}): Promise<void> {
  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Create a wrapped function that reports errors to Sentry
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      await captureError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return IS_SENTRY_ENABLED;
}
