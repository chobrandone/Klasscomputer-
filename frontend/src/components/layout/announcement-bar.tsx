'use client';

import { X } from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';

export function AnnouncementBar() {
  const { announcementDismissed, dismissAnnouncement } = useUiStore();
  if (announcementDismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-brand text-white">
      <div className="container-klass flex items-center justify-center gap-3 py-2 text-center text-xs font-medium sm:text-sm">
        <span>🚚 Free shipping on all orders above 50,000 XAF</span>
        <button
          onClick={dismissAnnouncement}
          aria-label="Dismiss announcement"
          className="absolute right-3 rounded p-1 transition-colors hover:bg-white/20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
