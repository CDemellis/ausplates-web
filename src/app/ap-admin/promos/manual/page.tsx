'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPromoCodes, PromoCode, updatePromoCode, getCampaigns } from '@/lib/api';

function ManualCodesContent() {
  const searchParams = useSearchParams();
  const { getAccessToken } = useAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCodes, setTotalCodes] = useState(0);
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');

  // Get type from URL param - defaults to showing both sourced and manual
  const typeFilter = searchParams.get('type') || '';

  const prevFiltersRef = useRef({ page, search, typeFilter, campaignFilter });

  const loadCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getPromoCodes(token, {
        type: typeFilter as 'sourced' | 'manual' | undefined,
        campaign: campaignFilter || undefined,
        search: search || undefined,
        page,
        limit: 50,
      });
      setCodes(data.codes);
      setTotalPages(data.pagination.totalPages);
      setTotalCodes(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load codes');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, typeFilter, campaignFilter, search, page]);

  const loadCampaigns = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const campaignList = await getCampaigns(token);
      setCampaigns(campaignList);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  }, [getAccessToken]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged = prev.page !== page || prev.search !== search || prev.typeFilter !== typeFilter || prev.campaignFilter !== campaignFilter;

    if (filtersChanged) {
      prevFiltersRef.current = { page, search, typeFilter, campaignFilter };
    }

    loadCodes();
  }, [loadCodes, page, search, typeFilter, campaignFilter]);

  // CSV Export functionality
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token = await getAccessToken();
      if (!token) return;

      // Fetch all codes matching current filters (up to 10000)
      const data = await getPromoCodes(token, {
        type: typeFilter as 'sourced' | 'manual' | undefined,
        campaign: campaignFilter || undefined,
        search: search || undefined,
        page: 1,
        limit: 10000,
      });

      if (data.codes.length === 0) {
        setError('No codes to export');
        return;
      }

      // Generate CSV content
      const headers = ['code', 'type', 'max_uses', 'times_used', 'status', 'campaign', 'source', 'expires_at', 'created_at'];
      const csvRows = [
        headers.join(','),
        ...data.codes.map(code => [
          code.code,
          code.type,
          code.maxUses,
          code.timesUsed,
          code.isActive ? code.status : 'deactivated',
          code.campaign || '',
          code.source || '',
          code.expiresAt || '',
          code.createdAt || '',
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ];

      const csvContent = csvRows.join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = campaignFilter
        ? `promo-codes-${campaignFilter}-${new Date().toISOString().split('T')[0]}.csv`
        : `promo-codes-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export codes');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeactivate = async (code: PromoCode) => {
    if (!confirm(`Deactivate code ${code.code}?`)) return;

    try {
      const token = await getAccessToken();
      if (!token) return;

      await updatePromoCode(token, code.id, { isActive: false });
      loadCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate code');
    }
  };

  const handleActivate = async (code: PromoCode) => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      await updatePromoCode(token, code.id, { isActive: true });
      loadCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate code');
    }
  };

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
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mt-4">
          {typeFilter === 'sourced' ? 'Sourced Codes' : typeFilter === 'manual' ? 'Manual Codes' : 'All Codes'}
        </h1>
        <p className="text-[#666666] mt-1">Admin-created promo codes</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search codes..."
          className="px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D] w-64"
        />
        <div className="flex gap-2">
          <Link
            href="/promos/manual"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !typeFilter
                ? 'bg-[#00843D] text-white'
                : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
            }`}
          >
            All
          </Link>
          <Link
            href="/promos/manual?type=sourced"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === 'sourced'
                ? 'bg-[#00843D] text-white'
                : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
            }`}
          >
            Sourced
          </Link>
          <Link
            href="/promos/manual?type=manual"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === 'manual'
                ? 'bg-[#00843D] text-white'
                : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
            }`}
          >
            Manual
          </Link>
        </div>
        {/* Campaign Filter */}
        {campaigns.length > 0 && (
          <select
            value={campaignFilter}
            onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D] text-sm"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        <div className="ml-auto flex gap-2">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting || codes.length === 0}
            className="px-4 py-2 bg-white border border-[#EBEBEB] text-[#1A1A1A] rounded-lg text-sm font-medium hover:border-[#00843D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV {totalCodes > 0 && `(${totalCodes})`}
              </>
            )}
          </button>
          <Link
            href="/promos/create"
            className="px-4 py-2 bg-[#00843D] text-white rounded-lg text-sm font-medium hover:bg-[#006B32]"
          >
            + Create Code
          </Link>
        </div>
      </div>

      {codes.length === 0 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-8 text-center text-[#666666]">
          No codes found
        </div>
      ) : (
        <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F8F8] border-b border-[#EBEBEB]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Campaign</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Uses</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Expires</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-[#F8F8F8]">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-[#1A1A1A]">
                      {code.code}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        code.type === 'sourced' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {code.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666666]">{code.source || '-'}</td>
                    <td className="px-4 py-3 text-sm text-[#666666]">{code.campaign || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-[#1A1A1A]">
                      {code.timesUsed} / {code.maxUses}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        !code.isActive ? 'bg-gray-100 text-gray-700' :
                        code.status === 'active' ? 'bg-green-100 text-green-700' :
                        code.status === 'redeemed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {!code.isActive ? 'Deactivated' : code.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666666]">
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {code.isActive ? (
                        <button
                          onClick={() => handleDeactivate(code)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(code)}
                          className="text-sm text-green-600 hover:underline"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#EBEBEB] flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm border border-[#EBEBEB] disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-[#666666]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-[#EBEBEB] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManualCodesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-[#666666]">Loading...</div>
      </div>
    }>
      <ManualCodesContent />
    </Suspense>
  );
}
