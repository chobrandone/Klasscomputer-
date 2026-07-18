'use client';

import { LayoutDashboard, LogOut, Package, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { TranslationKey } from '@/lib/i18n';
import { useT } from '@/components/layout/i18n-ui';

const links: { href: string; label: TranslationKey; icon: any }[] = [
  { href: '/account', label: 'account.dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'account.myOrders', icon: Package },
  { href: '/account/settings', label: 'account.settings', icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialized, logout } = useAuthStore();
  const { t } = useT();

  useEffect(() => {
    if (initialized && !user) router.replace('/login?next=' + pathname);
  }, [initialized, user, router, pathname]);

  if (!initialized || !user) {
    return (
      <div className="container-klass py-24 text-center text-sm text-[#999999]">
        {t('account.loadingAccount')}
      </div>
    );
  }

  return (
    <div className="container-klass grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="card-klass h-fit p-4">
        <div className="mb-4 flex items-center gap-3 border-b border-[#F5F5F5] px-2 pb-4 dark:border-[#2A2A2A]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white">
            {user.firstName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-[#999999]">{user.email}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-brand/10 text-brand dark:text-brand-light'
                  : 'text-[#555555] hover:bg-[#F5F5F5] dark:text-[#999999] dark:hover:bg-[#141414]',
              )}
            >
              <link.icon className="h-4 w-4" /> {t(link.label)}
            </Link>
          ))}
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#141414]"
          >
            <LogOut className="h-4 w-4" /> {t('auth.signOut')}
          </button>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
