'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatDate, formatXAF, ORDER_STATUS_COLORS } from '@/lib/utils';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api<Order[]>('/orders/my').then(setOrders).catch(() => setOrders([]));
  }, []);

  if (!orders) {
    return <p className="text-sm text-[#999999]">Loading orders…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card-klass mt-6 p-10 text-center">
          <p className="font-bold">No orders yet</p>
          <Link href="/shop" className="btn-primary mt-4">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-klass p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono font-bold">{order.orderNumber}</p>
                  <p className="text-xs text-[#999999]">Placed {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ORDER_STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-extrabold text-brand dark:text-brand-light">
                    {formatXAF(order.total)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-14 w-14 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]"
                    title={`${item.productName} ×${item.quantity}`}
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="56px" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3 text-sm">
                <Link
                  href={`/order-tracking?order=${order.orderNumber}&email=${encodeURIComponent(order.email)}`}
                  className="font-semibold text-brand hover:underline dark:text-brand-light"
                >
                  Track order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
