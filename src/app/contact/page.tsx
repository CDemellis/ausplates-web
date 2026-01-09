import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | AusPlates',
  description: 'Get in touch with the AusPlates team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Contact Us</h1>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
          <p className="text-[var(--text-secondary)] mb-8">
            Have a question or need help? We&apos;re here to assist you.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)] mb-2">Email Support</h2>
              <p className="text-[var(--text-secondary)]">
                For general enquiries and support, email us at:
              </p>
              <a
                href="mailto:support@ausplates.app"
                className="text-[var(--green)] hover:underline font-medium"
              >
                support@ausplates.app
              </a>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--text)] mb-2">Response Time</h2>
              <p className="text-[var(--text-secondary)]">
                We aim to respond to all enquiries within 24-48 hours during business days.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--text)] mb-2">Report an Issue</h2>
              <p className="text-[var(--text-secondary)]">
                If you need to report a listing or user, please include the listing URL and a description of the issue in your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
