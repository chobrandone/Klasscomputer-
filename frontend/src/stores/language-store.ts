'use client';

import { create } from 'zustand';
import type { Lang } from '@/lib/i18n';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/**
 * Language preference. Initialised from localStorage by <LanguageInit /> after
 * mount (same pattern as the theme toggle) so SSR HTML always matches the
 * first client render.
 */
export const useLanguageStore = create<LanguageState>((set) => ({
  lang: 'en',
  setLang: (lang) => {
    set({ lang });
    try {
      localStorage.setItem('klass-lang', lang);
      document.documentElement.lang = lang;
    } catch {
      /* SSR / private mode */
    }
  },
}));
