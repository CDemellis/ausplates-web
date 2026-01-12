'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPromoStats, PromoStats, PromoRedemption } from '@/lib/api';

const ADMIN_EMAIL = 'hello@ausplates.app';

export default function AdminPromosPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<PromoRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/');
      return;
    }

    if (user?.email === ADMIN_EMAIL) {
      loadStats();
    }
  }, [user, authLoading, router]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getPromoStats(token);
      setStats(data.stats);
      setRecentRedemptions(data.recentRedemptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-[#666666]">Loading...</div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Promo Code Dashboard</h1>
          <p className="text-[#666666] mt-1">Manage promo codes and track performance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Codes" value={stats.totalCodes} />
            <StatCard label="Total Redemptions" value={stats.totalRedemptions} color="green" />
            <StatCard label="Active Welcome" value={stats.activeWelcomeCodes} />
            <StatCard label="Flagged Users" value={stats.flaggedUsers} color={stats.flaggedUsers > 0 ? 'red' : undefined} />
            <StatCard label="Welcome Codes" value={stats.welcomeCodes} />
            <StatCard label="Sourced Codes" value={stats.sourcedCodes} />
            <StatCard label="Manual Codes" value={stats.manualCodes} />
            <StatCard label="Page Views (7d)" value={stats.pageViewsLast7Days} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link href="/admin/promos/create" className="p-4 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-2xl mb-2">+</div>
            <div className="text-sm font-medium text-[#1A1A1A]">Create Code</div>
          </Link>
          <Link href="/admin/promos/sources" className="p-4 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-[#1A1A1A]">Sources</div>
          </Link>
          <Link href="/admin/promos/welcome" className="p-4 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-2xl mb-2">👋</div>
            <div className="text-sm font-medium text-[#1A1A1A]">Welcome</div>
          </Link>
          <Link href="/admin/promos/manual" className="p-4 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-2xl mb-2">🎫</div>
            <div className="text-sm font-medium text-[#1A1A1A]">Manual</div>
          </Link>
          <Link href="/admin/promos/flagged" className="p-4 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center relative">
            <div className="text-2xl mb-2">🚩</div>
            <div className="text-sm font-medium text-[#1A1A1A]">Flagged</div>
            {stats && stats.flaggedUsers > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.flaggedUsers}
              </span>
            )}
          </Link>
          <Link href="/admin/promos?type=sourced" className="p-4 bg-white border border-[#EBEBEB] rounded-lg hover:border-[#00843D] transition-colors text-center">
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-sm font-medium text-[#1A1A1A]">All Codes</div>
          </Link>
        </div>

        {/* Recent Redemptions */}
        <div className="bg-white border border-[#EBEBEB] rounded-lg">
          <div className="p-4 border-b border-[#EBEBEB]">
            <h2 className="font-semibold text-[#1A1A1A]">Recent Redemptions</h2>
          </div>
          {recentRedemptions.length === 0 ? (
            <div className="p-8 text-center text-[#666666]">
              No redemptions yet
            </div>
          ) : (
            <div className="divide-y divide-[#EBEBEB]">
              {recentRedemptions.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#1A1A1A]">{r.promoCodes?.code || 'Unknown'}</div>
                    <div className="text-sm text-[#666666]">
                      {r.users?.email || 'Unknown user'} • {r.source || 'No source'}
                    </div>
                  </div>
                  <div className="text-sm text-[#999999]">
                    {new Date(r.redeemedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
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
