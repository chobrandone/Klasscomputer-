'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Banner } from '@/lib/types';
import 'swiper/css';
import 'swiper/css/pagination';

export function HeroSlider({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;

  return (
    <section className="container-klass mt-4">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        className="overflow-hidden rounded-lg"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative flex min-h-[320px] items-center overflow-hidden bg-[#0A0A0A] sm:min-h-[420px] lg:min-h-[480px]">
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority
                  className="object-cover opacity-50"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 max-w-xl px-6 py-12 sm:px-12">
                {banner.tag && (
                  <span className="mb-4 inline-block rounded-full border border-brand-light/60 bg-brand/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-brand-light backdrop-blur">
                    {banner.tag}
                  </span>
                )}
                <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link && (
                  <Link href={banner.link} className="btn-primary mt-7 !px-7 !py-3">
                    {banner.ctaLabel || 'Shop Now'} →
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
