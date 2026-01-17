'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAdminStatus, disable2FA, AdminStatus } from '@/lib/admin';

export default function TwoFactorSettingsPage() {
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasLoaded = useRef(false);

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const status = await getAdminStatus(token);
      setAdminStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadStatus();
  }, [loadStatus]);

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disableCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setIsDisabling(true);
      setError('');
      const token = await getAccessToken();
      if (!token) return;

      await disable2FA(token, disableCode);

      // Clear 2FA session
      localStorage.removeItem('admin_2fa_verified_at');

      setSuccess('Two-factor authentication has been disabled.');
      setShowDisableModal(false);
      setDisableCode('');

      // Reload status
      await loadStatus();

      // Redirect to setup after a moment
      setTimeout(() => {
        router.push('/ap-admin/2fa/setup');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIsDisabling(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-[#666666]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Two-Factor Authentication</h1>
        <p className="text-[#666666] mt-1">Manage your 2FA settings for admin access</p>
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

      <div className="bg-white border border-[#EBEBEB] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Authenticator App</h2>
            </div>
            <p className="text-[#666666] mt-1 text-sm">
              Use an authenticator app like 1Password, Google Authenticator, or Authy to generate verification codes.
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            adminStatus?.totpEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {adminStatus?.totpEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {adminStatus?.totpEnabled && (
          <div className="mt-6 pt-6 border-t border-[#EBEBEB]">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-[#666666]">Status</dt>
                <dd className="text-sm font-medium text-[#22C55E]">Active</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[#666666]">Last verified</dt>
                <dd className="text-sm text-[#1A1A1A]">{formatDate(adminStatus.totpVerifiedAt)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                onClick={() => setShowDisableModal(true)}
                className="text-sm text-[#EF4444] hover:underline"
              >
                Disable two-factor authentication
              </button>
            </div>
          </div>
        )}

        {!adminStatus?.totpEnabled && (
          <div className="mt-6 pt-6 border-t border-[#EBEBEB]">
            <p className="text-sm text-[#EF4444] mb-4">
              Two-factor authentication is required for admin access. Please set it up to continue.
            </p>
            <button
              onClick={() => router.push('/ap-admin/2fa/setup')}
              className="px-4 py-2 bg-[#00843D] text-white font-medium rounded-lg hover:bg-[#006B32] transition-colors"
            >
              Set Up 2FA
            </button>
          </div>
        )}
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Disable Two-Factor Authentication</h3>
            <p className="text-[#666666] text-sm mb-4">
              To disable 2FA, enter your current authentication code. Note: You will need to set up 2FA again to access the admin panel.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleDisable2FA}>
              <div className="mb-4">
                <label htmlFor="disableCode" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  id="disableCode"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:border-transparent"
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisableCode('');
                    setError('');
                  }}
                  className="flex-1 py-2 border border-[#EBEBEB] text-[#666666] font-medium rounded-lg hover:bg-[#F8F8F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableCode.length !== 6 || isDisabling}
                  className="flex-1 py-2 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDisabling ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
