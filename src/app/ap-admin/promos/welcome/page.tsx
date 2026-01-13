'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPromoCodes, PromoCode, updatePromoCode } from '@/lib/api';

export default function WelcomeCodesPage() {
  const { getAccessToken } = useAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const prevFiltersRef = useRef({ page, statusFilter });

  const loadCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getPromoCodes(token, {
        type: 'welcome',
        status: statusFilter || undefined,
        page,
        limit: 50,
      });
      setCodes(data.codes);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load codes');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, statusFilter, page]);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged = prev.page !== page || prev.statusFilter !== statusFilter;

    if (filtersChanged) {
      prevFiltersRef.current = { page, statusFilter };
    }

    loadCodes();
  }, [loadCodes, page, statusFilter]);

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
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mt-4">Welcome Codes</h1>
        <p className="text-[#666666] mt-1">Auto-generated on email verification</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['', 'active', 'redeemed', 'expired', 'superseded'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[#00843D] text-white'
                : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {codes.length === 0 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-8 text-center text-[#666666]">
          No welcome codes found
        </div>
      ) : (
        <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F8F8] border-b border-[#EBEBEB]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Expires</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#666666]">Created</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#666666]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-[#F8F8F8]">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-[#1A1A1A]">
                      {code.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666666]">
                      {code.users?.email || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={code.status} isActive={code.isActive} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666666]">
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666666]">
                      {new Date(code.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {code.isActive && code.status === 'active' && (
                        <button
                          onClick={() => handleDeactivate(code)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Deactivate
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

function StatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  const colors: Record<string, string> = {
    active: isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700',
    redeemed: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-100 text-gray-700',
    superseded: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {!isActive ? 'Deactivated' : status}
    </span>
  );
}
