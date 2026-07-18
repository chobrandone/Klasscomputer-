'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useT } from '@/components/layout/i18n-ui';

function Confirmation() {
  const searchParams = useSearchParams();
  const order = searchParams.get('order');
  const email = searchParams.get('email');
  const { t } = useT();

  return (
    <div className="container-klass flex flex-col items-center py-24 text-center">
      <div className="rounded-full bg-green-100 p-5 dark:bg-green-900/30">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">{t('order.thankYou')}</h1>
      {order && (
        <p className="mt-3 text-[#555555] dark:text-[#999999]">
          {t('order.number')}:{' '}
          <span className="font-mono font-bold text-brand dark:text-brand-light">{order}</span>
        </p>
      )}
      <p className="mt-2 max-w-md text-sm text-[#555555] dark:text-[#999999]">
        {t('order.emailSent')}
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={order ? `/order-tracking?order=${order}${email ? `&email=${encodeURIComponent(email)}` : ''}` : '/order-tracking'}
          className="btn-outline"
        >
          {t('order.trackOrder')}
        </Link>
        <Link href="/shop" className="btn-primary">
          {t('cart.continueShopping')}
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
