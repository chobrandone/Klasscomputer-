import Link from 'next/link';
import type { TranslationKey } from '@/lib/i18n';
import type { Product } from '@/lib/types';
import { T } from '@/components/layout/i18n-ui';
import { ProductCard } from '@/components/product/product-card';

/** Horizontal scrollable product row with a section header. */
export function ProductRow({
  titleKey,
  subtitleKey,
  products,
  href,
}: {
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
  products: Product[];
  href?: string;
}) {
  if (!products.length) return null;

  return (
    <section className="container-klass mt-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="section-title">
            <T k={titleKey} />
          </h2>
          {subtitleKey && (
            <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
              <T k={subtitleKey} />
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="text-sm font-semibold text-brand hover:underline dark:text-brand-light"
          >
            <T k="common.viewAll" /> →
          </Link>
        )}
      </div>
      <div className="scroll-row -mx-1 flex gap-4 overflow-x-auto px-1 pb-3">
        {products.map((product) => (
          <div key={product.id} className="w-56 shrink-0 sm:w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Static product grid with a section header. */
export function ProductGridSection({
  titleKey,
  subtitleKey,
  products,
  href,
  columns = 4,
}: {
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
  products: Product[];
  href?: string;
  columns?: 4 | 5;
}) {
  if (!products.length) return null;

  return (
    <section className="container-klass mt-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="section-title">
            <T k={titleKey} />
          </h2>
          {subtitleKey && (
            <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
              <T k={subtitleKey} />
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="text-sm font-semibold text-brand hover:underline dark:text-brand-light"
          >
            <T k="common.viewAll" /> →
          </Link>
        )}
      </div>
      <div
        className={
          columns === 5
            ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'
            : 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
