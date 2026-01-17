'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPromoStats, PromoStats } from '@/lib/api';

export default function AdminDashboardPage() {
  const { getAccessToken } = useAuth();
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const hasLoaded = useRef(false);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getPromoStats(token);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-[#666666]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Admin Dashboard</h1>
        <p className="text-[#666666] mt-1">Overview of AusPlates admin functions</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Promo Codes" value={stats.totalCodes} />
          <StatCard label="Total Redemptions" value={stats.totalRedemptions} color="green" />
          <StatCard label="Active Welcome" value={stats.activeWelcomeCodes} />
          <StatCard label="Flagged Users" value={stats.flaggedUsers} color={stats.flaggedUsers > 0 ? 'red' : undefined} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/analytics" className="p-6 bg-white border-2 border-[#00843D] rounded-lg hover:bg-[#F0F9F4] transition-colors text-center">
            <div className="text-3xl mb-3">📊</div>
            <div className="font-medium text-[#1A1A1A]">Analytics Dashboard</div>
            <div className="text-sm text-[#666666] mt-1">Platform metrics & insights</div>
          </Link>
          <Link href="/promos" className="p-6 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-3xl mb-3">🎫</div>
            <div className="font-medium text-[#1A1A1A]">Promo Dashboard</div>
            <div className="text-sm text-[#666666] mt-1">View stats and manage codes</div>
          </Link>
          <Link href="/promos/create" className="p-6 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-3xl mb-3">+</div>
            <div className="font-medium text-[#1A1A1A]">Create Promo</div>
            <div className="text-sm text-[#666666] mt-1">Generate new codes</div>
          </Link>
          <Link href="/promos/flagged" className="p-6 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center relative">
            <div className="text-3xl mb-3">🚩</div>
            <div className="font-medium text-[#1A1A1A]">Flagged Users</div>
            <div className="text-sm text-[#666666] mt-1">Review suspicious activity</div>
            {stats && stats.flaggedUsers > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.flaggedUsers}
              </span>
            )}
          </Link>
          <Link href="/2fa/settings" className="p-6 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-3xl mb-3">🔐</div>
            <div className="font-medium text-[#1A1A1A]">2FA Settings</div>
            <div className="text-sm text-[#666666] mt-1">Manage security</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: 'green' | 'red' }) {
  const colorClasses = {
    green: 'text-[#22C55E]',
    red: 'text-[#EF4444]',
    default: 'text-[#1A1A1A]',
  };

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-lg p-4">
      <div className="text-sm text-[#666666]">{label}</div>
      <div className={`text-2xl font-semibold ${colorClasses[color || 'default']}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
