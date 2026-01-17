'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getOverviewMetrics,
  OverviewMetrics,
  getAdminListings,
  ListingsResponse,
  ListingsFilters,
  bulkDeleteListings,
  bulkUpdateListingStatus,
  AdminListing,
  getAdminUsers,
  UsersResponse,
  UsersFilters,
  AdminUser,
  bulkDeleteUsers,
  bulkUpdateUserStatus,
  sendBulkNotification,
  getAdminReports,
  ReportsResponse,
  ReportsFilters,
  AdminReport,
  ReportDetail,
  getReportDetail,
  bulkUpdateReportStatus,
  bulkDeleteReports,
  getPerformanceSummary,
  getPerformanceTimeseries,
  getPerformanceEndpoints,
  getPerformanceErrors,
  PerformanceSummary,
  PerformanceTimeseries,
  PerformanceEndpoints,
  PerformanceErrors,
} from '@/lib/api';
import { KPICard } from '@/components/admin/KPICard';
import { FilterPanel } from '@/components/admin/FilterPanel';
import { UsersFilterPanel } from '@/components/admin/UsersFilterPanel';
import { ModerationFilterPanel } from '@/components/admin/ModerationFilterPanel';
import { DataTable, Column } from '@/components/admin/DataTable';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { EmailNotificationModal } from '@/components/admin/EmailNotificationModal';
import { ReportDetailsModal } from '@/components/admin/ReportDetailsModal';
import { ResolutionNoteModal } from '@/components/admin/ResolutionNoteModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TabKey = 'overview' | 'users' | 'listings' | 'performance' | 'moderation' | 'system';

