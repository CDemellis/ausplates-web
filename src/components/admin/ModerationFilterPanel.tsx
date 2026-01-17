'use client';

import { ReportsFilters } from '@/lib/api';

interface ModerationFilterPanelProps {
  filters: ReportsFilters;
  onFilterChange: (filters: ReportsFilters) => void;
}

export function ModerationFilterPanel({ filters, onFilterChange }: ModerationFilterPanelProps) {
  const updateFilter = <K extends keyof ReportsFilters>(key: K, value: ReportsFilters[K]) => {
    onFilterChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 when filters change
  };

  // Calculate active filter count
  const activeFilters = [
    filters.status,
    filters.report_reason,
    filters.reporter_email,
    filters.reported_content,
    filters.date_from,
    filters.date_to,
  ].filter(Boolean).length;

  const handleReset = () => {
    onFilterChange({
      page: 1,
      limit: filters.limit,
      sortBy: 'created_at',
      sortDirection: 'desc',
    });
  };

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Filters</h3>
        {activeFilters > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666666]">
              {activeFilters} {activeFilters === 1 ? 'filter' : 'filters'} active
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-[#00843D] hover:text-[#006930] font-medium"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Report Status */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-[#666666] mb-1">
            Report Status
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Report Type */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-[#666666] mb-1">
            Report Type
          </label>
          <select
            id="type-filter"
            value={filters.report_reason || ''}
            onChange={(e) => updateFilter('report_reason', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          >
            <option value="">All Types</option>
            <option value="inappropriate_content">Inappropriate Content</option>
            <option value="suspected_fraud">Suspected Fraud</option>
            <option value="incorrect_information">Incorrect Information</option>
            <option value="already_sold">Already Sold</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Reporter Email Search */}
        <div>
          <label htmlFor="reporter-search" className="block text-sm font-medium text-[#666666] mb-1">
            Reporter Email
          </label>
          <input
            id="reporter-search"
            type="text"
            value={filters.reporter_email || ''}
            onChange={(e) => updateFilter('reporter_email', e.target.value || undefined)}
            placeholder="Search by email..."
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>

        {/* Reported Content Search */}
        <div>
          <label htmlFor="content-search" className="block text-sm font-medium text-[#666666] mb-1">
            Reported Content
          </label>
          <input
            id="content-search"
            type="text"
            value={filters.reported_content || ''}
            onChange={(e) => updateFilter('reported_content', e.target.value || undefined)}
            placeholder="Search listing combination..."
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="date-from" className="block text-sm font-medium text-[#666666] mb-1">
            Date From
          </label>
          <input
            id="date-from"
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="date-to" className="block text-sm font-medium text-[#666666] mb-1">
            Date To
          </label>
          <input
            id="date-to"
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#00843D]"
          />
        </div>
      </div>
    </div>
  );
}
