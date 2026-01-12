'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createPromoCode, bulkCreatePromoCodes } from '@/lib/api';

const ADMIN_EMAIL = 'hello@ausplates.app';

export default function CreatePromoPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Single code form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'sourced' | 'manual'>('sourced');
  const [maxUses, setMaxUses] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [campaign, setCampaign] = useState('');

  // Bulk form
  const [prefix, setPrefix] = useState('');
  const [count, setCount] = useState('10');

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      if (mode === 'single') {
        if (!code.trim()) {
          throw new Error('Code is required');
        }

        await createPromoCode(token, {
          code: code.trim().toUpperCase(),
          type,
          maxUses: parseInt(maxUses) || 1,
          expiresAt: expiresAt || undefined,
          source: source.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
          campaign: campaign.trim() || undefined,
        });

        setSuccess(`Code "${code.toUpperCase()}" created successfully!`);
        setCode('');
      } else {
        if (!prefix.trim()) {
          throw new Error('Prefix is required');
        }

        const codes = await bulkCreatePromoCodes(token, {
          prefix: prefix.trim().toUpperCase(),
          count: parseInt(count) || 10,
          type,
          maxUses: parseInt(maxUses) || 1,
          expiresAt: expiresAt || undefined,
          source: source.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
          campaign: campaign.trim() || undefined,
        });

        setSuccess(`Created ${codes.length} codes with prefix "${prefix.toUpperCase()}"!`);
        setPrefix('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin/promos" className="text-[#00843D] hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] mt-4">Create Promo Code</h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'single'
                ? 'bg-[#00843D] text-white'
                : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
            }`}
          >
            Single Code
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'bulk'
                ? 'bg-[#00843D] text-white'
                : 'bg-white border border-[#EBEBEB] text-[#666666] hover:border-[#00843D]'
            }`}
          >
            Bulk Create
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#EBEBEB] rounded-lg p-6 space-y-6">
          {/* Code / Prefix */}
          {mode === 'single' ? (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="OZBARGAIN-FREE"
                className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
                required
              />
              <p className="mt-1 text-xs text-[#999999]">Will be converted to uppercase</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                  Prefix *
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="OZBARGAIN"
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
                  required
                />
                <p className="mt-1 text-xs text-[#999999]">Creates PREFIX-XXXXXX codes</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                  Count *
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
                  required
                />
                <p className="mt-1 text-xs text-[#999999]">Max 100 at once</p>
              </div>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'sourced' | 'manual')}
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
            >
              <option value="sourced">Sourced (for channels like OzBargain, Reddit)</option>
              <option value="manual">Manual (one-off codes)</option>
            </select>
            <p className="mt-1 text-xs text-[#999999]">
              Sourced: One per user lifetime. Manual: Configurable usage.
            </p>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Max Uses
            </label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
            />
            <p className="mt-1 text-xs text-[#999999]">
              For sourced codes, this is total uses across all users (each user can only use once)
            </p>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Source (Optional)
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="ozbargain, reddit, facebook"
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
            />
            <p className="mt-1 text-xs text-[#999999]">For tracking attribution</p>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Source URL (Optional)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.ozbargain.com.au/node/123456"
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
            />
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Campaign (Optional)
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="launch-jan-2026"
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D]"
            />
            <p className="mt-1 text-xs text-[#999999]">For grouping codes together</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#00843D] text-white rounded-lg font-medium hover:bg-[#006B32] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : mode === 'single' ? 'Create Code' : 'Create Codes'}
          </button>
        </form>
      </div>
    </div>
  );
}
