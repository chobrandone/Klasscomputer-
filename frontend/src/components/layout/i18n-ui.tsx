'use client';

import { useEffect } from 'react';
import { translate, translateStatus, type TranslationKey } from '@/lib/i18n';
import { useLanguageStore } from '@/stores/language-store';

/** Hook: returns the translator bound to the current language. */
export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return {
    lang,
    t: (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    tStatus: (status: string) => translateStatus(lang, status),
  };
}

/** Inline translated text — usable inside server components. */
export function T({
  k,
  vars,
}: {
  k: TranslationKey;
  vars?: Record<string, string | number>;
}) {
  const { t } = useT();
  return <>{t(k, vars)}</>;
}

/** Restores the saved language on first load. */
export function LanguageInit() {
  const setLang = useLanguageStore((s) => s.setLang);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('klass-lang');
      if (saved === 'fr' || saved === 'en') setLang(saved);
    } catch {
      /* ignore */
    }
  }, [setLang]);
  return null;
}

/** EN / FR switch used in the store header and the admin top bar. */
export function LanguageToggle() {
  const { lang } = useT();
  const setLang = useLanguageStore((s) => s.setLang);
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
      aria-label="Switch language / Changer de langue"
      title={lang === 'en' ? 'Passer en français' : 'Switch to English'}
      className="rounded px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#1A1A1A] dark:hover:text-brand-light"
    >
      {lang === 'en' ? 'FR' : 'EN'}
    </button>
  );
}
