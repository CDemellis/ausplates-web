'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getSourceStats, SourceStats } from '@/lib/api';

export default function SourcesPage() {
  const { getAccessToken } = useAuth();
  const [sources, setSources] = useState<SourceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const hasLoaded = useRef(false);

  const loadSources = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getSourceStats(token);
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadSources();
  }, [loadSources]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-[#666666]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/promos" className="text-[#00843D] hover:underline text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mt-4">Source Performance</h1>
        <p className="text-[#666666] mt-1">Track attribution and conversion rates</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {sources.length === 0 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-8 text-center text-[#666666]">
          No sourced codes created yet
        </div>
      ) : (
        <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F8F8] border-b border-[#EBEBEB]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Campaign</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Codes</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Active</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Uses</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Max Uses</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Page Views</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {sources.map((s, i) => (
                  <tr key={i} className="hover:bg-[#F8F8F8]">
                    <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A]">{s.source}</td>
                    <td className="px-4 py-3 text-sm text-[#666666]">{s.campaign || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#1A1A1A]">{s.totalCodes}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#1A1A1A]">{s.activeCodes}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#22C55E] font-medium">{s.totalUses}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#666666]">{s.maxPossibleUses}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#1A1A1A]">{s.pageViews}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#1A1A1A]">{s.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
