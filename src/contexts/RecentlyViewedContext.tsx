import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

type RecentlyViewedContextType = {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.recentlyViewed);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recentlyViewed, JSON.stringify(ids));
  }, [ids]);

  const add = (id: string) => {
    setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 10));
  };

  const clear = () => setIds([]);

  return (
    <RecentlyViewedContext.Provider value={{ ids, add, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return ctx;
}
