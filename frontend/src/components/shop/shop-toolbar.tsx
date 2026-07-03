'use client';

import { LayoutGrid, List } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
];

export function ShopToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') || 'popularity';
  const view = searchParams.get('view') || 'grid';

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== 'view') params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-3 dark:border-[#2A2A2A] dark:bg-[#141414]">
      <p className="text-sm text-[#555555] dark:text-[#999999]">
        <span className="font-bold text-black dark:text-white">{total}</span> products found
      </p>
      <div className="flex items-center gap-3">
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="input-klass !w-auto !py-2 text-xs"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <div className="flex overflow-hidden rounded border border-[#E0E0E0] dark:border-[#2A2A2A]">
          <button
            onClick={() => setParam('view', 'grid')}
            aria-label="Grid view"
            className={cn(
              'p-2 transition-colors',
              view === 'grid'
                ? 'bg-brand text-white'
                : 'bg-white text-[#555555] hover:text-brand dark:bg-[#1A1A1A] dark:text-[#999999]',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setParam('view', 'list')}
            aria-label="List view"
            className={cn(
              'p-2 transition-colors',
              view === 'list'
                ? 'bg-brand text-white'
                : 'bg-white text-[#555555] hover:text-brand dark:bg-[#1A1A1A] dark:text-[#999999]',
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
