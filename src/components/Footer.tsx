import Link from 'next/link';

export function Footer() {
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
            {/* App Store Badge */}
            <Link
              href="https://apps.apple.com/app/ausplates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/app-store-badge.svg"
                alt="Download on the App Store"
                className="h-10"
              />
            </Link>
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
