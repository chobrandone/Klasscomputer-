'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { cn, formatDate, formatXAF, ORDER_STATUS_COLORS } from '@/lib/utils';
import { useT } from '@/components/layout/i18n-ui';

const STATUSES = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { t, tStatus } = useT();
  const [data, setData] = useState<{ items: Order[]; total: number; pages: number } | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (from) params.set('from', from);
    if (to) params.set('to', to + 'T23:59:59');
    api(`/orders?${params}`).then(setData).catch(() => undefined);
  }, [page, status, search, from, to]);

  useEffect(load, [load]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{t('admin.orders')}</h1>

      <div className="card-klass flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('admin.searchOrders')}
            className="input-klass !pl-9"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-klass !w-auto">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? tStatus(s) : t('admin.allStatuses')}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-klass !w-auto" />
        <span className="text-[#999999]">→</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-klass !w-auto" />
      </div>

      <div className="card-klass overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-left text-xs uppercase tracking-wide text-[#999999] dark:border-[#2A2A2A]">
              <th className="p-3">{t('admin.order')}</th>
              <th className="p-3">{t('admin.customer')}</th>
              <th className="p-3">{t('common.date')}</th>
              <th className="p-3">{t('admin.items')}</th>
              <th className="p-3">{t('admin.payment')}</th>
              <th className="p-3">{t('common.status')}</th>
              <th className="p-3 text-right">{t('common.total')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {(data?.items || []).map((order) => (
              <tr key={order.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#141414]">
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold text-brand hover:underline dark:text-brand-light">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-3">
                  <p className="font-semibold">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : t('admin.guest')}
                  </p>
                  <p className="text-xs text-[#999999]">{order.email}</p>
                </td>
                <td className="p-3 text-[#555555] dark:text-[#999999]">{formatDate(order.createdAt)}</td>
                <td className="p-3">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="p-3">
                  <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  <span
                    className={cn(
                      'ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                    {tStatus(order.status)}
                  </span>
                </td>
                <td className="p-3 text-right font-bold">{formatXAF(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.items.length === 0 && (
          <p className="p-8 text-center text-sm text-[#999999]">{t('shop.noProducts')}</p>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'h-9 w-9 rounded text-sm font-semibold',
                p === page ? 'bg-brand text-white' : 'border border-[#E0E0E0] dark:border-[#2A2A2A]',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
