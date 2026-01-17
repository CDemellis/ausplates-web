// Generic type constraint: must have an 'id' property
type DataWithId = { id: string; [key: string]: any };

export interface Column<T extends DataWithId> {
  key: keyof T | 'actions';
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends DataWithId> {
  data: T[];
  isLoading: boolean;
  columns: Column<T>[];
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
  selectedRows?: Set<string>;
  onSelectRow?: (id: string) => void;
  onSelectAll?: (selectAll: boolean) => void;
  emptyMessage?: {
    title: string;
    description: string;
  };
}

export function DataTable<T extends DataWithId>({
  data,
  isLoading,
  columns,
  sortBy,
  sortDirection,
  onSort,
  pagination,
  onPageChange,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  emptyMessage = {
    title: 'No results found',
    description: 'Try adjusting your filters to see more results.',
  },
}: DataTableProps<T>) {
  const hasSelection = onSelectRow && onSelectAll;
  const allSelected = hasSelection && data.length > 0 && data.every((item) => selectedRows.has(item.id));
  const someSelected = hasSelection && selectedRows.size > 0 && !allSelected;
  if (isLoading) {
    return (
      <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F8F8F8] border-b border-[#EBEBEB]">
            <tr>
              {hasSelection && (
                <th className="px-4 py-3 w-12">
                  <div className="h-4 bg-[#F8F8F8] rounded w-4"></div>
                </th>
              )}
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
                {hasSelection && (
                  <td className="px-4 py-3">
                    <div className="h-4 bg-[#F8F8F8] rounded w-4"></div>
                  </td>
                )}
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
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{emptyMessage.title}</h3>
        <p className="text-[#666666]">{emptyMessage.description}</p>
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
                {hasSelection && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected || false;
                        }
                      }}
                      onChange={(e) => onSelectAll?.(e.target.checked)}
                      className="w-4 h-4 text-[#00843D] border-[#EBEBEB] rounded focus:ring-[#00843D] focus:ring-2"
                      aria-label="Select all items"
                    />
                  </th>
                )}
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
              {data.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-[#EBEBEB] hover:bg-[#F8F8F8] transition-colors ${
                    idx === data.length - 1 ? 'border-b-0' : ''
                  } ${selectedRows.has(item.id) ? 'bg-[#F0F9F4]' : ''}`}
                >
                  {hasSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={() => onSelectRow?.(item.id)}
                        className="w-4 h-4 text-[#00843D] border-[#EBEBEB] rounded focus:ring-[#00843D] focus:ring-2"
                        aria-label={`Select item ${item.id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-[#1A1A1A]">
                      {col.render ? col.render(item) : item[col.key as keyof T]}
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
