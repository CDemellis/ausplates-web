import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works | AusPlates',
  description: 'Learn how to buy and sell personalised number plates on AusPlates.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-8">How It Works</h1>

        <div className="space-y-12">
          {/* Buying */}
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Buying a Plate</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--green)] text-white rounded-full flex items-center justify-center font-semibold">1</div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">Browse Listings</h3>
                  <p className="text-[var(--text-secondary)]">Search for plates by combination, state, or style. Use filters to find exactly what you&apos;re looking for.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--green)] text-white rounded-full flex items-center justify-center font-semibold">2</div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">Contact the Seller</h3>
                  <p className="text-[var(--text-secondary)]">Found a plate you like? Send a message to the seller to ask questions or make an offer.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--green)] text-white rounded-full flex items-center justify-center font-semibold">3</div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">Complete the Transfer</h3>
                  <p className="text-[var(--text-secondary)]">Once you agree on a price, arrange payment and transfer directly with the seller through your state&apos;s transport authority.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Selling */}
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Selling Your Plate</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--green)] text-white rounded-full flex items-center justify-center font-semibold">1</div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">Create a Listing</h3>
                  <p className="text-[var(--text-secondary)]">Enter your plate details, set your price, and add photos. It only takes a few minutes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--green)] text-white rounded-full flex items-center justify-center font-semibold">2</div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">Pay the Listing Fee</h3>
                  <p className="text-[var(--text-secondary)]">A small listing fee of $9.99 gets your plate in front of thousands of buyers. Optional boosts are available for more visibility.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--green)] text-white rounded-full flex items-center justify-center font-semibold">3</div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">Respond to Enquiries</h3>
                  <p className="text-[var(--text-secondary)]">Interested buyers will message you. Negotiate and agree on terms, then complete the transfer through your state&apos;s transport authority.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-[var(--border)]">
            <p className="text-[var(--text-secondary)] mb-4">Ready to get started?</p>
            <div className="flex gap-4">
              <Link
                href="/plates"
                className="px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
              >
                Browse Plates
              </Link>
              <Link
                href="/create"
                className="px-6 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
              >
                Sell Your Plate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
