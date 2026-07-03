'use client';

import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  Tag,
  TicketPercent,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/brands', label: 'Brands', icon: Store },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialized, logout } = useAuthStore();

  const isAdmin = user && ['admin', 'superadmin'].includes(user.role);

  useEffect(() => {
    if (initialized && !isAdmin) router.replace('/login?next=/admin');
  }, [initialized, isAdmin, router]);

  if (!initialized || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#999999] dark:bg-[#0A0A0A]">
        Checking permissions…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] dark:bg-[#0A0A0A]">
      {/* Sidebar — always dark with red active states */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col bg-[#111111] lg:w-60">
        <Link href="/admin" className="flex h-16 items-center justify-center px-4 lg:justify-start">
          <span className="hidden text-lg font-extrabold text-white lg:block">
            KLASS<span className="text-brand-light">ADMIN</span>
          </span>
          <span className="text-lg font-extrabold text-brand-light lg:hidden">K</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
          {links.map((link) => {
            const active =
              link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand text-white'
                    : 'text-[#999999] hover:bg-white/5 hover:text-white',
                )}
              >
                <link.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                <span className="hidden lg:block">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-2.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-[#999999] transition-colors hover:bg-white/5 hover:text-white"
          >
            <Store style={{ width: 18, height: 18 }} />
            <span className="hidden lg:block">View Store</span>
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-[#999999] transition-colors hover:bg-white/5 hover:text-brand-light"
          >
            <LogOut style={{ width: 18, height: 18 }} />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-16 flex-1 lg:ml-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E0E0E0] bg-white px-6 dark:border-[#2A2A2A] dark:bg-[#141414]">
          <p className="text-sm text-[#555555] dark:text-[#999999]">
            Signed in as <span className="font-bold text-black dark:text-white">{user.firstName}</span>{' '}
            <span className="rounded bg-brand/10 px-1.5 py-0.5 text-xs font-semibold text-brand dark:text-brand-light">
              {user.role}
            </span>
          </p>
          <ThemeToggle />
        </header>
        <main className="p-6">{children}</main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
