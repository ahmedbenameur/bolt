import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

type WishlistContextType = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.wishlist);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(ids));
  }, [ids]);

  const toggle = (id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const has = (id: string) => ids.includes(id);
  const remove = (id: string) => setIds((prev) => prev.filter((x) => x !== id));

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, remove, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
