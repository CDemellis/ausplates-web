'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { setup2FA, verify2FA, TotpSetupResponse } from '@/lib/admin';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const { user, getAccessToken } = useAuth();
  const [setupData, setSetupData] = useState<TotpSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    initSetup();
  }, []);

  const initSetup = async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = 'https://ausplates.app/signin?redirect=' + encodeURIComponent('https://admin.ausplates.app/2fa/setup');
        }
        return;
      }

      const data = await setup2FA(token);
      setSetupData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      const token = await getAccessToken();
      if (!token) return;

      await verify2FA(token, code);

      // Mark 2FA session as verified
      localStorage.setItem('admin_2fa_verified_at', Date.now().toString());

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-[#666666]">Setting up 2FA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Set Up Two-Factor Authentication</h1>
            <p className="text-[#666666] mt-2">
              Secure your admin account with 2FA using an authenticator app like 1Password, Google Authenticator, or Authy.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {setupData && (
            <>
              {/* QR Code */}
              <div className="mb-6">
                <p className="text-sm font-medium text-[#1A1A1A] mb-3 text-center">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border border-[#EBEBEB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qrCodeDataUrl}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="w-[200px] h-[200px]"
                    />
                  </div>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="text-sm text-[#00843D] hover:underline w-full text-center"
                >
                  {showManualEntry ? 'Hide manual entry' : "Can't scan? Enter manually"}
                </button>
                {showManualEntry && (
                  <div className="mt-3 p-4 bg-[#F8F8F8] rounded-lg">
                    <p className="text-xs text-[#666666] mb-2">Account: AusPlates Admin ({user?.email})</p>
                    <p className="text-xs text-[#666666] mb-2">Secret key:</p>
                    <code className="block text-sm font-mono bg-white p-2 rounded border border-[#EBEBEB] break-all select-all">
                      {setupData.secret}
                    </code>
                  </div>
                )}
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <label htmlFor="code" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Enter the 6-digit code from your app:
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={code.length !== 6 || isVerifying}
                  className="w-full py-3 bg-[#00843D] text-white font-medium rounded-lg hover:bg-[#006B32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#666666] mt-4">
          Two-factor authentication adds an extra layer of security to your admin account.
        </p>
      </div>
    </div>
  );
}
