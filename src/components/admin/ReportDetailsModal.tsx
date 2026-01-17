'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ReportDetail } from '@/lib/api';

interface ReportDetailsModalProps {
  isOpen: boolean;
  report: ReportDetail | null;
  onClose: () => void;
  onResolve?: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
}

export function ReportDetailsModal({
  isOpen,
  report,
  onClose,
  onResolve,
  onDismiss,
  isLoading = false,
}: ReportDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Tab key focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-[#F59E0B] text-white',
      reviewed: 'bg-[#3B82F6] text-white',
      resolved: 'bg-[#22C55E] text-white',
      dismissed: 'bg-[#999999] text-white',
    };
    return colors[status] || 'bg-gray-200';
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Inappropriate Content',
      suspected_fraud: 'Suspected Fraud',
      incorrect_information: 'Incorrect Information',
      already_sold: 'Already Sold',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-[#1A1A1A]"
            >
              Report Details
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              ID: <span className="font-mono">{report.id.slice(0, 8)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#666666] hover:text-[#1A1A1A] disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Report Info */}
        <div className="space-y-6">
          {/* Status and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1">Status</label>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1">Type</label>
              <span className="text-sm text-[#1A1A1A]">{getReasonLabel(report.reportReason)}</span>
            </div>
          </div>

          {/* Reporter Info */}
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">Reporter</label>
            <div className="text-sm text-[#1A1A1A]">
              <p>{report.reporterName || 'Anonymous'}</p>
              <p className="text-[#666666]">{report.reporterEmail}</p>
            </div>
          </div>

          {/* Report Reason */}
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">Report Details</label>
            <div className="bg-[#F8F8F8] border border-[#EBEBEB] rounded-lg p-4">
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">
                {report.reason || 'No details provided'}
              </p>
            </div>
          </div>

          {/* Reported Content */}
          {report.reportedContentFull && (
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-2">Reported Listing</label>
              <div className="bg-[#F8F8F8] border border-[#EBEBEB] rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[#666666]">Combination</span>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {report.reportedContentFull.combination}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#666666]">State</span>
                    <p className="text-sm text-[#1A1A1A]">{report.reportedContentFull.state}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[#666666]">Price</span>
                    <p className="text-sm text-[#1A1A1A]">
                      {formatCurrency(report.reportedContentFull.price)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#666666]">Type</span>
                    <p className="text-sm text-[#1A1A1A] capitalize">
                      {report.reportedContentFull.plateType.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[#666666]">Description</span>
                  <p className="text-sm text-[#1A1A1A] mt-1">
                    {report.reportedContentFull.description || 'No description'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#666666]">Owner</span>
                  <p className="text-sm text-[#1A1A1A] mt-1">
                    {report.reportedContentFull.ownerName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-[#666666]">{report.reportedContentFull.ownerEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs text-[#666666]">
            <div>
              <span className="font-medium">Reported:</span>
              <p className="mt-1">{formatDate(report.createdAt)}</p>
            </div>
            {report.reviewedAt && (
              <div>
                <span className="font-medium">Reviewed:</span>
                <p className="mt-1">{formatDate(report.reviewedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#EBEBEB]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#666666] bg-white border border-[#EBEBEB] rounded-lg hover:border-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Close
          </button>
          {report.status === 'pending' && onDismiss && (
            <button
              onClick={onDismiss}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[#666666] bg-white border border-[#EBEBEB] rounded-lg hover:border-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Dismiss
            </button>
          )}
          {report.status === 'pending' && onResolve && (
            <button
              onClick={onResolve}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#00843D] rounded-lg hover:bg-[#006930] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Resolving...' : 'Resolve'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
