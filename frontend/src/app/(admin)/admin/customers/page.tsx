'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatXAF } from '@/lib/utils';
import { useT } from '@/components/layout/i18n-ui';

interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const { t } = useT();

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api<CustomerRow[]>(`/users${params}`).then(setCustomers).catch(() => undefined);
  }, [search]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{t('admin.customers')}</h1>

      <div className="card-klass p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.searchCustomers')}
            className="input-klass !pl-9"
          />
        </div>
      </div>

      <div className="card-klass overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-left text-xs uppercase tracking-wide text-[#999999] dark:border-[#2A2A2A]">
              <th className="p-3">{t('admin.customer')}</th>
              <th className="p-3">{t('common.phone')}</th>
              <th className="p-3">{t('admin.role')}</th>
              <th className="p-3">{t('admin.joined')}</th>
              <th className="p-3 text-right">{t('admin.orders')}</th>
              <th className="p-3 text-right">{t('account.totalSpend')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#141414]">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {customer.firstName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-xs text-[#999999]">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-[#555555] dark:text-[#999999]">{customer.phone || '—'}</td>
                <td className="p-3">
                  <span className="rounded bg-[#F5F5F5] px-2 py-0.5 text-xs font-semibold capitalize dark:bg-[#2A2A2A]">
                    {customer.role}
                  </span>
                </td>
                <td className="p-3 text-[#555555] dark:text-[#999999]">{formatDate(customer.createdAt)}</td>
                <td className="p-3 text-right font-semibold">{customer.orderCount}</td>
                <td className="p-3 text-right font-bold text-brand dark:text-brand-light">
                  {formatXAF(customer.totalSpend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="p-8 text-center text-sm text-[#999999]">{t('shop.noProducts')}</p>
        )}
      </div>
    </div>
  );
}
