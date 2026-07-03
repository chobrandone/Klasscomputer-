import Image from 'next/image';
import Link from 'next/link';
import type { Banner } from '@/lib/types';

export function PromoBanner({ banner }: { banner?: Banner }) {
  if (!banner) return null;

  return (
    <section className="container-klass mt-14">
      <div className="relative flex min-h-[220px] items-center overflow-hidden rounded-lg bg-[#0A0A0A] sm:min-h-[280px]">
        {banner.image && (
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover opacity-40"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand/60 via-black/50 to-transparent" />
        <div className="relative z-10 px-6 py-10 sm:px-12">
          {banner.tag && (
            <span className="text-xs font-bold uppercase tracking-widest text-brand-light">
              {banner.tag}
            </span>
          )}
          <h2 className="mt-2 max-w-lg text-2xl font-extrabold text-white sm:text-3xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-2 max-w-md text-sm text-white/80">{banner.subtitle}</p>
          )}
          {banner.link && (
            <Link href={banner.link} className="btn-primary mt-5">
              {banner.ctaLabel || 'Shop Now'} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
