'use client';

import { Heart, Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/lib/types';
import { cn, effectivePrice, formatXAF } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { useWishlistStore } from '@/stores/wishlist-store';

export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const variant of product.variants || []) {
      if (variant.options?.[0]) initial[variant.name] = variant.options[0].value;
    }
    return initial;
  });

  const add = useCartStore((s) => s.add);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product.id));

  const outOfStock = product.stock < 1;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const currentPrice = useMemo(() => {
    let price = effectivePrice(product);
    for (const variant of product.variants || []) {
      const opt = variant.options?.find((o) => o.value === selection[variant.name]);
      if (opt) price += opt.priceModifier || 0;
    }
    return price;
  }, [product, selection]);

  function addToCart() {
    if (outOfStock) return;
    add(product, quantity, Object.keys(selection).length ? selection : undefined);
    toast.success(`${product.name} added to cart`);
    setCartOpen(true);
  }

  function buyNow() {
    if (outOfStock) return;
    add(product, quantity, Object.keys(selection).length ? selection : undefined);
    router.push('/checkout');
  }

  return (
    <div className="space-y-5">
      {/* Variant selectors */}
      {(product.variants || []).map((variant) => (
        <div key={variant.id}>
          <p className="mb-2 text-sm font-semibold">
            {variant.name}:{' '}
            <span className="font-normal text-[#555555] dark:text-[#999999]">
              {selection[variant.name]}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  setSelection((prev) => ({ ...prev, [variant.name]: option.value }))
                }
                className={cn(
                  'rounded border px-3.5 py-2 text-sm font-medium transition-colors',
                  selection[variant.name] === option.value
                    ? 'border-brand bg-brand/5 text-brand dark:text-brand-light'
                    : 'border-[#E0E0E0] hover:border-brand dark:border-[#2A2A2A]',
                )}
              >
                {option.value}
                {option.priceModifier > 0 && (
                  <span className="ml-1 text-xs text-[#999999]">
                    +{formatXAF(option.priceModifier)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Live price with selected variants */}
      <p className="text-2xl font-extrabold text-brand dark:text-brand-light">
        {formatXAF(currentPrice * quantity)}
      </p>

      {/* Stock indicator */}
      {outOfStock ? (
        <p className="text-sm font-semibold text-red-500">Out of stock</p>
      ) : lowStock ? (
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          🔥 Only {product.stock} left in stock — order soon!
        </p>
      ) : (
        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
          ✓ In stock and ready to ship
        </p>
      )}

      {/* Quantity + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded border border-[#E0E0E0] dark:border-[#2A2A2A]">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:text-brand"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
            className="p-3 hover:text-brand"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button onClick={addToCart} disabled={outOfStock} className="btn-primary flex-1 !py-3">
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
        <button
          onClick={() => {
            toggleWishlist(product);
            toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
          }}
          aria-label="Toggle wishlist"
          className={cn(
            'rounded border p-3 transition-colors',
            inWishlist
              ? 'border-brand text-brand'
              : 'border-[#E0E0E0] hover:border-brand hover:text-brand dark:border-[#2A2A2A]',
          )}
        >
          <Heart className={cn('h-5 w-5', inWishlist && 'fill-brand')} />
        </button>
      </div>

      <button onClick={buyNow} disabled={outOfStock} className="btn-outline w-full !py-3">
        <Zap className="h-4 w-4" /> Buy It Now
      </button>
    </div>
  );
}
