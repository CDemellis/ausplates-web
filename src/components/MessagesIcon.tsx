'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUnreadCount } from '@/lib/api';

interface MessagesIconProps {
  /** Show label text */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function MessagesIcon({ showLabel = false, className = '' }: MessagesIconProps) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Check if we're on the messages page (poll less frequently there)
  const isOnMessagesPage = pathname?.startsWith('/messages');

  // Fetch unread count with deduplication guard
  const fetchUnreadCount = useCallback(async (isPolling = false) => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    // Prevent duplicate concurrent requests
    if (isFetchingRef.current) return;

    // For initial fetch, prevent duplicate calls from re-renders
    if (!isPolling && hasFetchedRef.current) return;

    isFetchingRef.current = true;
    hasFetchedRef.current = true;

    try {
      const token = await getAccessToken();
      if (token) {
        const count = await getUnreadCount(token);
        setUnreadCount(count);
      }
    } catch (error) {
      // Fail silently - unread count is not critical
      console.error('Failed to fetch unread count:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, getAccessToken]);

  // Initial fetch and polling
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      hasFetchedRef.current = false;
      return;
    }

    // Fetch immediately (initial fetch)
    fetchUnreadCount(false);

    // Poll every 30 seconds (or 10 seconds if on messages page)
    const interval = setInterval(
      () => fetchUnreadCount(true),
      isOnMessagesPage ? 10000 : 30000
    );

    return () => clearInterval(interval);
  }, [isAuthenticated, isOnMessagesPage, fetchUnreadCount]);

  // Don't show for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/messages"
      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-gray-100 transition-colors ${className}`}
      aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      {/* Message icon */}
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <span className="text-sm font-medium">Messages</span>
      )}

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full"
          aria-hidden="true"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
