import type { Product } from '@/lib/types';
import { cn, effectivePrice, formatXAF } from '@/lib/utils';

export function PriceTag({
  product,
  size = 'sm',
}: {
  product: Pick<Product, 'price' | 'salePrice' | 'isSale'>;
  size?: 'sm' | 'lg';
}) {
  const onSale = product.isSale && product.salePrice;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span
        className={cn(
          'font-bold text-brand dark:text-brand-light',
          size === 'lg' ? 'text-2xl' : 'text-sm sm:text-base',
        )}
      >
        {formatXAF(effectivePrice(product))}
      </span>
      {onSale && (
        <span
          className={cn(
            'text-[#999999] line-through',
            size === 'lg' ? 'text-base' : 'text-xs',
          )}
        >
          {formatXAF(product.price)}
        </span>
      )}
    </div>
  );
}
