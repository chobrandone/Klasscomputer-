'use client';

import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import type { TranslationKey } from '@/lib/i18n';
import { LanguageToggle, useT } from './i18n-ui';
import { ThemeToggle } from './theme-toggle';

const NAV_LINKS: { href: string; label: TranslationKey }[] = [
  { href: '/', label: 'nav.home' },
  { href: '/shop', label: 'nav.shop' },
  { href: '/blog', label: 'nav.blog' },
  { href: '/contact', label: 'nav.contact' },
];

export function Header({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const user = useAuthStore((s) => s.user);
  const { t } = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-[#E0E0E0] bg-white transition-shadow dark:border-[#2A2A2A] dark:bg-[#0A0A0A]',
        scrolled && 'shadow',
      )}
    >
      <div className="container-klass flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center text-xl font-extrabold tracking-tight">
          <span className="text-black dark:text-white">KLASS</span>
          <span className="text-brand">COMPUTER</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded px-3 py-2 text-sm font-medium transition-colors hover:text-brand dark:hover:text-brand-light',
                pathname === link.href
                  ? 'text-brand dark:text-brand-light'
                  : 'text-[#111111] dark:text-[#F0F0F0]',
              )}
            >
              {t(link.label)}
            </Link>
          ))}

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-[#111111] transition-colors hover:text-brand dark:text-[#F0F0F0] dark:hover:text-brand-light">
              {t('nav.categories')} <ChevronDown className="h-4 w-4" />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full w-64 rounded-lg border border-[#E0E0E0] bg-white p-2 shadow-lg dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center justify-between rounded px-3 py-2 text-sm font-semibold hover:bg-[#F5F5F5] hover:text-brand dark:hover:bg-[#141414] dark:hover:text-brand-light"
                    >
                      {cat.name}
                      <span className="text-xs text-[#999999]">{cat.productCount}</span>
                    </Link>
                    {(cat.children || []).map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="block rounded px-3 py-1.5 pl-6 text-sm text-[#555555] hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#141414] dark:hover:text-brand-light"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded px-3 py-2 text-sm font-medium transition-colors hover:text-brand dark:hover:text-brand-light',
                pathname === link.href
                  ? 'text-brand dark:text-brand-light'
                  : 'text-[#111111] dark:text-[#F0F0F0]',
              )}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded p-2 text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#1A1A1A] dark:hover:text-brand-light"
          >
            <Search className="h-5 w-5" />
          </button>
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative rounded p-2 text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#1A1A1A] dark:hover:text-brand-light"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Cart"
            onClick={() => setCartOpen(true)}
            className="relative rounded p-2 text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#1A1A1A] dark:hover:text-brand-light"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <Link
            href={user ? (user.role === 'customer' ? '/account' : '/admin') : '/login'}
            aria-label="Account"
            className="hidden rounded p-2 text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#1A1A1A] dark:hover:text-brand-light sm:block"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded p-2 text-[#555555] hover:bg-[#F5F5F5] dark:text-[#999999] dark:hover:bg-[#1A1A1A] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-[#E0E0E0] bg-white py-3 dark:border-[#2A2A2A] dark:bg-[#0A0A0A]">
          <form onSubmit={submitSearch} className="container-klass flex gap-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="input-klass"
            />
            <button type="submit" className="btn-primary shrink-0">
              {t('nav.search')}
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="border-t border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2A2A2A] dark:bg-[#0A0A0A] lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded px-3 py-2.5 text-sm font-medium hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
            >
              {t(link.label)}
            </Link>
          ))}
          <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#999999]">
            {t('nav.categories')}
          </p>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="block rounded px-3 py-2 text-sm hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href={user ? (user.role === 'customer' ? '/account' : '/admin') : '/login'}
            className="mt-2 block rounded bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            {user ? t('nav.myAccount') : t('nav.signIn')}
          </Link>
        </nav>
      )}
    </header>
  );
}
