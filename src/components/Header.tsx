'use client';

import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '@/lib/auth-context';

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const;

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0">
            <span className="text-xl font-semibold text-[var(--text)]">Aus</span>
            <span className="text-xl font-semibold text-[var(--green)]">Plates</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/plates"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Browse
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" />
            {STATES.map((state) => (
              <Link
                key={state}
                href={`/plates/${state.toLowerCase()}`}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
              >
                {state}
              </Link>
            ))}
          </nav>

          {/* CTA / User Menu */}
          <div className="flex items-center gap-4">
            {!isLoading && isAuthenticated && user ? (
              <>
                <Link
                  href="/saved"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">Saved</span>
                </Link>
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-[var(--green)]">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--text)]">{user.fullName.split(' ')[0]}</span>
                </Link>
              </>
            ) : !isLoading ? (
              <Link
                href="/signin"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                Sign In
              </Link>
            ) : null}

            <Link
              href="https://apps.apple.com/app/ausplates"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-[var(--green)] text-white text-sm font-medium rounded-xl hover:bg-[#006B31] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Get the App
            </Link>

            {/* Mobile menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
