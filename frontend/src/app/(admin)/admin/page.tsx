'use client';

import { AlertTriangle, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '@/lib/api';
import { cn, formatDate, formatXAF, ORDER_STATUS_COLORS } from '@/lib/utils';
import { useT } from '@/components/layout/i18n-ui';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [chart, setChart] = useState<any[]>([]);
  const [range, setRange] = useState<'daily' | 'monthly'>('daily');
  const { t, tStatus } = useT();

  useEffect(() => {
    api('/analytics/dashboard').then(setData).catch(() => undefined);
  }, []);

  useEffect(() => {
    api(`/analytics/sales-chart?range=${range}`).then(setChart).catch(() => undefined);
  }, [range]);

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-klass h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const kpis = [
    { icon: TrendingUp, label: t('admin.revenue'), value: formatXAF(data.kpis.totalRevenue) },
    { icon: ShoppingCart, label: t('admin.totalOrders'), value: data.kpis.totalOrders },
    { icon: Users, label: t('admin.newCustomers'), value: data.kpis.newCustomers },
    { icon: Package, label: t('admin.inStock'), value: data.kpis.productsInStock },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t('admin.dashboard')}</h1>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card-klass p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#999999]">
                {kpi.label}
              </p>
              <kpi.icon className="h-5 w-5 text-brand dark:text-brand-light" />
            </div>
            <p className="mt-3 text-2xl font-extrabold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="card-klass p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">{t('admin.sales')}</h2>
          <div className="flex overflow-hidden rounded border border-[#E0E0E0] text-xs dark:border-[#2A2A2A]">
            {(['daily', 'monthly'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-3 py-1.5 font-semibold',
                  range === r ? 'bg-brand text-white' : 'text-[#555555] dark:text-[#999999]',
                )}
              >
                {r === 'daily' ? t('admin.last30') : t('admin.last12')}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E033" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} width={80} />
              <Tooltip
                formatter={(value: any, name: any) =>
                  name === 'revenue' ? [formatXAF(Number(value)), 'Revenue'] : [value, 'Orders']
                }
              />
              <Line type="monotone" dataKey="revenue" stroke="#CC0000" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="card-klass overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#F5F5F5] px-5 py-4 dark:border-[#2A2A2A]">
            <h2 className="font-bold">{t('admin.recentOrders')}</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand dark:text-brand-light">
              {t('common.viewAll')} →
            </Link>
          </div>
          <div className="divide-y divide-[#F5F5F5] text-sm dark:divide-[#2A2A2A]">
            {data.recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-[#F5F5F5] dark:hover:bg-[#141414]"
              >
                <span className="font-mono text-xs font-semibold">{order.orderNumber}</span>
                <span className="hidden text-xs text-[#999999] sm:block">
                  {formatDate(order.createdAt)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
                >
                  {tStatus(order.status)}
                </span>
                <span className="font-bold">{formatXAF(order.total)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Top products */}
          <div className="card-klass overflow-hidden">
            <h2 className="border-b border-[#F5F5F5] px-5 py-4 font-bold dark:border-[#2A2A2A]">
              {t('admin.topProducts')}
            </h2>
            <div className="divide-y divide-[#F5F5F5] text-sm dark:divide-[#2A2A2A]">
              {data.topProducts.map((product: any, i: number) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 font-extrabold text-brand dark:text-brand-light">#{i + 1}</span>
                  <span className="flex-1 truncate">{product.name}</span>
                  <span className="text-xs text-[#999999]">{product.soldCount} {t('admin.sold')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="card-klass overflow-hidden">
            <h2 className="flex items-center gap-2 border-b border-[#F5F5F5] px-5 py-4 font-bold dark:border-[#2A2A2A]">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> {t('admin.lowStock')}
            </h2>
            <div className="divide-y divide-[#F5F5F5] text-sm dark:divide-[#2A2A2A]">
              {data.lowStock.length === 0 ? (
                <p className="px-5 py-4 text-[#999999]">{t('admin.allStocked')}</p>
              ) : (
                data.lowStock.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between px-5 py-3">
                    <span className="flex-1 truncate">{product.name}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-bold',
                        product.stock === 0
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                      )}
                    >
                      {product.stock} {t('admin.left')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
