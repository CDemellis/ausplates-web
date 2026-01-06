import { MetadataRoute } from 'next';
import { getAllListingSlugs } from '@/lib/api';

const STATES = ['vic', 'nsw', 'qld', 'sa', 'wa', 'tas', 'nt', 'act'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ausplates.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/plates`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  // State pages
  const statePages: MetadataRoute.Sitemap = STATES.map((state) => ({
    url: `${baseUrl}/plates/${state}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  // Individual listing pages
  const listings = await getAllListingSlugs();
  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/plate/${listing.slug}`,
    lastModified: new Date(listing.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...statePages, ...listingPages];
}
