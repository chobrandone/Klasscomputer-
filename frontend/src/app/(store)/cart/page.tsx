'use client';

import { Minus, Plus, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatXAF } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useT } from '@/components/layout/i18n-ui';

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING = 2500;

export default function CartPage() {
  const { items, updateQuantity, remove, clear } = useCartStore();
  const { t } = useT();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [validating, setValidating] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discount = coupon?.discount || 0;
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal - discount + shipping;

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const result = await api('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      setCoupon({ code: result.code, discount: result.discount });
      // Remember for checkout
      sessionStorage.setItem('klass-coupon', result.code);
      toast.success(`Coupon applied: -${formatXAF(result.discount)}`);
    } catch (error: any) {
      setCoupon(null);
      sessionStorage.removeItem('klass-coupon');
      toast.error(error.message || 'Invalid coupon');
    } finally {
      setValidating(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-klass flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingCart className="h-16 w-16 text-[#E0E0E0] dark:text-[#2A2A2A]" />
        <h1 className="text-2xl font-extrabold">{t('cart.empty')}</h1>
        <p className="text-sm text-[#555555] dark:text-[#999999]">{t('cart.emptyHint')}</p>
        <Link href="/shop" className="btn-primary mt-2">
          {t('cart.startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-klass py-10">
      <h1 className="mb-8 text-2xl font-extrabold sm:text-3xl">{t('cart.title')}</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="card-klass divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]"
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-semibold hover:text-brand dark:hover:text-brand-light"
                    >
                      {item.name}
                    </Link>
                    {item.variantSelection && Object.keys(item.variantSelection).length > 0 && (
                      <p className="mt-0.5 text-xs text-[#999999]">
                        {Object.entries(item.variantSelection)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[#999999]">{formatXAF(item.unitPrice)} each</p>
                  </div>
                  <button
                    onClick={() => remove(item.key)}
                    aria-label="Remove"
                    className="p-1 text-[#999999] hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded border border-[#E0E0E0] dark:border-[#2A2A2A]">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="p-2 hover:text-brand"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="p-2 hover:text-brand"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-brand dark:text-brand-light">
                    {formatXAF(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between p-4">
            <button onClick={clear} className="text-sm text-[#999999] hover:text-brand">
              {t('cart.clearCart')}
            </button>
            <Link href="/shop" className="text-sm font-semibold text-brand dark:text-brand-light">
              {t('cart.continueShopping')} →
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="card-klass h-fit p-6">
          <h2 className="text-lg font-bold">{t('cart.orderSummary')}</h2>

          <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t('cart.couponPlaceholder')}
                className="input-klass !pl-9"
              />
            </div>
            <button type="submit" disabled={validating} className="btn-outline shrink-0 !px-4">
              {t('common.apply')}
            </button>
          </form>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#555555] dark:text-[#999999]">{t('common.subtotal')}</span>
              <span className="font-semibold">{formatXAF(subtotal)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>
                  {t('common.discount')} ({coupon.code})
                </span>
                <span>-{formatXAF(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#555555] dark:text-[#999999]">
                {t('common.estimatedShipping')}
              </span>
              <span className="font-semibold">
                {shipping === 0 ? (
                  <span className="text-green-600 dark:text-green-400">{t('common.free')}</span>
                ) : (
                  formatXAF(shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#E0E0E0] pt-3 text-base font-extrabold dark:border-[#2A2A2A]">
              <span>{t('common.total')}</span>
              <span className="text-brand dark:text-brand-light">{formatXAF(total)}</span>
            </div>
          </div>

          <Link href="/checkout" className="btn-primary mt-6 w-full !py-3">
            {t('cart.proceedToCheckout')} →
          </Link>
          <p className="mt-3 text-center text-xs text-[#999999]">{t('cart.secureCheckout')}</p>
        </div>
      </div>
    </div>
  );
}
