import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | AusPlates',
  description: 'Terms of Service for using the AusPlates platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Terms of Service</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: January 2026</p>

        <div className="prose prose-lg text-[var(--text-secondary)] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AusPlates, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">2. Description of Service</h2>
            <p>
              AusPlates is a marketplace platform that connects buyers and sellers of personalised number plates in Australia. We provide the platform for listing and discovering plates, but we are not a party to any transaction between users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 18 years old to use our services</li>
              <li>One account per person</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">4. Listing Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must own or have authority to sell any plate you list</li>
              <li>Listings must be accurate and not misleading</li>
              <li>Pricing must be genuine (no fake prices)</li>
              <li>Photos must be of the actual plate</li>
              <li>No offensive or inappropriate content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">5. Transactions</h2>
            <p>
              AusPlates facilitates connections between buyers and sellers. All transactions, including payment and plate transfers, are conducted directly between users through official state transport authority processes. AusPlates is not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The completion of any sale</li>
              <li>The condition or legitimacy of plates</li>
              <li>Payment disputes between users</li>
              <li>Transfer issues with transport authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">6. Fees</h2>
            <p>
              Sellers pay a listing fee to publish plates on the platform. Listing fees are non-refundable once a listing is published. Current pricing is available on our pricing page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">7. Prohibited Conduct</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fraudulent or misleading listings</li>
              <li>Harassment of other users</li>
              <li>Attempting to circumvent the platform</li>
              <li>Automated access or scraping</li>
              <li>Any illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, without notice or refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">9. Limitation of Liability</h2>
            <p>
              AusPlates is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from your use of the platform or transactions with other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@ausplates.app" className="text-[var(--green)] hover:underline">
                legal@ausplates.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
