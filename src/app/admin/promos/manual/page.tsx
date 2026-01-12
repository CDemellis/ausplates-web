'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPromoCodes, PromoCode, updatePromoCode } from '@/lib/api';

const ADMIN_EMAIL = 'hello@ausplates.app';

function ManualCodesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Get type from URL param - defaults to showing both sourced and manual
  const typeFilter = searchParams.get('type') || '';

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/');
      return;
    }

    if (user?.email === ADMIN_EMAIL) {
      loadCodes();
    }
  }, [user, authLoading, router, page, search, typeFilter]);

  const loadCodes = async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getPromoCodes(token, {
        type: typeFilter as 'sourced' | 'manual' | undefined,
        search: search || undefined,
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
          <Link href="/admin/promos" className="text-[#00843D] hover:underline text-sm">
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
        <div className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search codes..."
            className="px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D] w-64"
          />
          <div className="flex gap-2">
            <Link
              href="/admin/promos/manual"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !typeFilter
                  ? 'bg-[#00843D] text-white'
                  : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
              }`}
            >
              All
            </Link>
            <Link
              href="/admin/promos/manual?type=sourced"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'sourced'
                  ? 'bg-[#00843D] text-white'
                  : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
              }`}
            >
              Sourced
            </Link>
            <Link
              href="/admin/promos/manual?type=manual"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'manual'
                  ? 'bg-[#00843D] text-white'
                  : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
              }`}
            >
              Manual
            </Link>
          </div>
          <Link
            href="/admin/promos/create"
            className="ml-auto px-4 py-2 bg-[#00843D] text-white rounded-lg text-sm font-medium hover:bg-[#006B32]"
          >
            + Create Code
          </Link>
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
    </div>
  );
}

export default function ManualCodesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-[#666666]">Loading...</div>
      </div>
    }>
      <ManualCodesContent />
    </Suspense>
  );
}
