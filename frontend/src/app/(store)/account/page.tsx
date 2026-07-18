'use client';

import { Heart, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatDate, formatXAF, ORDER_STATUS_COLORS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useT } from '@/components/layout/i18n-ui';

export default function AccountDashboard() {
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { t, tStatus } = useT();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api<Order[]>('/orders/my').then(setOrders).catch(() => undefined);
  }, []);

  const totalSpend = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t('account.hello')}, {user?.firstName} 👋</h1>
      <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
        {t('account.snapshot')}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card-klass p-5">
          <Package className="h-6 w-6 text-brand dark:text-brand-light" />
          <p className="mt-2 text-2xl font-extrabold">{orders.length}</p>
          <p className="text-sm text-[#555555] dark:text-[#999999]">{t('account.ordersPlaced')}</p>
        </div>
        <div className="card-klass p-5">
          <ShoppingBag className="h-6 w-6 text-brand dark:text-brand-light" />
          <p className="mt-2 text-2xl font-extrabold">{formatXAF(totalSpend)}</p>
          <p className="text-sm text-[#555555] dark:text-[#999999]">{t('account.totalSpend')}</p>
        </div>
        <div className="card-klass p-5">
          <Heart className="h-6 w-6 text-brand dark:text-brand-light" />
          <p className="mt-2 text-2xl font-extrabold">{wishlistCount}</p>
          <p className="text-sm text-[#555555] dark:text-[#999999]">{t('account.wishlistItems')}</p>
        </div>
      </div>

      <div className="card-klass mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#F5F5F5] px-5 py-4 dark:border-[#2A2A2A]">
          <h2 className="font-bold">{t('account.recentOrders')}</h2>
          <Link href="/account/orders" className="text-sm font-semibold text-brand dark:text-brand-light">
            {t('common.viewAll')} →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-[#999999]">{t('account.noOrders')}</p>
        ) : (
          <div className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                <span className="font-mono font-semibold">{order.orderNumber}</span>
                <span className="text-[#999999]">{formatDate(order.createdAt)}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
                >
                  {tStatus(order.status)}
                </span>
                <span className="font-bold">{formatXAF(order.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
