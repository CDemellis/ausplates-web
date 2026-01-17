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
} from '@/lib/api';
import { KPICard } from '@/components/admin/KPICard';
import { FilterPanel } from '@/components/admin/FilterPanel';
import { DataTable } from '@/components/admin/DataTable';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type TabKey = 'overview' | 'users' | 'listings' | 'performance' | 'moderation' | 'system';

const TABS = [
  { key: 'overview' as TabKey, label: 'Overview', enabled: true },
  { key: 'users' as TabKey, label: 'Users', enabled: true },
  { key: 'listings' as TabKey, label: 'Listings', enabled: true },
  { key: 'performance' as TabKey, label: 'Performance', enabled: false },
  { key: 'moderation' as TabKey, label: 'Moderation', enabled: false },
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
        {activeTab === 'performance' && <PlaceholderTab name="Performance" />}
        {activeTab === 'moderation' && <PlaceholderTab name="Moderation" />}
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
            />
            <HealthMetric
              label="Email Verification"
              value={metrics.health.breakdown.emailVerification}
              weight={25}
            />
            <HealthMetric
              label="Recent Activity"
              value={metrics.health.breakdown.recentActivity}
              weight={25}
            />
            <HealthMetric
              label="Report Resolution"
              value={metrics.health.breakdown.reportResolution}
              weight={20}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function HealthMetric({ label, value, weight }: { label: string; value: number; weight: number }) {
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
      sortBy: column as any,
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

  const columns = [
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
      <DataTable
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
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.size}
        onChangeStatus={() => setIsStatusModalOpen(true)}
        onExportCSV={handleExportCSV}
        onDelete={() => setIsDeleteModalOpen(true)}
        onClearSelection={handleClearSelection}
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

      {/* Placeholder for filters and table */}
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Users Table</h3>
        <div className="text-[#666666] text-sm">
          <p>Filters and table coming next...</p>
          {data && (
            <p className="mt-2">
              Found {data.pagination.total} users (page {data.pagination.page} of {data.pagination.totalPages})
            </p>
          )}
        </div>
      </div>
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
