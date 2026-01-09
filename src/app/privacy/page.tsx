import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AusPlates',
  description: 'Privacy Policy for AusPlates - how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Privacy Policy</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: January 2026</p>

        <div className="prose prose-lg text-[var(--text-secondary)] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">1. Information We Collect</h2>
            <p>When you use AusPlates, we may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address)</li>
              <li>Listing information (plate details, photos, pricing)</li>
              <li>Messages between users</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Process transactions</li>
              <li>Communicate with you about your account and listings</li>
              <li>Send important updates about the platform</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Other users (listing information, seller name)</li>
              <li>Service providers (hosting, payment processing)</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@ausplates.app" className="text-[var(--green)] hover:underline">
                privacy@ausplates.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
