'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { Brand, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/components/layout/i18n-ui';

export function FiltersSidebar({
  categories,
  brands,
  activeCategory,
}: {
  categories: Category[];
  brands: Brand[];
  activeCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useT();

  const selectedBrands = (searchParams.get('brand') || '').split(',').filter(Boolean);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  function toggleBrand(slug: string) {
    const next = selectedBrands.includes(slug)
      ? selectedBrands.filter((b) => b !== slug)
      : [...selectedBrands, slug];
    setParams({ brand: next.join(',') || null });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    setParams({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  }

  const activeRating = searchParams.get('rating');
  const inStock = searchParams.get('inStock') === 'true';

  return (
    <aside className="space-y-7">
      {/* Category tree */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">
          {t('nav.categories')}
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/shop"
              className={cn(
                'block rounded px-2 py-1.5 text-sm transition-colors hover:text-brand',
                !activeCategory && pathname === '/shop'
                  ? 'font-semibold text-brand dark:text-brand-light'
                  : 'text-[#555555] dark:text-[#999999]',
              )}
            >
              {t('shop.allProducts')}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/category/${cat.slug}`}
                className={cn(
                  'flex items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:text-brand',
                  activeCategory === cat.slug
                    ? 'font-semibold text-brand dark:text-brand-light'
                    : 'text-[#555555] dark:text-[#999999]',
                )}
              >
                {cat.name}
                <span className="text-xs text-[#999999]">{cat.productCount}</span>
              </Link>
              {(cat.children || []).map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className={cn(
                    'flex items-center justify-between rounded px-2 py-1 pl-5 text-sm transition-colors hover:text-brand',
                    activeCategory === child.slug
                      ? 'font-semibold text-brand dark:text-brand-light'
                      : 'text-[#555555] dark:text-[#999999]',
                  )}
                >
                  {child.name}
                  <span className="text-xs text-[#999999]">{child.productCount}</span>
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">{t('shop.brands')}</h3>
        <ul className="space-y-2">
          {brands.map((brand) => (
            <li key={brand.id}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#555555] hover:text-brand dark:text-[#999999]">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 rounded border-[#E0E0E0] accent-brand"
                />
                {brand.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">{t('shop.priceXaf')}</h3>
        <form onSubmit={applyPrice} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder={t('shop.min')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-klass !py-2 text-xs"
            />
            <span className="text-[#999999]">—</span>
            <input
              type="number"
              min={0}
              placeholder={t('shop.max')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-klass !py-2 text-xs"
            />
          </div>
          <button type="submit" className="btn-outline w-full !py-2 text-xs">
            {t('common.apply')}
          </button>
        </form>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">{t('shop.rating')}</h3>
        <ul className="space-y-1.5">
          {[4, 3, 2, 1].map((stars) => (
            <li key={stars}>
              <button
                onClick={() =>
                  setParams({ rating: activeRating === String(stars) ? null : String(stars) })
                }
                className={cn(
                  'flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]',
                  activeRating === String(stars) && 'bg-[#F5F5F5] dark:bg-[#1A1A1A]',
                )}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      'h-3.5 w-3.5',
                      s <= stars
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-[#E0E0E0] text-[#E0E0E0] dark:fill-[#2A2A2A] dark:text-[#2A2A2A]',
                    )}
                  />
                ))}
                <span className="text-xs text-[#555555] dark:text-[#999999]">
                  {t('reviews.andUp')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* In stock */}
      <div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => setParams({ inStock: inStock ? null : 'true' })}
            className="h-4 w-4 accent-brand"
          />
          {t('shop.inStockOnly')}
        </label>
      </div>
    </aside>
  );
}
