'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import { SearchBar } from './SearchBar';
import { MessagesIcon } from './MessagesIcon';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-0">
            <span className="text-xl font-semibold text-[var(--text)]">Aus</span>
            <span className="text-xl font-semibold text-[var(--green)]">Plates</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <Suspense fallback={<div className="h-10 bg-[var(--background-subtle)] rounded-xl animate-pulse" />}>
              <SearchBar compact placeholder="Search plates..." />
            </Suspense>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/plates"
              className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Browse
            </Link>
          </nav>

          {/* CTA / User Menu */}
          <div className="flex items-center gap-4">
            {!isLoading && isAuthenticated && user ? (
              <>
                <Link
                  href="/create"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--green)] text-white text-sm font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Sell
                </Link>
                <Link
                  href="/my-listings"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium">My Listings</span>
                </Link>
                <Link
                  href="/saved"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-sm font-medium">Saved</span>
                </Link>
                <MessagesIcon className="hidden md:flex" />
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[var(--green)]">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
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

            <span className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-[var(--text-secondary)] text-sm font-medium rounded-xl">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Coming Soon
            </span>

            {/* Mobile menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
