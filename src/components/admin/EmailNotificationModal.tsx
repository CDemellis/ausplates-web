'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface EmailNotificationModalProps {
  isOpen: boolean;
  selectedCount: number;
  onSend: (subject: string, message: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmailNotificationModal({
  isOpen,
  selectedCount,
  onSend,
  onCancel,
  isLoading = false,
}: EmailNotificationModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  const subjectCharsRemaining = 200 - subject.length;
  const messageCharsRemaining = 2000 - message.length;
  const isValid = subject.trim().length > 0 && message.trim().length > 0 && subject.length <= 200 && message.length <= 2000;

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
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
    subjectInputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubject('');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!isValid || isLoading) return;
    onSend(subject, message);
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
        onClick={isLoading ? undefined : onCancel}
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
          Send Email Notification
        </h2>

        <p className="text-sm text-[#666666] mb-6">
          Send an email notification to {selectedCount} {selectedCount === 1 ? 'user' : 'users'}
        </p>

        <div className="space-y-4 mb-6">
          {/* Subject Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="email-subject" className="block text-sm font-medium text-[#1A1A1A]">
                Subject *
              </label>
              <span className={`text-xs ${subjectCharsRemaining < 0 ? 'text-[#EF4444]' : 'text-[#999999]'}`}>
                {subjectCharsRemaining} characters remaining
              </span>
            </div>
            <input
              ref={subjectInputRef}
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Important Update About Your Account"
              maxLength={250}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D] disabled:bg-[#F8F8F8] disabled:cursor-not-allowed"
            />
          </div>

          {/* Message Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="email-message" className="block text-sm font-medium text-[#1A1A1A]">
                Message *
              </label>
              <span className={`text-xs ${messageCharsRemaining < 0 ? 'text-[#EF4444]' : 'text-[#999999]'}`}>
                {messageCharsRemaining} characters remaining
              </span>
            </div>
            <textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={8}
              maxLength={2100}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D] disabled:bg-[#F8F8F8] disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Preview Section */}
          {subject && message && (
            <div className="border border-[#EBEBEB] rounded-lg p-4 bg-[#F8F8F8]">
              <h3 className="text-xs font-semibold text-[#666666] mb-2">Preview</h3>
              <div className="text-sm">
                <div className="font-semibold text-[#1A1A1A] mb-2">{subject}</div>
                <div className="text-[#666666] whitespace-pre-wrap">{message}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#666666] bg-white border border-[#EBEBEB] rounded-lg hover:border-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#00843D] rounded-lg hover:bg-[#006930] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : `Send to ${selectedCount} ${selectedCount === 1 ? 'user' : 'users'}`}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
