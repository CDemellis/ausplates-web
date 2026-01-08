'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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

  const checkAuth = useCallback(async () => {
    const { accessToken, refreshToken } = getTokens();

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser(accessToken);
      setUser(userData);
    } catch {
      // Token might be expired, try refreshing
      if (refreshToken) {
        try {
          const { session } = await refreshSession(refreshToken);
          saveTokens(session);
          const userData = await getCurrentUser(session.accessToken);
          setUser(userData);
        } catch {
          // Refresh failed, clear tokens
          clearTokens();
          setUser(null);
        }
      } else {
        clearTokens();
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

    if (!accessToken) {
      return null;
    }

    // Check if token might be expired (we don't have expiry info here, so just return it)
    // The API calls will fail and we can handle refresh there if needed
    return accessToken;
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