const TABS = [
  { key: 'overview' as TabKey, label: 'Overview', enabled: true },
  { key: 'users' as TabKey, label: 'Users', enabled: true },
  { key: 'listings' as TabKey, label: 'Listings', enabled: true },
  { key: 'performance' as TabKey, label: 'Performance', enabled: true },
  { key: 'moderation' as TabKey, label: 'Moderation', enabled: true },
  { key: 'system' as TabKey, label: 'System Health', enabled: false },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Analytics Dashboard</h1>
        <p className="text-[#666666] mt-1">Platform metrics and insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#EBEBEB] mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => tab.enabled && setActiveTab(tab.key)}
              disabled={!tab.enabled}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                transition-colors
                ${
                  activeTab === tab.key
                    ? 'border-[#00843D] text-[#00843D]'
                    : tab.enabled
                    ? 'border-transparent text-[#666666] hover:text-[#1A1A1A] hover:border-[#EBEBEB]'
                    : 'border-transparent text-[#CCCCCC] cursor-not-allowed'
                }
              `}
              aria-current={activeTab === tab.key ? 'page' : undefined}
              aria-disabled={!tab.enabled}
            >
              {tab.label}
              {!tab.enabled && (
                <span className="ml-2 text-xs bg-[#F8F8F8] px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'listings' && <ListingsTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'system' && <PlaceholderTab name="System Health" />}
      </div>
      </div>
    </ErrorBoundary>
  );
}

function OverviewTab() {
  const { getAccessToken } = useAuth();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const hasLoaded = useRef(false);

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const data = await getOverviewMetrics(token);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      console.error('Failed to load overview metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadMetrics();

    // Refresh every 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Platform Overview</h2>
        <button
          onClick={loadMetrics}
          disabled={isLoading}
          className="text-sm text-[#00843D] hover:text-[#006930] disabled:text-[#CCCCCC]"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* KPI Grid - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Users"
          value={metrics?.users.total ?? 0}
          trend={
            metrics
              ? {
                  value: Number(metrics.users.growthPercentage.toFixed(1)),
                  isPositive: metrics.users.growthPercentage >= 0,
                }
              : undefined
          }
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Total Listings"
          value={metrics?.listings.total ?? 0}
          subtitle={
            metrics
              ? `${metrics.listings.active} active, ${metrics.listings.sold} sold`
              : undefined
          }
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Conversion Rate"
          value={metrics ? `${metrics.conversion.conversionRate.toFixed(2)}%` : '0%'}
          subtitle={
            metrics
              ? `${metrics.conversion.totalSales.toLocaleString()} sales / ${metrics.conversion.totalViews.toLocaleString()} views`
              : undefined
          }
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Platform Health"
          value={metrics ? `${metrics.health.score}/100` : '0/100'}
          subtitle={metrics ? getHealthSubtitle(metrics.health.score) : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
      </div>

      {/* Health Breakdown */}
      {metrics && !isLoading && (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Health Score Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HealthMetric
              label="Active Listings"
              value={metrics.health.breakdown.activeListings}
              weight={30}
              description="Percentage of listings currently active vs sold/expired. Higher is better for marketplace inventory."
            />
            <HealthMetric
              label="Email Verification"
              value={metrics.health.breakdown.emailVerification}
              weight={25}
              description="Percentage of users who have verified their email address. Critical for trust and communication."
            />
            <HealthMetric
              label="Recent Activity"
              value={metrics.health.breakdown.recentActivity}
              weight={25}
              description="Users who logged in within the last 30 days. Indicates platform engagement and retention."
            />
            <HealthMetric
              label="Report Resolution"
              value={metrics.health.breakdown.reportResolution}
              weight={20}
              description="Percentage of reports that have been resolved or dismissed. Shows moderation effectiveness."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function HealthMetric({ label, value, weight, description }: { label: string; value: number; weight: number; description?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#666666]">{label}</span>
        <span className="text-[#1A1A1A] font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-[#F8F8F8] rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getHealthColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <div className="text-xs text-[#999999] mt-1">Weight: {weight}%</div>
      {description && (
        <p className="text-xs text-[#999999] mt-2 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-[#22C55E]';
  if (score >= 60) return 'bg-[#FFCD00]';
  if (score >= 40) return 'bg-[#F59E0B]';
  return 'bg-[#EF4444]';
}

function getHealthSubtitle(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

function ListingsTab() {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState<ListingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<ListingsFilters>({
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortDirection: 'desc',
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const hasLoaded = useRef(false);

  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await getAdminListings(token, filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
      console.error('Failed to load listings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, filters]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadListings();
  }, [loadListings]);

  // Reload when filters change
  useEffect(() => {
    if (!hasLoaded.current) return;
    loadListings();
  }, [filters, loadListings]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-[#22C55E] text-white',
      draft: 'bg-[#999999] text-white',
      sold: 'bg-[#00843D] text-white',
      expired: 'bg-[#F59E0B] text-white',
      removed: 'bg-[#EF4444] text-white',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortDirection: prev.sortBy === column && prev.sortDirection === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedRows(new Set(data?.listings.map((l) => l.id) || []));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkDeleteListings(token, Array.from(selectedRows));
      setIsDeleteModalOpen(false);
      setSelectedRows(new Set());
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listings');
      console.error('Failed to bulk delete:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkUpdateListingStatus(token, Array.from(selectedRows), status);
      setIsStatusModalOpen(false);
      setSelectedRows(new Set());
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listings');
      console.error('Failed to bulk update:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || selectedRows.size === 0) return;

    const selectedListings = data.listings.filter((l) => selectedRows.has(l.id));
    const headers = ['Combination', 'State', 'Type', 'Price', 'Status', 'Views', 'Owner Email', 'Created'];
    const rows = selectedListings.map((l) => [
      l.combination,
      l.state,
      l.plateType,
      (l.price / 100).toFixed(2),
      l.status,
      l.viewsCount.toString(),
      l.ownerEmail,
      new Date(l.createdAt).toLocaleDateString('en-AU'),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<AdminListing>[] = [
    {
      key: 'combination' as const,
      label: 'Combination',
      sortable: true,
    },
    {
      key: 'state' as const,
      label: 'State',
      sortable: true,
    },
    {
      key: 'plateType' as const,
      label: 'Type',
      sortable: true,
      render: (listing: AdminListing) => (
        <span className="capitalize">{listing.plateType.replace(/([A-Z])/g, ' $1').trim()}</span>
      ),
    },
    {
      key: 'price' as const,
      label: 'Price',
      sortable: true,
      render: (listing: AdminListing) => formatCurrency(listing.price),
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: true,
      render: (listing: AdminListing) => getStatusBadge(listing.status),
    },
    {
      key: 'viewsCount' as const,
      label: 'Views',
      sortable: true,
    },
    {
      key: 'ownerEmail' as const,
      label: 'Owner Email',
      sortable: false,
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      sortable: true,
      render: (listing: AdminListing) => formatDate(listing.createdAt),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Listings Management</h2>
        <button
          onClick={loadListings}
          disabled={isLoading}
          className="text-sm text-[#00843D] hover:text-[#006930] disabled:text-[#CCCCCC]"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Listings"
          value={data?.summary.total ?? 0}
          subtitle={data ? `${data.summary.active} active` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Active Listings"
          value={data?.summary.active ?? 0}
          subtitle={data ? `Avg: ${formatCurrency(data.summary.avgPrice)}` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Pending Reports"
          value={data?.summary.pendingReports ?? 0}
          subtitle={
            data?.summary.pendingReports && data.summary.pendingReports > 0
              ? '⚠️ Needs attention'
              : 'All clear'
          }
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Boost Revenue"
          value={data ? formatCurrency(data.summary.boostRevenue7d) : '$0.00'}
          subtitle={data ? `30d: ${formatCurrency(data.summary.boostRevenue30d)}` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Listings Table */}
      <DataTable<AdminListing>
        data={data?.listings ?? []}
        isLoading={isLoading}
        columns={columns}
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSort={handleSort}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        emptyMessage={{
          title: 'No listings found',
          description: 'Try adjusting your filters to see more results.',
        }}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.size}
        onChangeStatus={() => setIsStatusModalOpen(true)}
        onExportCSV={handleExportCSV}
        onDelete={() => setIsDeleteModalOpen(true)}
        onClearSelection={handleClearSelection}
        itemLabel="listing"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Listings"
        message={`Are you sure you want to delete ${selectedRows.size} ${selectedRows.size === 1 ? 'listing' : 'listings'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isPerformingAction}
      />

      {/* Status Change Modal */}
      <ConfirmModal
        isOpen={isStatusModalOpen}
        title="Change Status"
        message={`Select a new status for ${selectedRows.size} ${selectedRows.size === 1 ? 'listing' : 'listings'}:`}
        confirmText="Update"
        cancelText="Cancel"
        confirmVariant="primary"
        onConfirm={() => handleBulkStatusChange('active')}
        onCancel={() => setIsStatusModalOpen(false)}
        isLoading={isPerformingAction}
      />
    </div>
  );
}

