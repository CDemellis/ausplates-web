'use client';

import { useEffect } from 'react';
import { clearTokens } from '@/lib/auth';

/**
 * Logout page - clears all auth tokens and redirects to home.
 * Used by admin subdomain to ensure full logout across all subdomains.
 */
export default function LogoutPage() {
  useEffect(() => {
    // Clear all tokens (localStorage + cookies) on this domain
    clearTokens();
    // Redirect to home
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
      <div className="text-[#666666]">Signing out...</div>
    </div>
  );
}
