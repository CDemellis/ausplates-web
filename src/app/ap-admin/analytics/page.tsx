'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getOverviewMetrics,
  OverviewMetrics,
  getAdminListings,
  ListingsResponse,
  ListingsFilters,
} from '@/lib/api';
import { KPICard } from '@/components/admin/KPICard';
import { FilterPanel } from '@/components/admin/FilterPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type TabKey = 'overview' | 'users' | 'listings' | 'performance' | 'moderation' | 'system';

const TABS = [
  { key: 'overview' as TabKey, label: 'Overview', enabled: true },
  { key: 'users' as TabKey, label: 'Users', enabled: false },
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
        {activeTab === 'users' && <PlaceholderTab name="Users" />}
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

      {/* Listings Table Placeholder */}
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Listings Table</h3>
        <div className="text-[#666666] text-sm">
          <p>Table and bulk actions coming next...</p>
          {data && (
            <p className="mt-2">
              Found {data.pagination.total} listings (page {data.pagination.page} of {data.pagination.totalPages})
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
