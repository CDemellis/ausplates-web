import type { Metadata } from 'next';
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/lib/auth-context';
import { SavedProvider } from '@/lib/saved-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas-neue',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AusPlates - Australian Personalised Number Plates Marketplace',
    template: '%s | AusPlates',
  },
  description:
    'Buy and sell personalised number plates across Australia. Browse thousands of custom, heritage, and euro plates from VIC, NSW, QLD, SA, WA, TAS, NT, and ACT.',
  keywords: [
    'personalised plates',
    'number plates',
    'custom plates',
    'Victorian plates',
    'NSW plates',
    'Queensland plates',
    'buy number plates',
    'sell number plates',
    'Australia plates',
  ],
  authors: [{ name: 'AusPlates' }],
  creator: 'AusPlates',
  metadataBase: new URL('https://ausplates.app'),
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://ausplates.app',
    siteName: 'AusPlates',
    title: 'AusPlates - Australian Personalised Number Plates Marketplace',
    description:
      'Buy and sell personalised number plates across Australia. Browse thousands of custom, heritage, and euro plates.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AusPlates - Australian Personalised Number Plates Marketplace',
    description:
      'Buy and sell personalised number plates across Australia. Browse thousands of plates.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <SavedProvider>
              {/* Skip to main content link for keyboard users */}
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--green)] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
              >
                Skip to main content
              </a>
              <Header />
              <main id="main" className="min-h-screen">{children}</main>
              <Footer />
            </SavedProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
