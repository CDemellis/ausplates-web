'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { validate2FA } from '@/lib/admin';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const { user, getAccessToken } = useAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check for existing lockout on mount
  useEffect(() => {
    const storedLockout = localStorage.getItem('admin_2fa_lockout_until');
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem('admin_2fa_lockout_until');
        localStorage.removeItem('admin_2fa_attempts');
      }
    }
    const storedAttempts = localStorage.getItem('admin_2fa_attempts');
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts, 10));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutUntil) return;

    const updateRemaining = () => {
      const remaining = Math.max(0, lockoutUntil - Date.now());
      setLockoutRemaining(remaining);
      if (remaining === 0) {
        setLockoutUntil(null);
        setAttempts(0);
        localStorage.removeItem('admin_2fa_lockout_until');
        localStorage.removeItem('admin_2fa_attempts');
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    if (lockoutUntil && lockoutUntil > Date.now()) {
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      const token = await getAccessToken();
      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = 'https://ausplates.app/signin?redirect=admin';
        }
        return;
      }

      await validate2FA(token, code);

      // Clear lockout state on success
      localStorage.removeItem('admin_2fa_attempts');
      localStorage.removeItem('admin_2fa_lockout_until');

      // Mark 2FA session as verified
      localStorage.setItem('admin_2fa_verified_at', Date.now().toString());

      // Redirect to intended destination or dashboard
      const redirectTo = sessionStorage.getItem('admin_redirect_after_2fa') || '/';
      sessionStorage.removeItem('admin_redirect_after_2fa');
      router.push(redirectTo);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('admin_2fa_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockoutTime);
        localStorage.setItem('admin_2fa_lockout_until', lockoutTime.toString());
        setError('Too many failed attempts. Please try again in 15 minutes.');
      } else {
        setError(`Invalid code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLocked = lockoutUntil && lockoutUntil > Date.now();

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Verify Your Identity</h1>
            <p className="text-[#666666] mt-2">
              Enter the 6-digit code from your authenticator app to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLocked ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-[#666666]">Too many failed attempts.</p>
              <p className="text-lg font-semibold text-[#1A1A1A] mt-2">
                Try again in {formatTime(lockoutRemaining)}
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Authentication Code
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
                  disabled={isVerifying}
                />
              </div>

              <button
                type="submit"
                disabled={code.length !== 6 || isVerifying}
                className="w-full py-3 bg-[#00843D] text-white font-medium rounded-lg hover:bg-[#006B32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#666666] mt-4">
          Logged in as {user?.email}
        </p>
      </div>
    </div>
  );
}
