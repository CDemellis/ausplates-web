'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  AppNotification,
} from '@/lib/api';
import { formatPrice, formatTimeAgo } from '@/types/listing';
import { PlateView } from '@/components/PlateView';

// Notification type icons and colors
const NOTIFICATION_STYLES: Record<string, { icon: string; color: string; bgColor: string }> = {
  price_drop: {
    icon: 'M19 13l-7 7-7-7m14-8l-7 7-7-7',
    color: 'text-[var(--green)]',
    bgColor: 'bg-[var(--green)]/10',
  },
  new_message: {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  listing_sold: {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-[var(--gold)]',
    bgColor: 'bg-[var(--gold)]/10',
  },
  boost_expiring: {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  system: {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    color: 'text-[var(--text-muted)]',
    bgColor: 'bg-[var(--background-subtle)]',
  },
};

function NotificationRow({
  notification,
  onTap,
  onDelete,
}: {
  notification: AppNotification;
  onTap: () => void;
  onDelete: () => void;
}) {
  const style = NOTIFICATION_STYLES[notification.type] || NOTIFICATION_STYLES.system;

  return (
    <div
      onClick={onTap}
      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
        notification.isRead ? 'bg-white' : 'bg-[var(--green)]/5'
      } hover:bg-[var(--background-subtle)]`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-11 h-11 rounded-full ${style.bgColor} flex items-center justify-center`}>
        <svg
          className={`w-5 h-5 ${style.color}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm ${notification.isRead ? 'font-normal' : 'font-semibold'} text-[var(--text)]`}
          >
            {notification.title}
          </h3>
          <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        {notification.body && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">{notification.body}</p>
        )}

        {/* Plate preview for price drops */}
        {notification.type === 'price_drop' && notification.listing && (
          <div className="flex items-center gap-3 mt-2">
            <PlateView
              combination={notification.listing.combination}
              state={notification.listing.state}
              size="small"
              colorScheme={notification.listing.colorScheme}
            />
            {notification.metadata && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--green)]">
                  Now {formatPrice(notification.metadata.newPrice || notification.listing.price)}
                </span>
                {notification.metadata.oldPrice && (
                  <span className="text-xs text-[var(--text-muted)] line-through">
                    Was {formatPrice(notification.metadata.oldPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--green)] mt-2" />
      )}

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex-shrink-0 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
        aria-label="Delete notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, getAccessToken } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?redirect=/notifications');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadNotifications = useCallback(async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    try {
      const result = await getNotifications(accessToken);
      setNotifications(result.notifications);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  const handleNotificationTap = async (notification: AppNotification) => {
    const accessToken = await getAccessToken();

    // Mark as read
    if (!notification.isRead && accessToken) {
      markNotificationRead(accessToken, notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }

    // Navigate based on type
    if (notification.type === 'price_drop' && notification.listing) {
      router.push(`/plate/${notification.listing.slug}`);
    } else if (notification.type === 'new_message' && notification.conversationId) {
      router.push(`/messages/${notification.conversationId}`);
    }
  };

  const handleDelete = async (notificationId: string) => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    deleteNotification(accessToken, notificationId);
  };

  const handleMarkAllRead = async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsRead(accessToken);
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--green)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Notifications</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {isLoading
              ? 'Loading...'
              : `${notifications.length} ${notifications.length === 1 ? 'notification' : 'notifications'}`}
          </p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-[var(--green)] hover:text-[#006B31] transition-colors"
          >
            Mark All Read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
          {[...Array(5)].map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-[var(--background-subtle)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-2">No Notifications</h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            You&apos;re all caught up! We&apos;ll notify you when something happens with your saved plates or listings.
          </p>
          <Link
            href="/plates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-medium rounded-xl hover:bg-[#006B31] transition-colors"
          >
            Browse Plates
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onTap={() => handleNotificationTap(notification)}
              onDelete={() => handleDelete(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
