'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getConversations, Conversation } from '@/lib/api';
import { formatPrice, formatTimeAgo } from '@/types/listing';

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
        hasUnread
          ? 'bg-[var(--green)]/5 hover:bg-[var(--green)]/10'
          : 'hover:bg-[var(--background-subtle)]'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {conversation.otherUser.avatarUrl ? (
          <img
            src={conversation.otherUser.avatarUrl}
            alt={conversation.otherUser.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-[var(--green)]">
              {conversation.otherUser.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--green)] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-medium text-[var(--text)] truncate ${hasUnread ? 'font-semibold' : ''}`}>
              {conversation.otherUser.fullName}
            </p>
            <p className="text-sm text-[var(--text-muted)] truncate">
              Re: {conversation.listing.combination} ({conversation.listing.state})
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-[var(--text-muted)]">
              {conversation.lastMessage
                ? formatTimeAgo(conversation.lastMessage.createdAt)
                : formatTimeAgo(conversation.createdAt)}
            </p>
            {hasUnread && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 mt-1 text-xs font-bold text-white bg-[var(--green)] rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
        {conversation.lastMessage && (
          <p className={`mt-1 text-sm truncate ${hasUnread ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background-subtle)] flex items-center justify-center">
        <svg
          className="w-8 h-8 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[var(--text)] mb-2">No messages yet</h3>
      <p className="text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
        When you contact a seller or receive messages, they&apos;ll appear here.
      </p>
      <Link
        href="/plates"
        className="inline-flex items-center justify-center px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
      >
        Browse Plates
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[var(--background-subtle)]" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-[var(--background-subtle)] rounded mb-2" />
            <div className="h-3 w-48 bg-[var(--background-subtle)] rounded mb-2" />
            <div className="h-3 w-64 bg-[var(--background-subtle)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/messages');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversations
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchConversations = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const data = await getConversations(token);
          setConversations(data);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Poll every 30 seconds for new conversations
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, getAccessToken]);

  // Show loading state
  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="bg-[var(--background)] min-h-[80vh]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-6">Messages</h1>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-[var(--background)] min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-[var(--text)] mb-6">Messages</h1>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[var(--green)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
            {conversations.map((conversation) => (
              <ConversationRow key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}

        {/* Screen reader announcement for conversation count */}
        <div className="sr-only" role="status" aria-live="polite">
          {conversations.length > 0
            ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
            : 'No conversations'}
        </div>
      </div>
    </div>
  );
}
