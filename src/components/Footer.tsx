'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Hide on admin subdomain (client check) or admin routes (server + client check)
  if (pathname?.startsWith('/ap-admin')) {
    return null;
  }
  if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
    return null;
  }

  return (
    <footer className="bg-[var(--background-subtle)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-0 mb-4">
              <span className="text-xl font-semibold text-[var(--text)]">Aus</span>
              <span className="text-xl font-semibold text-[var(--green)]">Plates</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Australia&apos;s marketplace for personalised number plates.
            </p>
            {/* App Coming Soon */}
            <span className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-[var(--text-secondary)] text-sm font-medium rounded-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              iOS App Coming Soon
            </span>
          </div>

          {/* Browse by State */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Browse by State</h3>
            <ul className="space-y-2">
              {['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'].map((state) => (
                <li key={state}>
                  <Link
                    href={`/plates/${state.toLowerCase()}`}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                  >
                    {state} Plates
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] text-center">
            © {new Date().getFullYear()} AusPlates. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
