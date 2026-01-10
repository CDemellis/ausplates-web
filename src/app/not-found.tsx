import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Plate icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-[var(--background-subtle)] rounded-2xl flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-[var(--text)] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
          moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/plates"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--background-subtle)] text-[var(--text)] font-medium rounded-full hover:bg-[var(--border)] transition-colors"
          >
            Browse Plates
          </Link>
        </div>
      </div>
    </div>
  );
}
