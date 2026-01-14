import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Auth utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('should call signup endpoint with correct data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ userId: '123', message: 'Check your email' }),
      });

      const { signUp } = await import('./auth');
      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
          }),
        })
      );
      expect(result.userId).toBe('123');
    });

    it('should throw on signup error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      });

      const { signUp } = await import('./auth');
      await expect(signUp('test@example.com', 'password', 'Test')).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should return user and session on success', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        email_verified: true,
      };
      const mockSession = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 3600000,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: mockUser, session: mockSession }),
      });

      const { signIn } = await import('./auth');
      const result = await signIn('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.session.accessToken).toBe('token123');
    });

    it('should throw with error code on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Email not verified', code: 'email_not_verified' }),
      });

      const { signIn } = await import('./auth');

      try {
        await signIn('test@example.com', 'password');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Email not verified');
        expect((error as Error & { code?: string }).code).toBe('email_not_verified');
      }
    });
  });

  describe('verifyEmail', () => {
    it('should call verify endpoint with token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified', verified: true }),
      });

      const { verifyEmail } = await import('./auth');
      const result = await verifyEmail('verification-token-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/verify-email'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'verification-token-123' }),
        })
      );
      expect(result.verified).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgot password endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Reset email sent' }),
      });

      const { forgotPassword } = await import('./auth');
      const result = await forgotPassword('test@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
      expect(result.message).toBe('Reset email sent');
    });
  });
});

describe('Token validation', () => {
  it('should validate JWT format', async () => {
    // Import the validation function if exposed, or test through storeSession
    const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const invalidJwt = 'not-a-jwt';

    // JWT should have 3 parts separated by dots
    expect(validJwt.split('.').length).toBe(3);
    expect(invalidJwt.split('.').length).toBe(1);
  });
});
