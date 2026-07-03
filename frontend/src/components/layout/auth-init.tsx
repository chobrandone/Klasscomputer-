'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/** Silently restores the session from the HttpOnly cookie on first load. */
export function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
