'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveTokens, Session, User } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

interface QRSession {
  token: string;
  qrUrl: string;
  expiresAt: string;
  expiresIn: number;
}

interface QRStatus {
  status: 'pending' | 'scanned' | 'confirmed' | 'expired';
  deviceInfo?: { browser: string; os: string };
  user?: User;
  loginToken?: string;
}

interface Props {
  onSuccess?: () => void;
}

export function QRLogin({ onSuccess }: Props) {
  const router = useRouter();
  const { setUserFromSignIn } = useAuth();
  const [session, setSession] = useState<QRSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'pending' | 'confirmed' | 'expired' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Create QR session
  const createSession = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/qr/create`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to create QR session');
      }

      const data: QRSession = await res.json();
      setSession(data);
      setStatus('pending');
      setTimeLeft(data.expiresIn);
    } catch (err) {
      console.error('Failed to create QR session:', err);
      setError('Failed to create QR code. Please try again.');
      setStatus('error');
    }
  }, []);

  // Poll for status
  const pollStatus = useCallback(async () => {
    if (!session) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/qr/status/${session.token}`);

      if (!res.ok) {
        if (res.status === 404) {
          setStatus('expired');
          return;
        }
        throw new Error('Failed to check status');
      }

      const data: QRStatus = await res.json();

      if (data.status === 'expired') {
        setStatus('expired');
        return;
      }

      if (data.status === 'confirmed') {
        setStatus('confirmed');

        // Exchange token for session
        const exchangeRes = await fetch(`${API_BASE_URL}/api/auth/qr/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.token }),
        });

        if (!exchangeRes.ok) {
          throw new Error('Failed to complete login');
        }

        const authData = await exchangeRes.json();

        // Save tokens and update auth context
        const sessionData: Session = {
          accessToken: authData.session.accessToken,
          refreshToken: authData.session.refreshToken,
          expiresAt: authData.session.expiresAt,
        };

        setUserFromSignIn(authData.user, sessionData);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
        }
        return;
      }

      // Continue polling
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, [session, router, setUserFromSignIn, onSuccess]);

  // Create session on mount
  useEffect(() => {
    createSession();
  }, [createSession]);

  // Poll every 2 seconds
  useEffect(() => {
    if (status !== 'pending' || !session) return;

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [status, session, pollStatus]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'pending' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-10 h-10 border-4 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[var(--text-secondary)]">Generating QR code...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={createSession}
          className="text-[var(--green)] hover:underline font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] mb-4">QR code expired</p>
        <button
          onClick={createSession}
          className="bg-[var(--green)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#006B31] transition-colors"
        >
          Generate new code
        </button>
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[var(--green)] font-medium">Login confirmed!</p>
        <p className="text-[var(--text-secondary)] mt-1">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* QR Code */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[var(--border)]">
        {session && (
          <QRCodeSVG
            value={session.qrUrl}
            size={200}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-[var(--text)] font-medium">Scan with AusPlates app</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Open the app and tap &quot;Scan to Log in&quot;
        </p>
      </div>

      {/* Timer */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[var(--text-muted)]">
          Expires in <span className="font-mono">{formatTime(timeLeft)}</span>
        </span>
      </div>

      {/* Refresh button */}
      <button
        onClick={createSession}
        className="mt-4 text-sm text-[var(--green)] hover:underline"
      >
        Generate new code
      </button>
    </div>
  );
}
