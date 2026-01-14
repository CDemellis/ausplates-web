import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('API utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchWithRetry behavior', () => {
    it('should handle successful responses', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ listings: [] }),
      });

      const { getFeaturedListings } = await import('./api');
      const result = await getFeaturedListings();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle 404 responses without retrying', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      const { getListingBySlug } = await import('./api');
      const result = await getListingBySlug('nonexistent');
      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const { getFeaturedListings } = await import('./api');
      await expect(getFeaturedListings()).rejects.toThrow();
    });
  });

  describe('URL construction', () => {
    it('should use correct API base URL', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ listings: [] }),
      });

      const { getFeaturedListings } = await import('./api');
      await getFeaturedListings();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/listings/featured'),
        expect.any(Object)
      );
    });

    it('should use correct API URL for recent listings', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ listings: [] }),
      });

      const { getRecentListings } = await import('./api');
      await getRecentListings(10);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/listings/recent'),
        expect.any(Object)
      );
    });
  });
});

describe('Price formatting', () => {
  it('should format prices correctly (whole dollars)', async () => {
    const { formatPrice } = await import('@/types/listing');

    // formatPrice uses maximumFractionDigits: 0, so it rounds to whole dollars
    expect(formatPrice(999)).toBe('$10');  // 9.99 rounds to 10
    expect(formatPrice(10000)).toBe('$100');
    expect(formatPrice(0)).toBe('$0');
    expect(formatPrice(50)).toBe('$1'); // 0.50 rounds to 1
  });
});
