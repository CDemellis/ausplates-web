import type { Metadata } from 'next';
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
