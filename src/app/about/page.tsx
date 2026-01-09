import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | AusPlates',
  description: 'Learn about AusPlates - Australia\'s marketplace for personalised number plates.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-8">About AusPlates</h1>

        <div className="prose prose-lg text-[var(--text-secondary)] space-y-6">
          <p>
            AusPlates is Australia&apos;s dedicated marketplace for buying and selling personalised number plates.
          </p>

          <p>
            We connect plate enthusiasts across the country, making it easy to find that perfect combination
            or sell your plates to interested buyers.
          </p>

          <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">Our Mission</h2>
          <p>
            To create the most trusted and user-friendly platform for Australians to trade personalised plates,
            with transparency and security at the core of every transaction.
          </p>

          <h2 className="text-xl font-semibold text-[var(--text)] mt-8 mb-4">Why AusPlates?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dedicated platform for Australian number plates</li>
            <li>Secure messaging between buyers and sellers</li>
            <li>Listings from all states and territories</li>
            <li>Easy-to-use mobile app available on iOS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
