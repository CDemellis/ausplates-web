'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getUserListings, deleteListing, updateListing, UserListing } from '@/lib/api';
import { PlateView } from '@/components/PlateView';
import { formatPrice } from '@/types/listing';

type StatusFilter = 'all' | 'active' | 'draft' | 'sold';

export default function MyListingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();

  const [listings, setListings] = useState<UserListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/my-listings');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch listings
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        const status = statusFilter === 'all' ? undefined : statusFilter;
        const data = await getUserListings(token, status as any);
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [isAuthenticated, getAccessToken, statusFilter]);

  const handleDelete = async (listingId: string) => {
    setDeletingId(listingId);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await deleteListing(token, listingId);
      setListings(listings.filter(l => l.id !== listingId));
      setShowDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: 'active' | 'draft') => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await updateListing(token, listingId, { status: newStatus });
      setListings(listings.map(l =>
        l.id === listingId ? { ...l, status: newStatus } : l
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Draft</span>;
      case 'sold':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Sold</span>;
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text)]">My Listings</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Manage your plate listings</p>
            </div>
            <Link
              href="/create"
              className="px-4 py-2 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
            >
              + New Listing
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'active', 'draft', 'sold'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--green)] text-white'
                  : 'bg-[var(--background-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && listings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--background-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-[var(--text)] mb-2">
              {statusFilter === 'all' ? 'No listings yet' : `No ${statusFilter} listings`}
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              {statusFilter === 'all'
                ? 'Create your first listing to start selling'
                : `You don't have any ${statusFilter} listings`
              }
            </p>
            {statusFilter === 'all' && (
              <Link
                href="/create"
                className="inline-flex px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
              >
                Create Listing
              </Link>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white border border-[var(--border)] rounded-2xl p-4 flex gap-4"
              >
                {/* Plate Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-20 bg-[var(--background-subtle)] rounded-lg flex items-center justify-center">
                    <PlateView
                      combination={listing.combination}
                      state={listing.state as any}
                      colorScheme={listing.colorScheme as any}
                      size="small"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--text)]">{listing.combination}</h3>
                        {getStatusBadge(listing.status)}
                        {listing.isFeatured && (
                          <span className="px-2 py-1 text-xs font-medium bg-[var(--gold)] text-[var(--text)] rounded-full">Featured</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">{listing.state}</p>
                    </div>
                    <p className="font-semibold text-[var(--text)]">{formatPrice(listing.price)}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
                    <span>{listing.viewsCount} views</span>
                    <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/plate/${listing.slug}`}
                      className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--background-subtle)] rounded-lg hover:bg-[var(--border)] transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/my-listings/${listing.id}/edit`}
                      className="px-3 py-1.5 text-sm font-medium text-[var(--green)] bg-[var(--green)]/10 rounded-lg hover:bg-[var(--green)]/20 transition-colors"
                    >
                      Edit
                    </Link>
                    {listing.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'draft')}
                        className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--background-subtle)] rounded-lg hover:bg-[var(--border)] transition-colors"
                      >
                        Unpublish
                      </button>
                    )}
                    {listing.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'active')}
                        className="px-3 py-1.5 text-sm font-medium text-[var(--green)] bg-[var(--green)]/10 rounded-lg hover:bg-[var(--green)]/20 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteModal(listing.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Delete Listing?</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              This action cannot be undone. The listing will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-[var(--text)] font-medium border border-[var(--border)] rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deletingId === showDeleteModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deletingId === showDeleteModal ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
