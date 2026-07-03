'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';

interface WishlistState {
  items: Product[];
  isAuthed: boolean;
  setAuthed: (authed: boolean) => void;
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  setItems: (items: Product[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthed: false,
      setAuthed: (authed) => set({ isAuthed: authed }),

      toggle: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        set({
          items: exists
            ? get().items.filter((i) => i.id !== product.id)
            : [product, ...get().items],
        });
        if (get().isAuthed) {
          api(`/wishlist/toggle/${product.id}`, { method: 'POST' }).catch(() => undefined);
        }
      },

      has: (productId) => get().items.some((i) => i.id === productId),
      setItems: (items) => set({ items }),
    }),
    { name: 'klass-wishlist' },
  ),
);
