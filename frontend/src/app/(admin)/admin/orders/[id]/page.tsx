'use client';

import { CheckCircle2, Printer } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatDate, formatXAF, ORDER_STATUS_COLORS } from '@/lib/utils';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api<Order>(`/orders/${id}`)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
        setTrackingNumber(o.trackingNumber || '');
      })
      .catch(() => toast.error('Order not found'));
  }, [id]);

  useEffect(load, [load]);

  async function saveStatus() {
    setSaving(true);
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, trackingNumber: trackingNumber || undefined }),
      });
      toast.success('Status updated — customer notified by email');
      load();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!order) return <div className="card-klass h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-mono text-2xl font-extrabold">{order.orderNumber}</h1>
          <p className="text-sm text-[#999999]">Placed {formatDate(order.createdAt)}</p>
        </div>
        <button onClick={() => window.print()} className="btn-outline">
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Items */}
          <div className="card-klass overflow-hidden">
            <h2 className="border-b border-[#F5F5F5] px-5 py-4 font-bold dark:border-[#2A2A2A]">
              Items ({order.items.length})
            </h2>
            <div className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]">
                    {item.image && (
                      <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.productName}</p>
                    {item.variantSelection && Object.keys(item.variantSelection).length > 0 && (
                      <p className="text-xs text-[#999999]">
                        {Object.entries(item.variantSelection).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-[#999999]">
                    {formatXAF(item.unitPrice)} × {item.quantity}
                  </p>
                  <p className="w-28 text-right font-bold">{formatXAF(item.lineTotal)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-[#E0E0E0] px-5 py-4 text-sm dark:border-[#2A2A2A]">
              <div className="flex justify-between"><span className="text-[#999999]">Subtotal</span><span>{formatXAF(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatXAF(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-[#999999]">Shipping</span><span>{order.shippingFee ? formatXAF(order.shippingFee) : 'Free'}</span></div>
              <div className="flex justify-between border-t border-[#E0E0E0] pt-2 text-base font-extrabold dark:border-[#2A2A2A]">
                <span>Total</span>
                <span className="text-brand dark:text-brand-light">{formatXAF(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card-klass p-5 print:hidden">
            <h2 className="mb-4 font-bold">Status Timeline</h2>
            <div className="space-y-3">
              {(order.statusHistory || []).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-brand dark:text-brand-light" style={{ width: 18, height: 18 }} />
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ORDER_STATUS_COLORS[entry.status] || ''}`}>
                    {entry.status}
                  </span>
                  <span className="text-xs text-[#999999]">
                    {new Date(entry.at).toLocaleString('en-GB')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status update */}
          <div className="card-klass space-y-3 p-5 print:hidden">
            <h2 className="font-bold">Update Status</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-klass capitalize">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking number (optional)"
              className="input-klass"
            />
            <button onClick={saveStatus} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save & Notify Customer'}
            </button>
          </div>

          {/* Customer */}
          <div className="card-klass p-5 text-sm">
            <h2 className="mb-3 font-bold">Customer</h2>
            <p className="font-semibold">
              {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest checkout'}
            </p>
            <p className="text-[#555555] dark:text-[#999999]">{order.email}</p>
          </div>

          {/* Shipping */}
          <div className="card-klass p-5 text-sm">
            <h2 className="mb-3 font-bold">Shipping Address</h2>
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-[#555555] dark:text-[#999999]">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p className="text-[#555555] dark:text-[#999999]">{order.shippingAddress.line2}</p>
            )}
            <p className="text-[#555555] dark:text-[#999999]">
              {order.shippingAddress.city}
              {order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ''} — {order.shippingAddress.country}
            </p>
            {order.shippingAddress.phone && (
              <p className="mt-1 text-[#555555] dark:text-[#999999]">📞 {order.shippingAddress.phone}</p>
            )}
          </div>

          {/* Payment */}
          <div className="card-klass p-5 text-sm">
            <h2 className="mb-3 font-bold">Payment</h2>
            <p className="capitalize">{order.paymentMethod.replace('_', ' ')}</p>
            <p className="mt-1">
              Status:{' '}
              <span className={order.paymentStatus === 'paid' ? 'font-bold text-green-600 dark:text-green-400' : 'font-bold text-amber-600 dark:text-amber-400'}>
                {order.paymentStatus}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
