import { AdminListing } from '@/lib/api';

interface Column {
  key: keyof AdminListing | 'actions';
  label: string;
  sortable?: boolean;
  render?: (listing: AdminListing) => React.ReactNode;
}

interface DataTableProps {
  data: AdminListing[];
  isLoading: boolean;
  columns: Column[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export function DataTable({
  data,
  isLoading,
  columns,
  sortBy,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
}: DataTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F8F8F8] border-b border-[#EBEBEB]">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold text-[#666666]">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-[#EBEBEB] animate-pulse">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-[#F8F8F8] rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No listings found</h3>
        <p className="text-[#666666]">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F8F8] border-b border-[#EBEBEB]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-[#666666] ${
                      col.sortable && onSort ? 'cursor-pointer hover:text-[#1A1A1A]' : ''
                    }`}
                    onClick={() => col.sortable && onSort && col.key !== 'actions' && onSort(String(col.key))}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && sortBy === col.key && (
                        <span className="text-[#00843D]">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((listing, idx) => (
                <tr
                  key={listing.id}
                  className={`border-b border-[#EBEBEB] hover:bg-[#F8F8F8] transition-colors ${
                    idx === data.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-[#1A1A1A]">
                      {col.render ? col.render(listing) : listing[col.key as keyof AdminListing]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[#666666]">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-[#EBEBEB] rounded hover:border-[#00843D] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {getPageNumbers(pagination.page, pagination.totalPages).map((pageNum) =>
                pageNum === '...' ? (
                  <span key={Math.random()} className="px-3 py-1 text-sm text-[#666666]">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(Number(pageNum))}
                    className={`px-3 py-1 text-sm border rounded ${
                      pagination.page === pageNum
                        ? 'bg-[#00843D] text-white border-[#00843D]'
                        : 'border-[#EBEBEB] hover:border-[#00843D]'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm border border-[#EBEBEB] rounded hover:border-[#00843D] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const showPages = 5; // Show 5 page numbers at a time

  if (totalPages <= showPages + 2) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
}
