'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/product-card';
import { useWishlistStore } from '@/stores/wishlist-store';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);

  return (
    <div className="container-klass py-10">
      <h1 className="mb-8 text-2xl font-extrabold sm:text-3xl">
        My Wishlist{' '}
        <span className="text-base font-normal text-[#999999]">({items.length} items)</span>
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Heart className="h-16 w-16 text-[#E0E0E0] dark:text-[#2A2A2A]" />
          <p className="text-lg font-bold">Your wishlist is empty</p>
          <p className="text-sm text-[#555555] dark:text-[#999999]">
            Tap the heart on any product to save it for later.
          </p>
          <Link href="/shop" className="btn-primary mt-2">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
