'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ResolutionNoteModalProps {
  isOpen: boolean;
  selectedCount: number;
  action: 'resolve' | 'dismiss';
  onConfirm: (note: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ResolutionNoteModal({
  isOpen,
  selectedCount,
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: ResolutionNoteModalProps) {
  const [note, setNote] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxChars = 1000;
  const charsRemaining = maxChars - note.length;
  const isValid = note.trim().length > 0 && note.length <= maxChars;

  // Reset form and call onCancel
  const handleCancel = useCallback(() => {
    setNote('');
    onCancel();
  }, [onCancel]);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
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
    textareaRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!isValid || isLoading) return;
    onConfirm(note);
  };

  const title = action === 'resolve' ? 'Resolve Reports' : 'Dismiss Reports';
  const confirmText = action === 'resolve' ? 'Resolve' : 'Dismiss';
  const labelText = action === 'resolve' ? 'Resolution Note' : 'Dismissal Reason';
  const placeholderText = action === 'resolve'
    ? 'Explain how this report was resolved...'
    : 'Explain why this report is being dismissed...';

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
        onClick={isLoading ? undefined : handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
      >
        <h2
          id="modal-title"
          className="text-lg font-semibold text-[#1A1A1A] mb-4"
        >
          {title}
        </h2>

        <p className="text-sm text-[#666666] mb-6">
          {action === 'resolve' ? 'Add a resolution note for ' : 'Add a dismissal reason for '}
          {selectedCount} {selectedCount === 1 ? 'report' : 'reports'}
        </p>

        <div className="space-y-4 mb-6">
          {/* Note/Reason Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="resolution-note" className="block text-sm font-medium text-[#1A1A1A]">
                {labelText} *
              </label>
              <span className={`text-xs ${charsRemaining < 0 ? 'text-[#EF4444]' : 'text-[#999999]'}`}>
                {charsRemaining} characters remaining
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="resolution-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={placeholderText}
              rows={6}
              maxLength={1100}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D] disabled:bg-[#F8F8F8] disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Preview Section */}
          {note && (
            <div className="border border-[#EBEBEB] rounded-lg p-4 bg-[#F8F8F8]">
              <h3 className="text-xs font-semibold text-[#666666] mb-2">Preview</h3>
              <div className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{note}</div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#666666] bg-white border border-[#EBEBEB] rounded-lg hover:border-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              action === 'resolve'
                ? 'bg-[#00843D] hover:bg-[#006930]'
                : 'bg-[#999999] hover:bg-[#666666]'
            }`}
          >
            {isLoading ? `${action === 'resolve' ? 'Resolving' : 'Dismissing'}...` : `${confirmText} ${selectedCount} ${selectedCount === 1 ? 'Report' : 'Reports'}`}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
