import { Metadata } from 'next';
import Link from 'next/link';

// Promo source configs
const PROMO_SOURCES: Record<string, {
  code: string;
  title: string;
  description: string;
  headline: string;
}> = {
  ozbargain: {
    code: 'OZBARGAIN-FREE',
    title: 'Free Listing for OzBargain Members',
    description: 'Get your first listing free on AusPlates - Australia\'s marketplace for personalised number plates.',
    headline: 'OzBargain Exclusive: List Your Plate for Free',
  },
  reddit: {
    code: 'REDDIT-FREE',
    title: 'Free Listing for Reddit Users',
    description: 'Get your first listing free on AusPlates - Australia\'s marketplace for personalised number plates.',
    headline: 'Reddit Exclusive: List Your Plate for Free',
  },
  facebook: {
    code: 'FACEBOOK-FREE',
    title: 'Free Listing for Facebook Users',
    description: 'Get your first listing free on AusPlates - Australia\'s marketplace for personalised number plates.',
    headline: 'Facebook Exclusive: List Your Plate for Free',
  },
  whirlpool: {
    code: 'WHIRLPOOL-FREE',
    title: 'Free Listing for Whirlpool Members',
    description: 'Get your first listing free on AusPlates - Australia\'s marketplace for personalised number plates.',
    headline: 'Whirlpool Exclusive: List Your Plate for Free',
  },
  default: {
    code: 'LAUNCH-FREE',
    title: 'Free Listing on AusPlates',
    description: 'Get your first listing free on AusPlates - Australia\'s marketplace for personalised number plates.',
    headline: 'Launch Special: List Your Plate for Free',
  },
};

interface Props {
  params: Promise<{ source: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { source } = await params;
  const config = PROMO_SOURCES[source.toLowerCase()] || PROMO_SOURCES.default;

  return {
    title: `${config.title} | AusPlates`,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'website',
      siteName: 'AusPlates',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
    },
  };
}

export default async function PromoLandingPage({ params }: Props) {
  const { source } = await params;
  const config = PROMO_SOURCES[source.toLowerCase()] || PROMO_SOURCES.default;

  // Track page view server-side
  if (process.env.NEXT_PUBLIC_API_URL) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo/page-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: source.toLowerCase() }),
    }).catch(() => {}); // Fire and forget
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Hero Section */}
      <div className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
            {config.headline}
          </h1>
          <p className="text-lg text-[#666666] mb-8 max-w-2xl mx-auto">
            {config.description}
          </p>

          {/* Code Display */}
          <div className="inline-block bg-[#F8F8F8] border-2 border-dashed border-[#00843D] rounded-lg p-6 mb-8">
            <div className="text-sm text-[#666666] mb-2">Your promo code:</div>
            <div className="text-3xl font-mono font-bold text-[#00843D] tracking-wider">
              {config.code}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-[#00843D] text-white rounded-lg font-semibold text-lg hover:bg-[#006B32] transition-colors"
            >
              Sign Up & Claim Your Free Listing
            </Link>
            <p className="text-sm text-[#999999]">
              Already have an account? <Link href="/signin" className="text-[#00843D] hover:underline">Sign in</Link> to apply your code.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-[#1A1A1A] text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Step number={1} title="Sign Up" description="Create your free account with email or Apple Sign In" />
          <Step number={2} title="List Your Plate" description="Add your personalised plate details and photos" />
          <Step number={3} title="Apply Code" description="Enter the promo code to publish for free" />
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white border-y border-[#EBEBEB]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-[#1A1A1A] text-center mb-12">
            Why AusPlates?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Benefit
              title="Australia-Wide Marketplace"
              description="Connect with buyers across all states and territories"
            />
            <Benefit
              title="Secure Messaging"
              description="Chat with buyers directly through our platform"
            />
            <Benefit
              title="Easy Listing"
              description="List your plate in minutes with our simple form"
            />
            <Benefit
              title="No Hidden Fees"
              description="Transparent pricing with no commission on sales"
            />
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4">
          Ready to List Your Plate?
        </h2>
        <p className="text-[#666666] mb-8">
          Use code <span className="font-mono font-bold text-[#00843D]">{config.code}</span> for a free listing
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-[#00843D] text-white rounded-lg font-semibold text-lg hover:bg-[#006B32] transition-colors"
        >
          Get Started Now
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-[#EBEBEB] py-8 text-center text-sm text-[#999999]">
        <p>
          <Link href="/terms" className="hover:underline">Terms</Link>
          {' • '}
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          {' • '}
          <Link href="/" className="hover:underline">AusPlates.app</Link>
        </p>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-[#00843D] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-sm text-[#666666]">{description}</p>
    </div>
  );
}

function Benefit({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 bg-[#00843D] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-[#1A1A1A] mb-1">{title}</h3>
        <p className="text-sm text-[#666666]">{description}</p>
      </div>
    </div>
  );
}
