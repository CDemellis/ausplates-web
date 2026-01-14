'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { startConversation } from '@/lib/api';

interface ContactSellerButtonProps {
  listingId: string;
  combination: string;
  sellerName: string;
  /** Seller's user ID to check ownership */
  sellerId?: string;
}

const QUICK_MESSAGES = [
  'Hi, is this plate still available?',
  'Hi, would you consider a lower price?',
  'Hi, I\'m interested in this plate. Can you tell me more?',
];

export function ContactSellerButton({
  listingId,
  combination,
  sellerName,
  sellerId,
}: ContactSellerButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated, getAccessToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show button if user is the seller
  const isOwnListing = isAuthenticated && user && sellerId && user.id === sellerId;
  if (isOwnListing) {
    return null;
  }

  // If not authenticated, show sign in prompt
  if (!isAuthenticated) {
    return (
      <Link
        href={`/signin?redirect=/plate/${combination.toLowerCase()}`}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--green)] text-white text-lg font-medium rounded-xl hover:bg-[#006B31] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Sign in to Contact Seller
      </Link>
    );
  }

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const conversation = await startConversation(token, listingId, message.trim());
      setIsModalOpen(false);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to start conversation:', err);
      }
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const selectQuickMessage = (msg: string) => {
    setMessage(msg);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--green)] text-white text-lg font-medium rounded-xl hover:bg-[#006B31] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Contact Seller
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 id="contact-modal-title" className="text-lg font-semibold text-[var(--text)]">
                Contact {sellerName}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--background-subtle)]"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Send a message about <span className="font-medium text-[var(--text)]">{combination}</span>
              </p>

              {/* Quick messages */}
              <div className="mb-4">
                <p className="text-xs text-[var(--text-muted)] mb-2">Quick messages:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_MESSAGES.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => selectQuickMessage(msg)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        message === msg
                          ? 'bg-[var(--green)] text-white border-[var(--green)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--green)] hover:text-[var(--green)]'
                      }`}
                    >
                      {msg.length > 30 ? msg.slice(0, 30) + '...' : msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message input */}
              <div>
                <label htmlFor="message-input" className="sr-only">
                  Your message
                </label>
                <textarea
                  id="message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--background-subtle)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="flex-1 px-4 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
