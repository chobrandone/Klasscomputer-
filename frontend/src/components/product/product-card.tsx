'use client';

import { Eye, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/lib/types';
import { cn, discountPercent } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useT } from '@/components/layout/i18n-ui';
import { PriceTag } from './price-tag';
import { RatingStars } from './rating-stars';

export function ProductCard({
  product,
  layout = 'grid',
}: {
  product: Product;
  layout?: 'grid' | 'list';
}) {
  const [hovered, setHovered] = useState(false);
  const { t } = useT();
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product.id));

  const outOfStock = product.stock < 1;
  const discount = discountPercent(product);
  const mainImage = product.images?.[0];
  const hoverImage = product.images?.[1];
  const hasVariants = (product.variants?.length || 0) > 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    add(product, 1);
    toast.success(`${product.name} ${t('product.addedToCart')}`);
    setCartOpen(true);
  }

  function onToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleWishlist(product);
    toast.success(
      inWishlist ? t('product.removedFromWishlist') : t('product.addedToWishlist'),
    );
  }

  if (layout === 'list') {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="card-klass group flex gap-5 p-4 transition-shadow hover:shadow dark:hover:shadow-dark-glow"
      >
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414] sm:h-44 sm:w-44">
          {mainImage && (
            <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="176px" />
          )}
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded bg-brand px-2 py-0.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col py-1">
          <p className="text-xs uppercase tracking-wide text-[#999999]">{product.brand?.name}</p>
          <h3 className="mt-1 font-semibold group-hover:text-brand dark:group-hover:text-brand-light">
            {product.name}
          </h3>
          <RatingStars rating={product.ratings} count={product.reviewCount} />
          <p className="mt-2 line-clamp-2 text-sm text-[#555555] dark:text-[#999999]">
            {product.shortDescription}
          </p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <PriceTag product={product} />
            <button
              onClick={quickAdd}
              disabled={outOfStock}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              <ShoppingCart className="h-4 w-4" />
              {outOfStock
                ? t('product.outOfStock')
                : hasVariants
                  ? t('product.viewOptions')
                  : t('product.addToCart')}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-klass group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow dark:hover:shadow-dark-glow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] dark:bg-[#141414]">
        {mainImage && (
          <Image
            src={hovered && hoverImage ? hoverImage : mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded bg-brand px-2 py-0.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded bg-[#111111] px-2 py-0.5 text-xs font-bold text-white dark:bg-[#F0F0F0] dark:text-[#111111]">
              {t('product.new')}
            </span>
          )}
          {outOfStock && (
            <span className="rounded bg-[#555555] px-2 py-0.5 text-xs font-bold uppercase text-white">
              {t('product.soldOut')}
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={onToggleWishlist}
          aria-label="Toggle wishlist"
          className={cn(
            'absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition-all hover:scale-110 dark:bg-black/60',
            inWishlist ? 'text-brand' : 'text-[#555555] dark:text-[#999999]',
          )}
        >
          <Heart className={cn('h-4 w-4', inWishlist && 'fill-brand')} />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={quickAdd}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded bg-brand py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:bg-[#555555]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {outOfStock
              ? t('product.soldOut')
              : hasVariants
                ? t('product.options')
                : t('product.quickAdd')}
          </button>
          <span className="flex items-center justify-center rounded bg-white p-2 text-[#111111] shadow-sm dark:bg-[#1A1A1A] dark:text-white">
            <Eye className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[11px] uppercase tracking-wide text-[#999999]">
          {product.brand?.name || product.category?.name}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand dark:group-hover:text-brand-light">
          {product.name}
        </h3>
        <div className="mt-1.5">
          <RatingStars rating={product.ratings} count={product.reviewCount} />
        </div>
        <div className="mt-2">
          <PriceTag product={product} />
        </div>
      </div>
    </Link>
  );
}
