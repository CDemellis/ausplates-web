'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getFlaggedAttempts, FlaggedAttempt, resolveFlaggedAttempt } from '@/lib/api';

const ADMIN_EMAIL = 'hello@ausplates.app';

export default function FlaggedPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const [flagged, setFlagged] = useState<FlaggedAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/');
      return;
    }

    if (user?.email === ADMIN_EMAIL) {
      loadFlagged();
    }
  }, [user, authLoading, router]);

  const loadFlagged = async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const data = await getFlaggedAttempts(token);
      setFlagged(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flagged users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      await resolveFlaggedAttempt(token, id, notes);
      setResolvingId(null);
      setNotes('');
      loadFlagged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve');
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
          <h1 className="text-2xl font-semibold text-[#1A1A1A] mt-4">Flagged Users</h1>
          <p className="text-[#666666] mt-1">Users who failed promo validation multiple times</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {flagged.length === 0 ? (
          <div className="bg-white border border-[#EBEBEB] rounded-lg p-8 text-center text-[#666666]">
            No flagged users - all clear!
          </div>
        ) : (
          <div className="space-y-4">
            {flagged.map((f) => (
              <div key={f.id} className="bg-white border border-[#EBEBEB] rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-medium text-[#1A1A1A]">
                      {f.users?.email || 'Unknown User'}
                    </div>
                    <div className="text-sm text-[#666666]">
                      {f.users?.fullName || 'No name'} • Joined {new Date(f.users?.createdAt || '').toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {f.attemptCount} failed attempts
                    </span>
                    <div className="text-sm text-[#999999] mt-1">
                      Flagged {new Date(f.flaggedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-[#F8F8F8] rounded-lg">
                  <div className="text-sm font-medium text-[#666666]">Last Error</div>
                  <div className="text-sm text-[#1A1A1A] font-mono">{f.lastError || 'No error recorded'}</div>
                  {f.promoCodes && (
                    <div className="mt-2 text-sm text-[#666666]">
                      Code attempted: <span className="font-mono">{f.promoCodes.code}</span> ({f.promoCodes.type})
                    </div>
                  )}
                </div>

                {resolvingId === f.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add resolution notes (optional)..."
                      className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#00843D] text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolve(f.id)}
                        className="px-4 py-2 bg-[#00843D] text-white rounded-lg text-sm font-medium hover:bg-[#006B32]"
                      >
                        Confirm Resolve
                      </button>
                      <button
                        onClick={() => { setResolvingId(null); setNotes(''); }}
                        className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#666666] hover:border-[#999999]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResolvingId(f.id)}
                    className="px-4 py-2 bg-[#00843D] text-white rounded-lg text-sm font-medium hover:bg-[#006B32]"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
