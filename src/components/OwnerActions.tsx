'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { deleteListing, updateListing } from '@/lib/api';
import { revalidateAfterStatusChange } from '@/app/actions';

interface OwnerActionsProps {
  listingId: string;
  slug: string;
  sellerId: string;
  status: string;
  hasPaid?: boolean;
  isFeatured?: boolean;
  boostExpiresAt?: string;
  bumpsRemaining?: number;
}

function formatBoostExpiry(expiresAt: string): { text: string; isExpiringSoon: boolean; isExpired: boolean } {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { text: 'Boost expired', isExpiringSoon: false, isExpired: true };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  const isExpiringSoon = diffHours < 24;

  let text: string;
  if (diffDays > 0) {
    text = `${diffDays}d ${remainingHours}h remaining`;
  } else if (diffHours > 0) {
    text = `${diffHours}h remaining`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    text = `${diffMinutes}m remaining`;
  }

  return { text, isExpiringSoon, isExpired: false };
}

export function OwnerActions({ listingId, slug, sellerId, status: initialStatus, hasPaid = false, isFeatured = false, boostExpiresAt, bumpsRemaining = 0 }: OwnerActionsProps) {
  const router = useRouter();
  const { user, isAuthenticated, getAccessToken } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track local status for optimistic updates (avoids cache delays)
  const [localStatus, setLocalStatus] = useState(initialStatus);

  // Only show if user is authenticated and owns this listing
  if (!isAuthenticated || !user || user.id !== sellerId) {
    return null;
  }

  // Use local status for display
  const status = localStatus;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      await deleteListing(token, listingId);
      router.push('/my-listings?deleted=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'draft') => {
    // Draft listings need payment to be published - unless already paid
    if (status === 'draft' && newStatus === 'active' && !hasPaid) {
      router.push(`/my-listings/${listingId}/pay`);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const result = await updateListing(token, listingId, { status: newStatus });

      // Verify the status actually changed
      if (result.listing && result.listing.status !== newStatus) {
        throw new Error(`Failed to ${newStatus === 'draft' ? 'unpublish' : 'publish'} listing. Please try again.`);
      }

      // Optimistically update local status for immediate UI feedback
      setLocalStatus(newStatus);

      // Revalidate all cached pages that show this listing
      await revalidateAfterStatusChange(slug);

      // Refresh current page data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium text-[var(--text)]">This is your listing</h3>
        </div>

        {/* Boost Status Banner */}
        {isFeatured && boostExpiresAt && (() => {
          const { text, isExpiringSoon, isExpired } = formatBoostExpiry(boostExpiresAt);
          if (isExpired) return null;
          const is30DayBoost = bumpsRemaining > 0;
          return (
            <div className={`mb-4 p-3 rounded-xl border ${isExpiringSoon ? 'bg-orange-50 border-orange-200' : 'bg-[var(--gold)]/10 border-[var(--gold)]/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${isExpiringSoon ? 'text-orange-600' : 'text-[var(--gold)]'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className={`text-sm font-medium ${isExpiringSoon ? 'text-orange-700' : 'text-[var(--text)]'}`}>
                    {is30DayBoost ? 'Boost Pro' : 'Boost'} Active
                  </span>
                  <span className={`text-sm ${isExpiringSoon ? 'text-orange-600' : 'text-[var(--text-secondary)]'}`}>
                    • {text}
                  </span>
                </div>
                {isExpiringSoon && (
                  <Link
                    href={`/my-listings/${listingId}/boost`}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    Renew
                  </Link>
                )}
              </div>
              {is30DayBoost && (
                <p className="text-xs text-[var(--text-muted)] mt-1 ml-6">
                  {bumpsRemaining > 0
                    ? `${bumpsRemaining} bump${bumpsRemaining !== 1 ? 's' : ''} remaining`
                    : 'All bumps used'}
                </p>
              )}
            </div>
          );
        })()}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/my-listings/${listingId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Listing
          </Link>

          {status === 'active' && (
            <button
              onClick={() => handleStatusChange('draft')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isUpdating ? 'Updating...' : 'Unpublish'}
            </button>
          )}

          {status === 'draft' && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--green)]/10 text-[var(--green)] font-medium rounded-xl hover:bg-[var(--green)]/20 transition-colors disabled:opacity-50"
            >
              {hasPaid ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isUpdating ? 'Publishing...' : 'Republish'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Complete Payment
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Delete Listing?</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              This action cannot be undone. The listing will be permanently removed from AusPlates.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-[var(--text)] font-medium border border-[var(--border)] rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
