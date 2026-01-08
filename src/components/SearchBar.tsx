'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Compact mode for header */
  compact?: boolean;
  /** Initial value */
  defaultValue?: string;
  /** Called when search is submitted */
  onSearch?: (query: string) => void;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search plates...',
  compact = false,
  defaultValue = '',
  onSearch,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize from URL or default
  const [query, setQuery] = useState(
    defaultValue || searchParams.get('query') || ''
  );
  const [isFocused, setIsFocused] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle input change with debounce
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase(); // Plates are uppercase
    setQuery(value);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300);
  }, [onSearch]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Clear debounce on submit
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to plates page with query
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('query', query);
      } else {
        params.delete('query');
      }
      router.push(`/plates?${params.toString()}`);
    }
  }, [query, onSearch, router, searchParams]);

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();

    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    }
  }, [handleClear]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative flex items-center ${compact ? 'w-full max-w-xs' : 'w-full'}`}
    >
      {/* Search Icon */}
      <div className="absolute left-3 pointer-events-none">
        <svg
          className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[var(--text-muted)]`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="search"
        name="query"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-label="Search number plates"
        className={`
          w-full
          ${compact ? 'pl-9 pr-8 py-2 text-sm' : 'pl-11 pr-10 py-3'}
          bg-[var(--background-subtle)]
          border border-[var(--border)]
          rounded-xl
          text-[var(--text)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none
          focus:ring-2
          focus:ring-[var(--green)]
          focus:border-transparent
          transition-all
          ${isFocused ? 'bg-white' : ''}
        `}
      />

      {/* Clear Button */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className={`
            absolute
            ${compact ? 'right-2' : 'right-3'}
            p-1
            rounded-full
            text-[var(--text-muted)]
            hover:text-[var(--text)]
            hover:bg-[var(--border)]
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--green)]
            transition-colors
          `}
          aria-label="Clear search"
        >
          <svg
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Hidden submit button for screen readers */}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