function UsersTab() {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortDirection: 'desc',
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const hasLoaded = useRef(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await getAdminUsers(token, filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, filters]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadUsers();
  }, [loadUsers]);

  // Reload when filters change
  useEffect(() => {
    if (!hasLoaded.current) return;
    loadUsers();
  }, [filters, loadUsers]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-[#22C55E] text-white',
      inactive: 'bg-[#999999] text-white',
      banned: 'bg-[#EF4444] text-white',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getVerifiedBadge = (verified: boolean) => {
    return verified ? (
      <span className="inline-flex items-center gap-1 text-[#22C55E]">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Yes
      </span>
    ) : (
      <span className="text-[#999999]">No</span>
    );
  };

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortDirection: prev.sortBy === column && prev.sortDirection === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedRows(new Set(data?.users.map((u) => u.id) || []));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkDeleteUsers(token, Array.from(selectedRows));
      setIsDeleteModalOpen(false);
      setSelectedRows(new Set());
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete users');
      console.error('Failed to bulk delete users:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleBulkBan = async () => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkUpdateUserStatus(token, Array.from(selectedRows), 'ban');
      setIsBanModalOpen(false);
      setSelectedRows(new Set());
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban users');
      console.error('Failed to bulk ban users:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleBulkUnban = async () => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkUpdateUserStatus(token, Array.from(selectedRows), 'unban');
      setIsUnbanModalOpen(false);
      setSelectedRows(new Set());
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unban users');
      console.error('Failed to bulk unban users:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleSendNotification = async (subject: string, message: string) => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await sendBulkNotification(token, Array.from(selectedRows), subject, message);
      setIsEmailModalOpen(false);
      setSelectedRows(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notifications');
      console.error('Failed to send notifications:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || selectedRows.size === 0) return;

    const selectedUsers = data.users.filter((u) => selectedRows.has(u.id));
    const headers = ['Email', 'Name', 'Created', 'Listings Count', 'Email Verified', 'Last Active', 'Status', 'Account Type'];
    const rows = selectedUsers.map((u) => [
      u.email,
      u.fullName || '',
      new Date(u.createdAt).toLocaleDateString('en-AU'),
      u.listingsCount.toString(),
      u.emailVerified ? 'Yes' : 'No',
      u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('en-AU') : 'Never',
      u.status,
      u.accountType,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'email' as const,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'fullName' as const,
      label: 'Name',
      sortable: true,
      render: (user: AdminUser) => user.fullName || '-',
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      sortable: true,
      render: (user: AdminUser) => formatDate(user.createdAt),
    },
    {
      key: 'listingsCount' as const,
      label: 'Listings',
      sortable: false,
    },
    {
      key: 'emailVerified' as const,
      label: 'Email Verified',
      sortable: false,
      render: (user: AdminUser) => getVerifiedBadge(user.emailVerified),
    },
    {
      key: 'lastSignInAt' as const,
      label: 'Last Active',
      sortable: true,
      render: (user: AdminUser) => user.lastSignInAt ? formatDate(user.lastSignInAt) : 'Never',
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: false,
      render: (user: AdminUser) => getStatusBadge(user.status),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Users Management</h2>
        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="text-sm text-[#00843D] hover:text-[#006930] disabled:text-[#CCCCCC]"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Users"
          value={data?.summary.total ?? 0}
          trend={
            data
              ? {
                  value: Number(data.summary.growth7d.toFixed(1)),
                  isPositive: data.summary.growth7d >= 0,
                }
              : undefined
          }
          subtitle={data ? `30d: ${data.summary.growth30d >= 0 ? '+' : ''}${data.summary.growth30d.toFixed(1)}%` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Active Users"
          value={data?.summary.activeUsers30d ?? 0}
          subtitle="Last 30 days"
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Email Verified"
          value={data ? `${data.summary.emailVerifiedPercent.toFixed(1)}%` : '0%'}
          subtitle={data ? `${data.summary.emailVerifiedCount.toLocaleString()} users` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Revenue per User"
          value={data ? formatCurrency(data.summary.revenuePerUser) : '$0.00'}
          subtitle={data ? `Total: ${formatCurrency(data.summary.totalRevenue)}` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
      </div>

      {/* Filters */}
      <UsersFilterPanel
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Users Table */}
      <DataTable<AdminUser>
        data={data?.users ?? []}
        isLoading={isLoading}
        columns={columns}
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSort={handleSort}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        emptyMessage={{
          title: 'No users found',
          description: 'Try adjusting your filters to see more results.',
        }}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.size}
        onChangeStatus={() => {
          // Check if any selected users are not banned
          const selectedUsers = data?.users.filter((u) => selectedRows.has(u.id)) || [];
          const hasActiveBannedUsers = selectedUsers.some((u) => u.status !== 'banned');

          // If any users are not banned, show ban modal; otherwise show unban modal
          if (hasActiveBannedUsers) {
            setIsBanModalOpen(true);
          } else {
            setIsUnbanModalOpen(true);
          }
        }}
        onExportCSV={handleExportCSV}
        onDelete={() => setIsDeleteModalOpen(true)}
        onClearSelection={handleClearSelection}
        itemLabel="user"
        customActions={[
          {
            label: 'Send Email',
            onClick: () => setIsEmailModalOpen(true),
            variant: 'primary' as const,
          },
        ]}
      />

      {/* Email Notification Modal */}
      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        selectedCount={selectedRows.size}
        onSend={handleSendNotification}
        onCancel={() => setIsEmailModalOpen(false)}
        isLoading={isPerformingAction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedRows.size} ${selectedRows.size === 1 ? 'user' : 'users'}? This will soft delete the accounts and preserve data for audit purposes.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isPerformingAction}
      />

      {/* Ban Confirmation Modal */}
      <ConfirmModal
        isOpen={isBanModalOpen}
        title="Ban Users"
        message={`Are you sure you want to ban ${selectedRows.size} ${selectedRows.size === 1 ? 'user' : 'users'}? Banned users cannot sign in to the platform.`}
        confirmText="Ban Users"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleBulkBan}
        onCancel={() => setIsBanModalOpen(false)}
        isLoading={isPerformingAction}
      />

      {/* Unban Confirmation Modal */}
      <ConfirmModal
        isOpen={isUnbanModalOpen}
        title="Unban Users"
        message={`Are you sure you want to unban ${selectedRows.size} ${selectedRows.size === 1 ? 'user' : 'users'}? They will be able to sign in again.`}
        confirmText="Unban Users"
        cancelText="Cancel"
        confirmVariant="primary"
        onConfirm={handleBulkUnban}
        onCancel={() => setIsUnbanModalOpen(false)}
        isLoading={isPerformingAction}
      />
    </div>
  );
}

function ModerationTab() {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<ReportsFilters>({
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortDirection: 'desc',
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const hasLoaded = useRef(false);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await getAdminReports(token, filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, filters]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadReports();
  }, [loadReports]);

  // Reload when filters change
  useEffect(() => {
    if (!hasLoaded.current) return;
    loadReports();
  }, [filters, loadReports]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-[#F59E0B] text-white',
      reviewed: 'bg-[#3B82F6] text-white',
      resolved: 'bg-[#22C55E] text-white',
      dismissed: 'bg-[#999999] text-white',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Inappropriate Content',
      suspected_fraud: 'Suspected Fraud',
      incorrect_information: 'Incorrect Information',
      already_sold: 'Already Sold',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortDirection: prev.sortBy === column && prev.sortDirection === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedRows(new Set(data?.reports.map((r) => r.id) || []));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleBulkResolve = async (note: string) => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkUpdateReportStatus(token, Array.from(selectedRows), 'resolve', note);
      setIsResolveModalOpen(false);
      setSelectedRows(new Set());
      setSelectedReport(null); // Clear selected report if coming from quick action
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve reports');
      console.error('Failed to bulk resolve reports:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleBulkDismiss = async (reason: string) => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkUpdateReportStatus(token, Array.from(selectedRows), 'dismiss', undefined, reason);
      setIsDismissModalOpen(false);
      setSelectedRows(new Set());
      setSelectedReport(null); // Clear selected report if coming from quick action
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss reports');
      console.error('Failed to bulk dismiss reports:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await bulkDeleteReports(token, Array.from(selectedRows));
      setIsDeleteModalOpen(false);
      setSelectedRows(new Set());
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reports');
      console.error('Failed to bulk delete reports:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || selectedRows.size === 0) return;

    const selectedReports = data.reports.filter((r) => selectedRows.has(r.id));
    const headers = ['Report ID', 'Type', 'Reporter Email', 'Reported Content', 'Content Type', 'Status', 'Created', 'Reviewed'];
    const rows = selectedReports.map((r) => [
      r.id.slice(0, 8),
      getReasonLabel(r.reportReason),
      r.reporterEmail,
      r.reportedContentPreview,
      r.reportedContentType,
      r.status,
      new Date(r.createdAt).toLocaleDateString('en-AU'),
      r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString('en-AU') : 'Not reviewed',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = async (reportId: string) => {
    try {
      setIsPerformingAction(true);
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const report = await getReportDetail(token, reportId);
      setSelectedReport(report);
      setIsDetailsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report details');
      console.error('Failed to load report details:', err);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleQuickResolve = () => {
    if (!selectedReport) return;
    // Close details modal and open resolve modal with single report selected
    setIsDetailsModalOpen(false);
    setSelectedRows(new Set([selectedReport.id]));
    setIsResolveModalOpen(true);
  };

  const handleQuickDismiss = () => {
    if (!selectedReport) return;
    // Close details modal and open dismiss modal with single report selected
    setIsDetailsModalOpen(false);
    setSelectedRows(new Set([selectedReport.id]));
    setIsDismissModalOpen(true);
  };

  const columns: Column<AdminReport>[] = [
    {
      key: 'id' as const,
      label: 'Report ID',
      sortable: false,
      render: (report: AdminReport) => (
        <span className="font-mono text-xs">{report.id.slice(0, 8)}</span>
      ),
    },
    {
      key: 'reportReason' as const,
      label: 'Type',
      sortable: false,
      render: (report: AdminReport) => getReasonLabel(report.reportReason),
    },
    {
      key: 'reporterEmail' as const,
      label: 'Reporter Email',
      sortable: false,
    },
    {
      key: 'reportedContentPreview' as const,
      label: 'Reported Content',
      sortable: false,
      render: (report: AdminReport) => (
        <span className="truncate max-w-xs" title={report.reportedContentPreview}>
          {report.reportedContentPreview}
        </span>
      ),
    },
    {
      key: 'reportedContentType' as const,
      label: 'Content Type',
      sortable: false,
      render: (report: AdminReport) => (
        <span className="capitalize">{report.reportedContentType}</span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: false,
      render: (report: AdminReport) => getStatusBadge(report.status),
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      sortable: true,
      render: (report: AdminReport) => formatDate(report.createdAt),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      sortable: false,
      render: (report: AdminReport) => (
        <button
          onClick={() => handleViewDetails(report.id)}
          className="text-sm text-[#00843D] hover:text-[#006930] font-medium"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Moderation</h2>
        <button
          onClick={loadReports}
          disabled={isLoading}
          className="text-sm text-[#00843D] hover:text-[#006930] disabled:text-[#CCCCCC]"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Reports"
          value={data?.summary.total ?? 0}
          subtitle={data ? `Offensive: ${data.summary.typeBreakdown.inappropriate_content}, Fraud: ${data.summary.typeBreakdown.suspected_fraud}` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Pending Reports"
          value={data?.summary.pending ?? 0}
          subtitle={
            data?.summary.pending && data.summary.pending > 0
              ? '⚠️ Needs attention'
              : 'All clear'
          }
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Resolved Reports"
          value={data ? `${data.summary.resolutionRate.toFixed(1)}%` : '0%'}
          subtitle={data ? `${data.summary.resolved + data.summary.dismissed} of ${data.summary.total}` : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />

        <KPICard
          label="Avg Resolution Time"
          value={data ? `${data.summary.avgResolutionTimeHours.toFixed(1)}h` : '0h'}
          subtitle="Average time to resolve"
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
      </div>

      {/* Filters */}
      <ModerationFilterPanel
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Reports Table */}
      <DataTable<AdminReport>
        data={data?.reports ?? []}
        isLoading={isLoading}
        columns={columns}
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSort={handleSort}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        emptyMessage={{
          title: 'No reports found',
          description: 'Try adjusting your filters to see more results.',
        }}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.size}
        onChangeStatus={() => setIsResolveModalOpen(true)}
        onExportCSV={handleExportCSV}
        onDelete={() => setIsDeleteModalOpen(true)}
        onClearSelection={handleClearSelection}
        itemLabel="report"
        customActions={[
          {
            label: 'Dismiss',
            onClick: () => setIsDismissModalOpen(true),
            variant: 'secondary' as const,
          },
        ]}
      />

      {/* Report Details Modal */}
      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        report={selectedReport}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedReport(null);
        }}
        onResolve={handleQuickResolve}
        onDismiss={handleQuickDismiss}
        isLoading={isPerformingAction}
      />

      {/* Resolution Note Modal */}
      <ResolutionNoteModal
        isOpen={isResolveModalOpen}
        selectedCount={selectedRows.size}
        action="resolve"
        onConfirm={handleBulkResolve}
        onCancel={() => setIsResolveModalOpen(false)}
        isLoading={isPerformingAction}
      />

      {/* Dismissal Reason Modal */}
      <ResolutionNoteModal
        isOpen={isDismissModalOpen}
        selectedCount={selectedRows.size}
        action="dismiss"
        onConfirm={handleBulkDismiss}
        onCancel={() => setIsDismissModalOpen(false)}
        isLoading={isPerformingAction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Reports"
        message={`Are you sure you want to delete ${selectedRows.size} ${selectedRows.size === 1 ? 'report' : 'reports'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isPerformingAction}
      />
    </div>
  );
}

function PerformanceTab() {
  const { getAccessToken } = useAuth();
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [timeseries, setTimeseries] = useState<PerformanceTimeseries | null>(null);
  const [endpoints, setEndpoints] = useState<PerformanceEndpoints | null>(null);
  const [errors, setErrors] = useState<PerformanceErrors | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const hasLoaded = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPerformanceData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Load all performance data in parallel
      const [summaryData, timeseriesData, endpointsData, errorsData] = await Promise.all([
        getPerformanceSummary(token, timeRange),
        getPerformanceTimeseries(token, timeRange),
        getPerformanceEndpoints(token, timeRange, 10),
        getPerformanceErrors(token, 100),
      ]);

      setSummary(summaryData);
      setTimeseries(timeseriesData);
      setEndpoints(endpointsData);
      setErrors(errorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
      console.error('Failed to load performance data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, timeRange]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadPerformanceData();

    // Poll every 30 seconds for real-time updates
    pollIntervalRef.current = setInterval(loadPerformanceData, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [loadPerformanceData]);

  // Reload when time range changes
  useEffect(() => {
    if (!hasLoaded.current) return;
    loadPerformanceData();
  }, [timeRange, loadPerformanceData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (timeRange === '1h' || timeRange === '6h') {
      return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getTrendIndicator = (value: number) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`text-xs ml-2 ${isPositive ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Performance Monitoring</h2>
        <div className="flex gap-4 items-center">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00843D]"
          >
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={loadPerformanceData}
            disabled={isLoading}
            className="text-sm text-[#00843D] hover:text-[#006930] disabled:text-[#CCCCCC]"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Avg Response Time"
          value={summary ? `${summary.avgResponseTime}ms` : '0ms'}
          subtitle={summary ? getTrendIndicator(summary.avgResponseTimeTrend) : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
        <KPICard
          label="Error Rate"
          value={summary ? `${summary.errorRate.toFixed(2)}%` : '0%'}
          subtitle={summary ? getTrendIndicator(summary.errorRateTrend) : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
        <KPICard
          label="Total Requests"
          value={summary ? summary.totalRequests.toLocaleString() : '0'}
          subtitle={summary ? getTrendIndicator(summary.requestsTrend) : undefined}
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
        <KPICard
          label="P95 Response Time"
          value={summary ? `${summary.p95ResponseTime}ms` : '0ms'}
          subtitle="95th percentile"
          isLoading={isLoading}
          error={error ? 'Error' : undefined}
        />
      </div>

      {/* Charts */}
      {!isLoading && timeseries && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time Chart */}
          <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Response Time (P50/P95/P99)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeseries.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #EBEBEB', borderRadius: '8px' }}
                  formatter={(value: number | undefined) => value !== undefined ? `${value}ms` : 'N/A'}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line type="monotone" dataKey="p50Duration" stroke="#00843D" name="P50" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p95Duration" stroke="#FFCD00" name="P95" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p99Duration" stroke="#EF4444" name="P99" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Error Rate Chart */}
          <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Error Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeseries.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #EBEBEB', borderRadius: '8px' }}
                  formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(2)}%` : 'N/A'}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Area type="monotone" dataKey="errorRate" stroke="#EF4444" fill="#FEE2E2" name="Error Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Request Volume Chart */}
      {!isLoading && timeseries && (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Request Volume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeseries.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
              <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666666" fontSize={12} />
              <YAxis stroke="#666666" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #EBEBEB', borderRadius: '8px' }}
                labelFormatter={formatDate}
              />
              <Legend />
              <Bar dataKey="requestCount" fill="#00843D" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Slowest Endpoints Table */}
      {!isLoading && endpoints && (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Slowest Endpoints (Top 10)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EBEBEB]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Requests</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Avg</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">P95</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">P99</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Errors</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Error %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {endpoints.endpoints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#999999]">
                      No endpoint data available
                    </td>
                  </tr>
                ) : (
                  endpoints.endpoints.map((ep, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F8F8]">
                      <td className="px-4 py-3 text-sm font-mono text-[#1A1A1A]">{ep.endpoint}</td>
                      <td className="px-4 py-3 text-sm text-[#666666]">{ep.method}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#666666]">{ep.requestCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#666666]">{formatDuration(ep.avgDuration)}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#666666]">{formatDuration(ep.p95Duration)}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#666666]">{formatDuration(ep.p99Duration)}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#EF4444]">{ep.errorCount}</td>
                      <td className="px-4 py-3 text-sm text-right text-[#EF4444]">{ep.errorRate.toFixed(2)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Errors Table */}
      {!isLoading && errors && (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Recent Errors (Last 100)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EBEBEB]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Last Seen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Error</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Occurrences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {errors.errors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#999999]">
                      No errors logged
                    </td>
                  </tr>
                ) : (
                  errors.errors.map((err) => (
                    <tr key={err.id} className="hover:bg-[#F8F8F8]">
                      <td className="px-4 py-3 text-sm text-[#666666]">
                        {new Date(err.lastSeen).toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-[#1A1A1A]">{err.endpoint}</td>
                      <td className="px-4 py-3 text-sm text-[#666666]">{err.method}</td>
                      <td className="px-4 py-3 text-sm text-[#EF4444]">{err.statusCode}</td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A] max-w-md truncate" title={err.errorMessage}>
                        {err.errorMessage}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#666666]">{err.occurrenceCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="bg-[#F8F8F8] border border-[#EBEBEB] rounded-lg p-12 text-center">
      <div className="text-4xl mb-4">🚧</div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{name} Tab</h3>
      <p className="text-[#666666]">This feature is under development and will be available in Phase 2.</p>
    </div>
  );
}
