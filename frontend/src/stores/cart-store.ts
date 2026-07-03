'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { CartLine, Product } from '@/lib/types';
import { effectivePrice } from '@/lib/utils';

function lineKey(productId: string, variantSelection?: Record<string, string>) {
  return `${productId}:${JSON.stringify(variantSelection || {})}`;
}

interface CartState {
  items: CartLine[];
  isAuthed: boolean;
  setAuthed: (authed: boolean) => void;
  add: (product: Product, quantity?: number, variantSelection?: Record<string, string>) => void;
  updateQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
  /** Push the local cart into the user's DB cart after login */
  syncToServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthed: false,
      setAuthed: (authed) => set({ isAuthed: authed }),

      add: (product, quantity = 1, variantSelection) => {
        let unitPrice = effectivePrice(product);
        if (variantSelection && product.variants) {
          for (const variant of product.variants) {
            const opt = variant.options?.find((o) => o.value === variantSelection[variant.name]);
            if (opt) unitPrice += opt.priceModifier || 0;
          }
        }
        const key = lineKey(product.id, variantSelection);
        const items = [...get().items];
        const existing = items.find((i) => i.key === key);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, product.stock);
        } else {
          items.push({
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images?.[0],
            unitPrice,
            quantity: Math.min(quantity, product.stock),
            stock: product.stock,
            variantSelection,
          });
        }
        set({ items });
        if (get().isAuthed) {
          api('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId: product.id, quantity, variantSelection }),
          }).catch(() => undefined);
        }
      },

      updateQuantity: (key, quantity) => {
        set({
          items: get()
            .items.map((i) =>
              i.key === key ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
            )
            .filter((i) => i.quantity > 0),
        });
      },

      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      clear: () => {
        set({ items: [] });
        if (get().isAuthed) {
          api('/cart/clear', { method: 'DELETE' }).catch(() => undefined);
        }
      },

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      syncToServer: async () => {
        const items = get().items;
        if (!items.length) return;
        await api('/cart/merge', {
          method: 'POST',
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              variantSelection: i.variantSelection,
            })),
          }),
        }).catch(() => undefined);
      },
    }),
    { name: 'klass-cart' },
  ),
);
