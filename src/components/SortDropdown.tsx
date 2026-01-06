'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortDropdownProps {
  currentSort: string;
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === 'recent') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', value);
    }
    const queryString = newParams.toString();
    router.push(`/plates${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--text-muted)]">Sort:</span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="appearance-none bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg px-4 py-2 pr-8 text-sm text-[var(--text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
        >
          <option value="recent">Most Recent</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
