import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

const columns = [
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Order Tracking', href: '/order-tracking' },
      { label: 'Shipping & Returns', href: '/faqs' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Shop All', href: '/shop' },
      { label: 'Laptops', href: '/category/laptops' },
      { label: 'Desktops', href: '/category/desktops' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Privacy Policy', href: '/about' },
      { label: 'Terms of Service', href: '/about' },
      { label: 'Warranty Policy', href: '/faqs' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E0E0E0] bg-[#0A0A0A] text-[#F0F0F0] dark:border-[#2A2A2A]">
      <div className="container-klass grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="text-white">KLASS</span>
            <span className="text-brand-light">COMPUTER</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#999999]">
            Your trusted computer &amp; electronics shop in Cameroon. Genuine products,
            12-month warranty and fast nationwide delivery.
          </p>
          <div className="mt-5 space-y-2 text-sm text-[#999999]">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-light" /> Akwa, Douala — Cameroon
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
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#999999] transition-colors hover:text-brand-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2A2A2A]">
        <div className="container-klass flex flex-col items-center justify-between gap-3 py-5 text-xs text-[#999999] sm:flex-row">
          <p>© {new Date().getFullYear()} Klass Computer. All rights reserved.</p>
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
