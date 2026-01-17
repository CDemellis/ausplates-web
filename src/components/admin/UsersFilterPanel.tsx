import { UsersFilters } from '@/lib/api';

interface UsersFilterPanelProps {
  filters: UsersFilters;
  onFilterChange: (filters: UsersFilters) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const USER_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
];

const EMAIL_VERIFIED_OPTIONS = [
  { value: '', label: 'All Users' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Unverified' },
];

const ACCOUNT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'apple', label: 'Apple Sign In' },
];

export function UsersFilterPanel({ filters, onFilterChange, isCollapsed = false, onToggleCollapse }: UsersFilterPanelProps) {
  const updateFilter = (key: keyof UsersFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 when filtering
  };

  const resetFilters = () => {
    onFilterChange({
      page: 1,
      limit: 50,
      sortBy: 'created_at',
      sortDirection: 'desc',
    });
  };

  const activeFilterCount = [
    filters.status,
    filters.emailVerified !== undefined,
    filters.accountType,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
  ].filter(Boolean).length;

  if (isCollapsed && onToggleCollapse) {
    return (
      <div className="mb-4">
        <button
          onClick={onToggleCollapse}
          className="w-full md:w-auto px-4 py-2 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors flex items-center justify-between md:justify-start gap-2"
        >
          <span className="text-sm font-medium text-[#1A1A1A]">Show Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#00843D] text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Filters</h3>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#666666] hover:text-[#1A1A1A]"
            >
              Reset all
            </button>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-xs text-[#666666] hover:text-[#1A1A1A]"
            >
              Hide
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Status Filter */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            User Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            {USER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email Verified Filter */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Email Verified
          </label>
          <select
            value={filters.emailVerified === undefined ? '' : filters.emailVerified.toString()}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter('emailVerified', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            {EMAIL_VERIFIED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Account Type Filter */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Account Type
          </label>
          <select
            value={filters.accountType || ''}
            onChange={(e) => updateFilter('accountType', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Registered From
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Registered To
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            placeholder="Email or name"
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>
      </div>
    </div>
  );
}
