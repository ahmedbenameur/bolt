import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.cart);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(next[idx].stock, next[idx].quantity + item.quantity),
        };
        return next;
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === productId && i.size === size && i.color === color)),
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product_id === productId && i.size === size && i.color === color) {
          return { ...i, quantity: Math.max(1, Math.min(i.stock, quantity)) };
        }
        return i;
      }),
    );
  };

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
