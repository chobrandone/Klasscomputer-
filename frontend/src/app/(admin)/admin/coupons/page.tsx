'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Coupon } from '@/lib/types';
import { cn, formatXAF } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    minSubtotal: '0',
    expiresAt: '',
    usageLimit: '',
  });

  const load = useCallback(() => {
    api<Coupon[]>('/coupons').then(setCoupons).catch(() => undefined);
  }, []);
  useEffect(load, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minSubtotal: Number(form.minSubtotal) || 0,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        }),
      });
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', type: 'percent', value: '', minSubtotal: '0', expiresAt: '', usageLimit: '' });
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function toggleActive(coupon: Coupon) {
    await api(`/coupons/${coupon.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !coupon.active }),
    }).catch(() => undefined);
    load();
  }

  async function remove(coupon: Coupon) {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    await api(`/coupons/${coupon.id}`, { method: 'DELETE' }).catch(() => undefined);
    toast.success('Coupon deleted');
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      <div className="card-klass overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-left text-xs uppercase tracking-wide text-[#999999] dark:border-[#2A2A2A]">
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min. Order</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#141414]">
                <td className="p-3 font-mono font-bold text-brand dark:text-brand-light">{coupon.code}</td>
                <td className="p-3 font-semibold">
                  {coupon.type === 'percent' ? `${coupon.value}%` : formatXAF(coupon.value)}
                </td>
                <td className="p-3 text-[#555555] dark:text-[#999999]">
                  {coupon.minSubtotal ? formatXAF(coupon.minSubtotal) : '—'}
                </td>
                <td className="p-3">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                </td>
                <td className="p-3 text-[#555555] dark:text-[#999999]">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-GB') : 'Never'}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-bold',
                      coupon.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-[#F5F5F5] text-[#999999] dark:bg-[#2A2A2A]',
                    )}
                  >
                    {coupon.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(coupon)} className="p-2 text-[#999999] hover:text-brand">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="card-klass w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">New Coupon</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="CODE (e.g. WELCOME10)"
              className="input-klass font-mono uppercase"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                className="input-klass"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (XAF)</option>
              </select>
              <input
                type="number"
                required
                min={1}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percent' ? '10' : '5000'}
                className="input-klass"
              />
            </div>
            <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
              Minimum order (XAF)
              <input
                type="number"
                min={0}
                value={form.minSubtotal}
                onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))}
                className="input-klass mt-1"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
                Expiry date
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="input-klass mt-1"
                />
              </label>
              <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
                Usage limit
                <input
                  type="number"
                  min={1}
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  placeholder="Unlimited"
                  className="input-klass mt-1"
                />
              </label>
            </div>
            <button type="submit" className="btn-primary w-full">Create Coupon</button>
          </form>
        </div>
      )}
    </div>
  );
}
