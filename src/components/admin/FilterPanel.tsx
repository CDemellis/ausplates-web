import { ListingsFilters } from '@/lib/api';

interface FilterPanelProps {
  filters: ListingsFilters;
  onFilterChange: (filters: ListingsFilters) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' },
  { value: 'removed', label: 'Removed' },
];

const STATES = [
  { value: '', label: 'All States' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
];

const PLATE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'custom', label: 'Custom' },
  { value: 'euro', label: 'Euro' },
  { value: 'prestige', label: 'Prestige' },
  { value: 'standard', label: 'Standard' },
];

export function FilterPanel({ filters, onFilterChange, isCollapsed = false, onToggleCollapse }: FilterPanelProps) {
  const updateFilter = <K extends keyof ListingsFilters>(key: K, value: ListingsFilters[K]) => {
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
    filters.state,
    filters.plateType,
    filters.search,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
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
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            State
          </label>
          <select
            value={filters.state || ''}
            onChange={(e) => updateFilter('state', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            {STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* Plate Type Filter */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Plate Type
          </label>
          <select
            value={filters.plateType || ''}
            onChange={(e) => updateFilter('plateType', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            {PLATE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Min Price ($)
          </label>
          <input
            type="number"
            value={filters.minPrice !== undefined ? filters.minPrice / 100 : ''}
            onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) * 100 : undefined)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#666666] mb-1">
            Max Price ($)
          </label>
          <input
            type="number"
            value={filters.maxPrice !== undefined ? filters.maxPrice / 100 : ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) * 100 : undefined)}
            placeholder="99999.99"
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
            placeholder="Combination or description"
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>
      </div>
    </div>
  );
}
