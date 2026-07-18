'use client';

import { CheckCircle2, Circle, PackageSearch, Truck } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn, formatDate, formatXAF } from '@/lib/utils';
import { useT } from '@/components/layout/i18n-ui';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

function TrackingContent() {
  const searchParams = useSearchParams();
  const { t, tStatus } = useT();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const track = useCallback(
    async (num: string, mail: string) => {
      if (!num) return;
      setLoading(true);
      try {
        const query = new URLSearchParams({ orderNumber: num });
        if (mail) query.set('email', mail);
        const data = await api(`/orders/track?${query.toString()}`);
        setResult(data);
      } catch (error: any) {
        setResult(null);
        toast.error(error.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const num = searchParams.get('order');
    if (num) track(num, searchParams.get('email') || '');
  }, [searchParams, track]);

  const currentStep = result ? STEPS.indexOf(result.status) : -1;

  return (
    <div className="container-klass max-w-3xl py-14">
      <div className="text-center">
        <PackageSearch className="mx-auto h-12 w-12 text-brand dark:text-brand-light" />
        <h1 className="mt-4 text-3xl font-extrabold">{t('order.trackTitle')}</h1>
        <p className="mt-2 text-sm text-[#555555] dark:text-[#999999]">
          {t('order.trackHint')}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          track(orderNumber.trim(), email.trim());
        }}
        className="card-klass mt-8 grid gap-3 p-6 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder={t('order.numberPlaceholder')}
          className="input-klass"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('common.email')}
          className="input-klass"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('order.searching') : t('order.track')}
        </button>
      </form>

      {result && (
        <div className="card-klass mt-8 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-bold">{result.orderNumber}</p>
              <p className="text-xs text-[#999999]">
                {t('order.placed')} {formatDate(result.createdAt)}
              </p>
            </div>
            <p className="text-lg font-extrabold text-brand dark:text-brand-light">
              {formatXAF(result.total)}
            </p>
          </div>

          {/* Progress steps */}
          {result.status === 'cancelled' ? (
            <p className="mt-6 rounded bg-red-50 p-4 text-sm font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {t('order.cancelled')}
            </p>
          ) : (
            <div className="mt-8 flex items-center">
              {STEPS.map((step, i) => (
                <div key={step} className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
                  <div className="flex flex-col items-center">
                    {i <= currentStep ? (
                      i === 2 && currentStep === 2 ? (
                        <Truck className="h-7 w-7 text-brand dark:text-brand-light" />
                      ) : (
                        <CheckCircle2 className="h-7 w-7 text-brand dark:text-brand-light" />
                      )
                    ) : (
                      <Circle className="h-7 w-7 text-[#E0E0E0] dark:text-[#2A2A2A]" />
                    )}
                    <span
                      className={cn(
                        'mt-1.5 text-[11px] font-semibold',
                        i <= currentStep
                          ? 'text-brand dark:text-brand-light'
                          : 'text-[#999999]',
                      )}
                    >
                      {tStatus(step)}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1 -translate-y-2.5 rounded',
                        i < currentStep ? 'bg-brand' : 'bg-[#E0E0E0] dark:bg-[#2A2A2A]',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {result.trackingNumber && (
            <p className="mt-6 rounded bg-[#F5F5F5] p-3 text-sm dark:bg-[#141414]">
              📦 {t('order.trackingNumber')}:{' '}
              <span className="font-mono font-bold">{result.trackingNumber}</span>
            </p>
          )}

          {/* Items */}
          <div className="mt-6 space-y-3 border-t border-[#E0E0E0] pt-5 dark:border-[#2A2A2A]">
            {result.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]">
                  {item.image && (
                    <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
                  )}
                </div>
                <span className="flex-1">{item.productName}</span>
                <span className="text-[#999999]">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
