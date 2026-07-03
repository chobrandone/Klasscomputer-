'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ReviewsSection } from './reviews-section';

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const specs = product.specifications || {};

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'specs' as const, label: 'Specifications' },
    { id: 'reviews' as const, label: `Reviews (${product.reviewCount})` },
  ];

  return (
    <div className="mt-14">
      <div className="flex gap-1 border-b border-[#E0E0E0] dark:border-[#2A2A2A]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
              tab === t.id
                ? 'border-brand text-brand dark:text-brand-light'
                : 'border-transparent text-[#555555] hover:text-black dark:text-[#999999] dark:hover:text-white',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === 'description' && (
          <div
            className="prose-klass max-w-3xl"
            dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
          />
        )}

        {tab === 'specs' && (
          <div className="max-w-2xl overflow-hidden rounded-lg border border-[#E0E0E0] dark:border-[#2A2A2A]">
            {Object.keys(specs).length === 0 ? (
              <p className="p-5 text-sm text-[#999999]">No specifications listed.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([key, value], i) => (
                    <tr
                      key={key}
                      className={i % 2 === 0 ? 'bg-[#F5F5F5] dark:bg-[#141414]' : ''}
                    >
                      <td className="w-1/3 px-5 py-3 font-semibold">{key}</td>
                      <td className="px-5 py-3 text-[#555555] dark:text-[#999999]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'reviews' && <ReviewsSection productId={product.id} />}
      </div>
    </div>
  );
}
