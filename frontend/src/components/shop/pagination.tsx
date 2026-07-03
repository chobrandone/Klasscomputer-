'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pages <= 1) return null;

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(target));
    router.push(`${pathname}?${params.toString()}`);
  }

  const visible = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );
  const withDots: (number | '…')[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) withDots.push('…');
    withDots.push(p);
  });

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="rounded border border-[#E0E0E0] p-2 transition-colors hover:border-brand hover:text-brand disabled:opacity-40 dark:border-[#2A2A2A]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {withDots.map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="px-2 text-[#999999]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={cn(
              'h-9 w-9 rounded text-sm font-semibold transition-colors',
              p === page
                ? 'bg-brand text-white'
                : 'border border-[#E0E0E0] hover:border-brand hover:text-brand dark:border-[#2A2A2A]',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="rounded border border-[#E0E0E0] p-2 transition-colors hover:border-brand hover:text-brand disabled:opacity-40 dark:border-[#2A2A2A]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
