'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { getTokens } from './auth';
import { getSavedListingIds, saveListing, unsaveListing } from './api';

interface SavedContextType {
  savedIds: Set<string>;
  isLoading: boolean;
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => Promise<void>;
}

const SavedContext = createContext<SavedContextType | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedIds = useCallback(async () => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const ids = await getSavedListingIds(accessToken);
      setSavedIds(ids);
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedIds();
    } else {
      setSavedIds(new Set());
    }
  }, [isAuthenticated, loadSavedIds]);

  const isSaved = useCallback((listingId: string) => {
    return savedIds.has(listingId);
  }, [savedIds]);

  const toggleSave = useCallback(async (listingId: string) => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    const currentlySaved = savedIds.has(listingId);

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (currentlySaved) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    try {
      if (currentlySaved) {
        await unsaveListing(accessToken, listingId);
      } else {
        await saveListing(accessToken, listingId);
      }
    } catch {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev);
        if (currentlySaved) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
    }
  }, [savedIds]);

  return (
    <SavedContext.Provider value={{ savedIds, isLoading, isSaved, toggleSave }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}
