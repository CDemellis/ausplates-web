'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Error icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-[var(--text)] mb-2">Oops!</h1>
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
          Something went wrong
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          We encountered an unexpected error. Please try again, or contact
          support if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--background-subtle)] text-[var(--text)] font-medium rounded-full hover:bg-[var(--border)] transition-colors"
          >
            Go Home
          </a>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-[var(--text-muted)]">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
