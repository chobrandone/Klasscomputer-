import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format whole XAF amounts: 1250000 → "1,250,000 XAF" */
export function formatXAF(amount: number) {
  return `${Number(amount || 0).toLocaleString('en-US')} XAF`;
}

export function effectivePrice(product: Pick<Product, 'price' | 'salePrice' | 'isSale'>) {
  return product.isSale && product.salePrice ? product.salePrice : product.price;
}

export function discountPercent(product: Pick<Product, 'price' | 'salePrice' | 'isSale'>) {
  if (!product.isSale || !product.salePrice) return 0;
  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};
