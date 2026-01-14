'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  deleteConversation,
  ConversationDetail,
  Message,
} from '@/lib/api';
import { formatPrice } from '@/types/listing';

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}

function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-AU', { weekday: 'long', month: 'short', day: 'numeric' });
}

function shouldShowDateSeparator(current: Message, previous?: Message): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();
  return currentDate !== previousDate;
}

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  showDateSeparator: boolean;
}

function MessageBubble({ message, isSent, showDateSeparator }: MessageBubbleProps) {
  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center my-4">
          <span className="px-3 py-1 text-xs text-[var(--text-muted)] bg-[var(--background-subtle)] rounded-full">
            {formatDateSeparator(message.createdAt)}
          </span>
        </div>
      )}
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
        <div
          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
            isSent
              ? 'bg-[var(--green)] text-white rounded-br-md'
              : 'bg-[var(--background-subtle)] text-[var(--text)] rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${isSent ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
            {formatMessageTime(message.createdAt)}
          </p>
        </div>
      </div>
    </>
  );
}

interface ChatHeaderProps {
  conversation: ConversationDetail;
  onDeleteClick: () => void;
}

function ChatHeader({ conversation, onDeleteClick }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[var(--border)]">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--background-subtle)]"
            aria-label="Back to messages"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {conversation.otherUser.avatarUrl ? (
            <img
              src={conversation.otherUser.avatarUrl}
              alt={conversation.otherUser.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--green)]/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-[var(--green)]">
                {conversation.otherUser.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text)] truncate">
              {conversation.otherUser.fullName}
            </p>
            <Link
              href={`/plate/${conversation.listing.slug}`}
              className="text-sm text-[var(--green)] hover:underline truncate block"
            >
              {conversation.listing.combination} - {formatPrice(conversation.listing.price)}
            </Link>
          </div>

          <button
            onClick={onDeleteClick}
            className="p-2 text-[var(--text-muted)] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            aria-label="Delete conversation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => Promise<void>;
  disabled: boolean;
}) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(content.trim());
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-[var(--border)]">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="Type a message..."
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-[var(--background-subtle)] border border-[var(--border)] rounded-2xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent resize-none"
              aria-label="Message"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim() || isSending || disabled}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--green)] text-white rounded-full hover:bg-[#006B31] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)] text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/signin?redirect=/messages/${conversationId}`);
    }
  }, [authLoading, isAuthenticated, router, conversationId]);

  // Fetch conversation and messages
  useEffect(() => {
    if (!isAuthenticated || !conversationId) return;

    const fetchConversation = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const data = await getConversation(token, conversationId);
          setConversation(data);
          setMessages(data.messages);

          // Track last message time for polling
          if (data.messages.length > 0) {
            lastMessageTimeRef.current = data.messages[data.messages.length - 1].createdAt;
          }

          // Mark as read
          markConversationRead(token, conversationId);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch conversation:', err);
        }
        setError('Failed to load conversation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [isAuthenticated, conversationId, getAccessToken]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!isAuthenticated || !conversationId) return;

    // Track mount state to prevent state updates after unmount
    let isMounted = true;

    const pollMessages = async () => {
      // Don't poll if component is unmounted
      if (!isMounted) return;

      try {
        const token = await getAccessToken();
        if (token && lastMessageTimeRef.current && isMounted) {
          const newMessages = await getMessages(token, conversationId, lastMessageTimeRef.current);
          // Check mount state again after async operation
          if (newMessages.length > 0 && isMounted) {
            setMessages((prev) => [...prev, ...newMessages]);
            lastMessageTimeRef.current = newMessages[newMessages.length - 1].createdAt;

            // Mark as read
            markConversationRead(token, conversationId);
          }
        }
      } catch (err) {
        // Silently fail polling errors
        if (isMounted && process.env.NODE_ENV === 'development') {
          console.error('Polling error:', err);
        }
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, conversationId, getAccessToken]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message handler
  const handleSendMessage = async (content: string) => {
    const token = await getAccessToken();
    if (!token) return;

    const newMessage = await sendMessage(token, conversationId, content);
    setMessages((prev) => [...prev, newMessage]);
    lastMessageTimeRef.current = newMessage.createdAt;
  };

  // Delete conversation handler
  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      await deleteConversation(token, conversationId);
      router.push('/messages');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete conversation:', err);
      }
      setError('Failed to delete conversation. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Error state
  if (error || !conversation) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Conversation not found'}</p>
          <Link href="/messages" className="text-[var(--green)] hover:underline">
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      <ChatHeader conversation={conversation} onDeleteClick={() => setShowDeleteModal(true)} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)]">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isSent={message.senderId === user?.id}
                  showDateSeparator={shouldShowDateSeparator(message, messages[index - 1])}
                />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSend={handleSendMessage} disabled={false} />

      {/* Screen reader announcement for new messages */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="false">
        {messages.length > 0 && `${messages.length} messages`}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
              Delete Conversation?
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              This conversation will be removed from your inbox. The other person will still be able to see it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-[var(--text)] font-medium hover:bg-[var(--background-subtle)] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
