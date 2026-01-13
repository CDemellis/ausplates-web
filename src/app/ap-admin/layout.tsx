'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAdminStatus } from '@/lib/admin';

const ADMIN_EMAILS = ['hello@ausplates.app'];

// 2FA session expires after 4 hours
const TWO_FA_SESSION_DURATION_MS = 4 * 60 * 60 * 1000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, getAccessToken, signOut } = useAuth();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);
  const hasCheckedAccess = useRef(false);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Reset check if pathname changed
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      hasCheckedAccess.current = false;
    }

    // Skip if already checked or still loading
    if (hasCheckedAccess.current || authLoading) return;

    const checkAdminAccess = async () => {
      hasCheckedAccess.current = true;

      // Not authenticated - redirect to signin on main domain
      if (!user) {
        if (typeof window !== 'undefined') {
          window.location.href = 'https://ausplates.app/signin?redirect=' + encodeURIComponent('https://admin.ausplates.app/');
        }
        return;
      }

      // Check if user email is in admin list
      if (!ADMIN_EMAILS.includes(user.email)) {
        setShowNotFound(true);
        setIsCheckingAdmin(false);
        return;
      }

      // User is admin, check 2FA status
      try {
        const token = await getAccessToken();
        if (!token) {
          if (typeof window !== 'undefined') {
            window.location.href = 'https://ausplates.app/signin?redirect=' + encodeURIComponent('https://admin.ausplates.app/');
          }
          return;
        }

        const status = await getAdminStatus(token);

        // Check if 2FA is enabled
        if (!status.totpEnabled) {
          if (!pathname.startsWith('/2fa/setup')) {
            router.push('/2fa/setup');
            return;
          }
        } else {
          // Check if 2FA session is valid
          const twoFaVerifiedAt = localStorage.getItem('admin_2fa_verified_at');
          const isSessionValid = twoFaVerifiedAt &&
            (Date.now() - parseInt(twoFaVerifiedAt, 10)) < TWO_FA_SESSION_DURATION_MS;

          if (!isSessionValid) {
            if (!pathname.startsWith('/2fa/verify')) {
              sessionStorage.setItem('admin_redirect_after_2fa', pathname);
              router.push('/2fa/verify');
              return;
            }
          }
        }

        setIsCheckingAdmin(false);
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setShowNotFound(true);
        setIsCheckingAdmin(false);
      }
    };

    checkAdminAccess();
  }, [authLoading, user, getAccessToken, pathname, router]);

  const handleSignOut = async () => {
    localStorage.removeItem('admin_2fa_verified_at');
    await signOut();
    router.push('/');
  };

  // Show 404 for non-admins
  if (showNotFound) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#1A1A1A]">404</h1>
          <p className="mt-4 text-[#666666]">Page not found</p>
          <a href="https://ausplates.app" className="mt-6 inline-block text-[#00843D] hover:underline">
            Go home
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-[#666666]">Loading...</div>
      </div>
    );
  }

  // Allow 2FA setup/verify pages without full admin layout
  if (pathname.startsWith('/2fa/setup') || pathname.startsWith('/2fa/verify')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-semibold text-[#1A1A1A]">
              AusPlates <span className="text-[#00843D]">Admin</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm ${pathname === '/' ? 'text-[#00843D] font-medium' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/promos"
                className={`text-sm ${pathname.startsWith('/promos') ? 'text-[#00843D] font-medium' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
              >
                Promos
              </Link>
              <Link
                href="/2fa/settings"
                className={`text-sm ${pathname.startsWith('/2fa/settings') ? 'text-[#00843D] font-medium' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
              >
                2FA Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666666]">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-[#EF4444] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
