'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text)]"
        aria-label="Menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-[var(--border)] z-50 md:hidden">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                href="/plates"
                className="px-4 py-3 text-base font-medium text-[var(--text)] rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Browse All Plates
              </Link>
              <div className="border-t border-[var(--border)] my-2" />
              <p className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Browse by State
              </p>
              {['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'].map((state) => (
                <Link
                  key={state}
                  href={`/plates/${state.toLowerCase()}`}
                  className="px-4 py-2.5 text-base text-[var(--text-secondary)] rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {state} Plates
                </Link>
              ))}
              <div className="border-t border-[var(--border)] my-2" />

              {/* Profile / Sign In */}
              {!isLoading && isAuthenticated && user ? (
                <>
                  <Link
                    href="/create"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Sell Your Plate
                  </Link>
                  <div className="border-t border-[var(--border)] my-2" />
                  <Link
                    href="/saved"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[var(--text)] rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span>Saved Plates</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[var(--text)] rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span>Messages</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[var(--text)] rounded-lg hover:bg-[var(--background-subtle)] transition-colors"
                    onClick={() => setIsOpen(false)}
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
                    <span>Profile & Settings</span>
                  </Link>
                </>
              ) : !isLoading ? (
                <Link
                  href="/signin"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              ) : null}

              <Link
                href="https://apps.apple.com/app/ausplates"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Get the App
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
