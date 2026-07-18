'use client';

import Link from 'next/link';
import { useT } from '@/components/layout/i18n-ui';

export default function NotFound() {
  const { t } = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-[#0A0A0A]">
      <p className="text-7xl font-extrabold text-brand dark:text-brand-light">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-black dark:text-white">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#555555] dark:text-[#999999]">
        {t('notFound.hint')}
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-outline">
          {t('notFound.goHome')}
        </Link>
        <Link href="/shop" className="btn-primary">
          {t('notFound.browseShop')}
        </Link>
      </div>
    </div>
  );
}
