'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { reportListing, ReportReason } from '@/lib/api';

interface ReportListingButtonProps {
  listingId: string;
  combination: string;
  sellerId?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Offensive, misleading, or inappropriate photos or description',
  },
  {
    value: 'suspected_fraud',
    label: 'Suspected Fraud',
    description: 'Seller may not own this plate or is running a scam',
  },
  {
    value: 'incorrect_information',
    label: 'Incorrect Information',
    description: 'Details about the plate are wrong or misleading',
  },
  {
    value: 'already_sold',
    label: 'Already Sold',
    description: 'This plate has already been sold elsewhere',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another issue not listed above',
  },
];

export function ReportListingButton({ listingId, combination, sellerId }: ReportListingButtonProps) {
  const { user, isAuthenticated, getAccessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Don't show report button if user is the seller
  if (user?.id === sellerId) {
    return null;
  }

  const handleOpen = () => {
    if (!isAuthenticated) {
      // Could redirect to signin, but for now just show in modal
      setIsOpen(true);
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedReason(null);
    setDetails('');
    setError('');
    // Keep success state for a moment if shown
    if (!success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setError('Please select a reason for your report');
      return;
    }

    if (selectedReason === 'other' && !details.trim()) {
      setError('Please provide details for your report');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError('You must be signed in to report a listing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reportListing(accessToken, listingId, selectedReason, details);
      setSuccess(true);
      // Auto close after showing success
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setSelectedReason(null);
        setDetails('');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Report Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-red-600 transition-colors"
        aria-label="Report this listing"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Report
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all"
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {success ? (
                /* Success State */
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">Report Submitted</h3>
                  <p className="text-[var(--text-muted)] mt-2">
                    Thank you for helping keep AusPlates safe. We&apos;ll review your report.
                  </p>
                </div>
              ) : !isAuthenticated ? (
                /* Not Signed In State */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--background-subtle)] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 id="report-modal-title" className="text-lg font-semibold text-[var(--text)]">
                    Sign in Required
                  </h3>
                  <p className="text-[var(--text-muted)] mt-2 mb-6">
                    You need to be signed in to report a listing.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <a
                      href={`/signin?redirect=/plate/${combination}`}
                      className="flex-1 py-3 px-4 rounded-xl bg-[var(--green)] text-white font-medium hover:bg-[#006B31] transition-colors text-center"
                    >
                      Sign In
                    </a>
                  </div>
                </div>
              ) : (
                /* Report Form */
                <form onSubmit={handleSubmit}>
                  <h3 id="report-modal-title" className="text-lg font-semibold text-[var(--text)] mb-1">
                    Report Listing
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6">
                    Report &quot;{combination}&quot; for violating our guidelines
                  </p>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                      {error}
                    </div>
                  )}

                  {/* Reason Selection */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-medium text-[var(--text)]">
                      Why are you reporting this listing?
                    </label>
                    {REPORT_REASONS.map((reason) => (
                      <label
                        key={reason.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          selectedReason === reason.value
                            ? 'border-[var(--green)] bg-[var(--green)]/5'
                            : 'border-[var(--border)] hover:border-[var(--green)]/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={() => setSelectedReason(reason.value)}
                          className="mt-0.5 w-4 h-4 text-[var(--green)] border-[var(--border)] focus:ring-[var(--green)]"
                        />
                        <div>
                          <span className="font-medium text-[var(--text)]">{reason.label}</span>
                          <p className="text-sm text-[var(--text-muted)]">{reason.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Details Field */}
                  <div className="mb-6">
                    <label htmlFor="report-details" className="block text-sm font-medium text-[var(--text)] mb-1">
                      Additional Details {selectedReason !== 'other' && <span className="text-[var(--text-muted)]">(optional)</span>}
                    </label>
                    <textarea
                      id="report-details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Provide any additional information that might help us review this report..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1 text-right">
                      {details.length}/500
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] font-medium text-[var(--text)] hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedReason}
                      className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        'Submit Report'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
