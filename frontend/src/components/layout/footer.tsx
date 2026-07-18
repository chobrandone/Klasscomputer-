'use client';

import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import type { TranslationKey } from '@/lib/i18n';
import { useT } from './i18n-ui';

const columns: { title: TranslationKey; links: { label: TranslationKey; href: string }[] }[] = [
  {
    title: 'footer.support',
    links: [
      { label: 'footer.contactUs', href: '/contact' },
      { label: 'footer.faqs', href: '/faqs' },
      { label: 'footer.orderTracking', href: '/order-tracking' },
      { label: 'footer.shippingReturns', href: '/faqs' },
    ],
  },
  {
    title: 'footer.quickLinks',
    links: [
      { label: 'footer.shopAll', href: '/shop' },
      { label: 'footer.laptops', href: '/category/laptops' },
      { label: 'footer.desktops', href: '/category/desktops' },
      { label: 'nav.blog', href: '/blog' },
    ],
  },
  {
    title: 'footer.legal',
    links: [
      { label: 'footer.aboutUs', href: '/about' },
      { label: 'footer.privacy', href: '/about' },
      { label: 'footer.terms', href: '/about' },
      { label: 'footer.warrantyPolicy', href: '/faqs' },
    ],
  },
];

export function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-[#E0E0E0] bg-[#0A0A0A] text-[#F0F0F0] dark:border-[#2A2A2A]">
      <div className="container-klass grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="text-white">KLASS</span>
            <span className="text-brand-light">COMPUTER</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#999999]">
            {t('footer.tagline')}
          </p>
          <div className="mt-5 space-y-2 text-sm text-[#999999]">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-light" /> Akwa, Douala — Cameroun
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-light" /> +237 670 000 000
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-light" /> hello@klasscomputer.cm
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="rounded-full border border-[#2A2A2A] p-2 text-[#999999] transition-colors hover:border-brand-light hover:text-brand-light"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {t(col.title)}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#999999] transition-colors hover:text-brand-light"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2A2A2A]">
        <div className="container-klass flex flex-col items-center justify-between gap-3 py-5 text-xs text-[#999999] sm:flex-row">
          <p>© {new Date().getFullYear()} Klass Computer. {t('footer.rights')}</p>
          <div className="flex items-center gap-2 font-semibold uppercase tracking-wide">
            <span className="rounded border border-[#2A2A2A] px-2 py-1">Visa</span>
            <span className="rounded border border-[#2A2A2A] px-2 py-1">Mastercard</span>
            <span className="rounded border border-[#2A2A2A] px-2 py-1">MTN MoMo</span>
            <span className="rounded border border-[#2A2A2A] px-2 py-1">Orange Money</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
