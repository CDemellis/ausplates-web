'use client';

import Link from 'next/link';

export default function PrototypesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
            Create Listing Prototypes
          </h1>
          <p className="text-[var(--text-secondary)]">
            Compare three different approaches to the listing flow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Prototype A */}
          <Link
            href="/create/prototype-a"
            className="group bg-white rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-[var(--green)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--green)]/20 transition-colors">
              <span className="text-2xl font-bold text-[var(--green)]">A</span>
            </div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
              Configurator Style
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Apple/Tesla vibe. Split layout with live preview on left,
              configuration on right. Everything in viewport, no scrolling.
            </p>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              <li>• Single viewport experience</li>
              <li>• Live plate preview</li>
              <li>• Sticky pricing bar</li>
            </ul>
          </Link>

          {/* Prototype B */}
          <Link
            href="/create/prototype-b"
            className="group bg-white rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--gold)]/20 transition-colors">
              <span className="text-2xl font-bold text-[var(--gold)]">B</span>
            </div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
              Plan First
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Lead with value. Show pricing tiers upfront, then collect
              plate details. Makes upsell the entry point.
            </p>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              <li>• Value-first approach</li>
              <li>• Big visual tier cards</li>
              <li>• Clear feature comparison</li>
            </ul>
          </Link>

          {/* Prototype C */}
          <Link
            href="/create/prototype-c"
            className="group bg-white rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <span className="text-2xl font-bold text-blue-500">C</span>
            </div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
              Horizontal Flow
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Full-width cards that slide horizontally. Each step is a
              focused task. Swipe or click to advance.
            </p>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              <li>• Carousel-style navigation</li>
              <li>• One task per screen</li>
              <li>• Floating plate preview</li>
            </ul>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/create"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ← Back to current create listing
          </Link>
        </div>
      </div>
    </div>
  );
}
