'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import {
  User,
  Session,
  signIn as apiSignIn,
  signOut as apiSignOut,
  getCurrentUser,
  refreshSession,
  saveTokens,
  getTokens,
  clearTokens,
} from './auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserFromSignIn: (user: User, session: Session) => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Prevent double-checking in development mode (strict mode)
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const initAuth = async () => {
      const { accessToken, refreshToken } = getTokens();

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser(accessToken);
        setUser(userData);
        // Ensure cookie is set for middleware (handles users who logged in before cookie fix)
        if (refreshToken) {
          saveTokens({ accessToken, refreshToken, expiresAt: 0 });
        }
        setIsLoading(false);
      } catch {
        // Token might be expired, try refreshing
        if (refreshToken) {
          try {
            const { session } = await refreshSession(refreshToken);
            saveTokens(session);
            const userData = await getCurrentUser(session.accessToken);
            setUser(userData);
            setIsLoading(false);
          } catch {
            // Refresh failed, clear tokens
            clearTokens();
            setUser(null);
            setIsLoading(false);
          }
        } else {
          clearTokens();
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiSignIn(email, password);
    saveTokens(response.session);
    setUser(response.user);
  };

  const signOut = async () => {
    const { accessToken } = getTokens();
    if (accessToken) {
      try {
        await apiSignOut(accessToken);
      } catch {
        // Ignore signout errors
      }
    }
    clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    const { accessToken } = getTokens();
    if (accessToken) {
      try {
        const userData = await getCurrentUser(accessToken);
        setUser(userData);
      } catch {
        // Ignore refresh errors
      }
    }
  };

  const setUserFromSignIn = (newUser: User, session: Session) => {
    saveTokens(session);
    setUser(newUser);
  };

  const getAccessToken = async (): Promise<string | null> => {
    const { accessToken, refreshToken } = getTokens();

    // If we have an access token, check if it's expired
    if (accessToken) {
      try {
        // Decode JWT to check expiry (JWT format: header.payload.signature)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const bufferMs = 60 * 1000; // 1 minute buffer

        // If token is not expired (with buffer), return it
        if (expiresAt > now + bufferMs) {
          return accessToken;
        }
      } catch {
        // If we can't decode, just return the token and let API handle it
        return accessToken;
      }
    }

    // Token is missing or expired, try to refresh
    if (refreshToken) {
      try {
        const { session } = await refreshSession(refreshToken);
        saveTokens(session);
        setUser(user); // Keep user state
        return session.accessToken;
      } catch {
        // Refresh failed, clear tokens
        clearTokens();
        setUser(null);
        return null;
      }
    }

    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshUser,
        setUserFromSignIn,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
