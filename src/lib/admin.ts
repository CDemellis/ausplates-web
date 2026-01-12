const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ausplates.onrender.com';

export interface AdminStatus {
  isAdmin: boolean;
  totpEnabled: boolean;
  totpVerifiedAt: string | null;
}

export interface TotpSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
}

export interface TotpVerifyResponse {
  success: boolean;
  message: string;
}

// Get admin status including 2FA state
export async function getAdminStatus(accessToken: string): Promise<AdminStatus> {
  const res = await fetch(`${API_BASE_URL}/api/admin/status`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 404) {
    // Not an admin - return default status
    return {
      isAdmin: false,
      totpEnabled: false,
      totpVerifiedAt: null,
    };
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get admin status');
  }

  return {
    isAdmin: data.is_admin,
    totpEnabled: data.totp_enabled,
    totpVerifiedAt: data.totp_verified_at,
  };
}

// Setup 2FA - get secret and QR code
export async function setup2FA(accessToken: string): Promise<TotpSetupResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/2fa/setup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to setup 2FA');
  }

  return {
    secret: data.secret,
    qrCodeDataUrl: data.qr_code_data_url,
    otpauthUrl: data.otpauth_url,
  };
}

// Verify 2FA code (first time setup)
export async function verify2FA(accessToken: string, code: string): Promise<TotpVerifyResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/2fa/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify 2FA');
  }

  return data;
}

// Validate 2FA code (session re-verification)
export async function validate2FA(accessToken: string, code: string): Promise<TotpVerifyResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/2fa/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Invalid verification code');
  }

  return data;
}

// Disable 2FA
export async function disable2FA(accessToken: string, code: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/2fa`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to disable 2FA');
  }

  return data;
}
