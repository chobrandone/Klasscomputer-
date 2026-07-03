'use client';

import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatXAF } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';

const FREE_SHIPPING_THRESHOLD = 50000;

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUiStore();
  const { items, updateQuantity, remove } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in-right flex-col bg-white shadow-lg dark:bg-[#141414]">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] px-5 py-4 dark:border-[#2A2A2A]">
          <h2 className="text-lg font-bold">
            Your Cart{' '}
            <span className="text-sm font-normal text-[#999999]">
              ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="rounded p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="border-b border-[#E0E0E0] px-5 py-3 dark:border-[#2A2A2A]">
          <p className="mb-1.5 text-xs text-[#555555] dark:text-[#999999]">
            {subtotal >= FREE_SHIPPING_THRESHOLD
              ? '🎉 You unlocked free shipping!'
              : `Add ${formatXAF(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping`}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A]">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-[#E0E0E0] dark:text-[#2A2A2A]" />
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm text-[#999999]">Find something you&apos;ll love in the shop.</p>
            <Link href="/shop" onClick={() => setCartOpen(false)} className="btn-primary mt-2">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="mb-4 flex gap-3 border-b border-[#F5F5F5] pb-4 last:border-0 dark:border-[#1A1A1A]"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#1A1A1A]"
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="line-clamp-2 text-sm font-medium hover:text-brand"
                    >
                      {item.name}
                    </Link>
                    {item.variantSelection && Object.keys(item.variantSelection).length > 0 && (
                      <p className="mt-0.5 text-xs text-[#999999]">
                        {Object.entries(item.variantSelection)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded border border-[#E0E0E0] dark:border-[#2A2A2A]">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="p-1.5 hover:text-brand"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="p-1.5 hover:text-brand"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-brand dark:text-brand-light">
                        {formatXAF(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(item.key)}
                    aria-label="Remove item"
                    className="self-start p-1 text-[#999999] hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E0E0E0] p-5 dark:border-[#2A2A2A]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-[#555555] dark:text-[#999999]">Subtotal</span>
                <span className="text-lg font-bold">{formatXAF(subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-outline">
                  View Cart
                </Link>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-primary">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
