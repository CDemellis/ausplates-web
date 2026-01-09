import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing | AusPlates',
  description: 'Simple, transparent pricing for listing your personalised number plates on AusPlates.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-4">Simple Pricing</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            No hidden fees. No commission on sales. Just a simple listing fee.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Standard Listing */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">Standard Listing</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold text-[var(--text)]">$9.99</span>
            </div>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)] mb-6">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Listed until sold
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Up to 5 photos
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Secure messaging
              </li>
            </ul>
          </div>

          {/* 7-Day Boost */}
          <div className="bg-white rounded-2xl border-2 border-[var(--green)] p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--green)] text-white text-xs font-semibold rounded-full">
              POPULAR
            </div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">7-Day Boost</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold text-[var(--text)]">$19.98</span>
            </div>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)] mb-6">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Standard
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured for 7 days
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority in search
              </li>
            </ul>
          </div>

          {/* 30-Day Boost */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">30-Day Boost</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold text-[var(--text)]">$24.99</span>
            </div>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)] mb-6">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Standard
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured for 30 days
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Best value
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--text-secondary)] mb-6">
            Browsing is always free. Only pay when you list a plate for sale.
          </p>
          <Link
            href="/create"
            className="inline-flex px-8 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
          >
            List Your Plate
          </Link>
        </div>
      </div>
    </div>
  );
}
