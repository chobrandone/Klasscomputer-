'use client';

import { useT } from '@/components/layout/i18n-ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-[#0A0A0A]">
      <p className="text-7xl">⚡</p>
      <h1 className="mt-4 text-2xl font-extrabold text-black dark:text-white">
        {t('error.title')}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#555555] dark:text-[#999999]">
        {t('error.hint')}
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        {t('error.tryAgain')}
      </button>
    </div>
  );
}
